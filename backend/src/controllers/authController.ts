import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { Role } from '../generated/prisma';

/**
 * Sign up a new user with Firebase credentials
 * @param req - Express request object with user data
 * @param res - Express response object
 */
export const signup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }
    
    const { name, email, role } = req.body;
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
    
    // Create the user in our database
    const userData: {
      name: string;
      email: string;
      firebaseUid: string;
      role?: Role;
    } = {
      name,
      email,
      firebaseUid,
    };
    
    // Only set role if provided and valid
    if (role && Object.values(Role).includes(role as Role)) {
      userData.role = role as Role;
    }
    
    const newUser = await prisma.user.create({
      data: userData,
    });
    
    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

/**
 * Get the current user's profile
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
      include: {
        department: true,
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};
