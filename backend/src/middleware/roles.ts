import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import prisma from '../utils/prisma';
import { Role } from '../generated/prisma';

/**
 * Middleware to check if the user has the required role
 * @param requiredRole - The role required to access the route
 */
export const checkRole = (requiredRole: Role) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Authentication required' });
      }

      const { uid } = req.user;

      // Find the user in the database
      const user = await prisma.user.findUnique({
        where: { firebaseUid: uid },
      });

      // Check if user exists and has the required role
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role !== requiredRole && user.role !== 'ADMIN') {
        return res.status(403).json({ 
          error: 'Forbidden: Insufficient permissions',
          requiredRole,
          userRole: user.role
        });
      }

      // Add user info to request for later use
      req.user.role = user.role;
      req.user.id = user.id;

      next();
    } catch (error) {
      console.error('Error checking user role:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Middleware to check if the user has any of the allowed roles
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
export const authorizeRoles = (allowedRoles: Role[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Authentication required' });
      }

      const { uid } = req.user;

      // Find the user in the database
      const user = await prisma.user.findUnique({
        where: { firebaseUid: uid },
      });

      // Check if user exists
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Always allow admin access regardless of the allowed roles
      if (user.role === 'ADMIN') {
        req.user.role = user.role;
        req.user.id = user.id;
        return next();
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          error: 'Forbidden: Insufficient permissions',
          allowedRoles,
          userRole: user.role
        });
      }

      // Add user info to request for later use
      req.user.role = user.role;
      req.user.id = user.id;

      next();
    } catch (error) {
      console.error('Error checking user roles:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Shorthand middleware for common roles
export const requireCitizen = checkRole('CITIZEN');
export const requireGovernment = checkRole('GOVERNMENT');
export const requireAdmin = checkRole('ADMIN');
