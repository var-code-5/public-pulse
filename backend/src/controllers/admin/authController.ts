import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import prisma from '../../utils/prisma';
import { Role } from '../../generated/prisma';

/**
 * Sign up a new admin user with Firebase credentials
 * Note: This should be restricted and only used in controlled environments
 * @param req - Express request object with user data
 * @param res - Express response object
 */
export const signup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }
    
    const { name, email, adminSecret } = req.body;
    const firebaseUid = req.user.uid;
    
    // Check if admin secret is valid
    // This is a simple implementation. In a real app, use a more secure approach
    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin-secret-key';
    if (!adminSecret || adminSecret !== ADMIN_SECRET) {
      return res.status(403).json({ error: 'Invalid admin secret key' });
    }
    
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
    
    // Create the user in our database as an ADMIN
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        firebaseUid,
        role: Role.ADMIN,
      },
    });
    
    res.status(201).json({
      message: 'Admin user created successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Error during admin signup:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
};

/**
 * Get the current admin's profile
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
    
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied: Only administrators can access this endpoint' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ error: 'Failed to fetch admin profile' });
  }
};
