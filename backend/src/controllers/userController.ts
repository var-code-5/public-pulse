import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { Role } from '../generated/prisma';

/**
 * Get all users (admin only)
 * @param req - Express request object
 * @param res - Express response object
 */
export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Only admins can access this resource' });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const role = req.query.role as Role | undefined;
    const departmentId = req.query.departmentId as string | undefined;
    const search = req.query.search as string | undefined;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};
    
    if (role) {
      where.role = role;
    }
    
    if (departmentId) {
      where.departmentId = departmentId;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Get users with pagination and filtering
    const users = await prisma.user.findMany({
      where,
      include: {
        department: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * Get a user by ID
 * @param req - Express request object with user ID
 * @param res - Express response object
 */
export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const { id } = req.params;

    // Regular users can only access their own profile
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to access this resource' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        department: true,
        _count: {
          select: {
            issues: true,
            comments: true,
            votes: true,
            notifications: {
              where: {
                read: false,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

/**
 * Create a new user (this might be replaced by auth signup)
 * @param req - Express request object with user data
 * @param res - Express response object
 */
export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Only admins can manually create users
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Only admins can create users manually' });
    }

    const { name, email, role, firebaseUid, departmentId } = req.body;
    
    // Validate required fields
    if (!name || !email || !firebaseUid) {
      return res.status(400).json({ error: 'Name, email, and Firebase UID are required' });
    }
    
    // Check if a user with this email or Firebase UID already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { firebaseUid },
        ],
      },
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or Firebase UID already exists' });
    }

    // Check if departmentId is valid if provided
    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });

      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }
    }

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        firebaseUid,
        role: role as Role || 'CITIZEN',
        ...(departmentId && { departmentId }),
      },
      include: {
        department: true,
      },
    });

    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

/**
 * Update a user
 * @param req - Express request object with user ID and update data
 * @param res - Express response object
 */
export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const { id } = req.params;
    const { name, email, role, departmentId } = req.body;

    // Regular users can only update their own profile and cannot change their role
    if (req.user.role !== 'ADMIN' && (req.user.id !== id || role)) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to perform this action' });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if departmentId is valid if provided
    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });

      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role && req.user.role === 'ADMIN') updateData.role = role;
    if ((departmentId || departmentId === null) && req.user.role === 'ADMIN') {
      updateData.departmentId = departmentId;
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        department: true,
      },
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

/**
 * Delete a user (admin only)
 * @param req - Express request object with user ID
 * @param res - Express response object
 */
export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Only admins can delete users' });
    }

    const { id } = req.params;

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow deletion of the last admin user
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' },
      });

      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }

    // Delete user data with Prisma transaction
    await prisma.$transaction(async (prisma) => {
      // Delete user's votes on comments and issues
      await prisma.vote.deleteMany({
        where: { userId: id },
      });

      // Delete user's notifications
      await prisma.notification.deleteMany({
        where: { userId: id },
      });

      // Delete user's status change history
      await prisma.issueStatusHistory.deleteMany({
        where: { changedById: id },
      });

      // Handle user's comments (anonymize them rather than delete)
      await prisma.user.update({
        where: { id },
        data: {
          name: 'Deleted User',
          email: null,
        },
      });

      // Finally delete the user
      await prisma.user.delete({
        where: { id },
      });
    });

    res.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

/**
 * Get a user's issues
 * @param req - Express request object with user ID
 * @param res - Express response object
 */
export const getUserIssues = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const { id } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // Regular users can only view their own issues
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to access this resource' });
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await prisma.issue.count({
      where: { authorId: id },
    });

    // Get user's issues with pagination
    const issues = await prisma.issue.findMany({
      where: { authorId: id },
      include: {
        department: true,
        images: {
          take: 1, // Just get the first image for preview
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Calculate votes for each issue
    const issuesWithVotes = await Promise.all(
      issues.map(async (issue) => {
        const upvotes = await prisma.vote.count({
          where: {
            issueId: issue.id,
            type: 'UPVOTE',
          },
        });

        const downvotes = await prisma.vote.count({
          where: {
            issueId: issue.id,
            type: 'DOWNVOTE',
          },
        });

        return {
          ...issue,
          votes: {
            upvotes,
            downvotes,
          },
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    res.json({
      issues: issuesWithVotes,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching user issues:', error);
    res.status(500).json({ error: 'Failed to fetch user issues' });
  }
};

/**
 * Get issues assigned to a government official
 * @param req - Express request object
 * @param res - Express response object
 */
export const getAssignedIssues = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    // Only government officials can view assigned issues
    if (req.user.role !== 'GOVERNMENT') {
      return res.status(403).json({ error: 'Forbidden: Only government officials can view assigned issues' });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as string | undefined;

    // Get department ID of the government official
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { departmentId: true },
    });

    if (!user?.departmentId) {
      return res.json({
        issues: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
        message: 'You are not assigned to any department yet.',
      });
    }

    // Build where clause for filtering
    const where: any = {
      departmentId: user.departmentId,
    };

    if (status) {
      where.status = status;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await prisma.issue.count({ where });

    // Get assigned issues with pagination
    const issues = await prisma.issue.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        department: true,
        images: {
          take: 1,
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Calculate votes for each issue
    const issuesWithVotes = await Promise.all(
      issues.map(async (issue) => {
        const upvotes = await prisma.vote.count({
          where: {
            issueId: issue.id,
            type: 'UPVOTE',
          },
        });

        const downvotes = await prisma.vote.count({
          where: {
            issueId: issue.id,
            type: 'DOWNVOTE',
          },
        });

        return {
          ...issue,
          votes: {
            upvotes,
            downvotes,
          },
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    res.json({
      issues: issuesWithVotes,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching assigned issues:', error);
    res.status(500).json({ error: 'Failed to fetch assigned issues' });
  }
};
