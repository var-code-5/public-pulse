import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import prisma from '../../utils/prisma';
import { Role } from '../../generated/prisma';

/**
 * Sign up a new government user with Firebase credentials
 * @param req - Express request object with user data
 * @param res - Express response object
 */
export const signup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }
    
    const { name, email, departmentId, profileURL } = req.body;
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
    
    if (!departmentId) {
      return res.status(400).json({ error: 'Department ID is required for government users' });
    }
    
    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    // Create the user in our database as a GOVERNMENT official
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        firebaseUid,
        profileURL,
        role: Role.GOVERNMENT,
        departmentId
      },
    });
    
    res.status(201).json({
      message: 'Government user created successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Error during government signup:', error);
    res.status(500).json({ error: 'Failed to create government user' });
  }
};

/**
 * Get the current government user's profile
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
    
    if (user.role !== 'GOVERNMENT' && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied: Only government officials can access this endpoint' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching government profile:', error);
    res.status(500).json({ error: 'Failed to fetch government profile' });
  }
};
