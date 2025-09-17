import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import prisma from '../../utils/prisma';
import { Role } from '../../generated/prisma';

/**
 * Sign up a new citizen user with Firebase credentials
 * @param req - Express request object with user data
 * @param res - Express response object
 */
export const signup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }
    
    const { name, email, profileURL } = req.body;
    const firebaseUid = req.user.uid;
    
    // Check if user already exists with this Firebase UID
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid },
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists',
        user: existingUser
      });
    }
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Create the user in our database as a CITIZEN
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        firebaseUid,
        profileURL,
        role: Role.CITIZEN
      },
    });
    
    res.status(201).json({
      message: 'Citizen user created successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Error during citizen signup:', error);
    res.status(500).json({ error: 'Failed to create citizen user' });
  }
};

/**
 * Get the current citizen's profile
 * @param req - Express request object with authenticated user
 * @param res - Express response object
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }
    
    const firebaseUid = req.user.uid;
    
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    if (user.role !== 'CITIZEN' && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied: Only citizens can access this endpoint' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching citizen profile:', error);
    res.status(500).json({ error: 'Failed to fetch citizen profile' });
  }
};
