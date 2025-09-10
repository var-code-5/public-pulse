import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Create a new department
 * @param req - Express request object with authenticated user and department data
 * @param res - Express response object
 */
export const createDepartment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    // Only admins can create departments
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Only admins can create departments' });
    }

    const { name } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    // Check if a department with this name already exists
    const existingDepartment = await prisma.department.findUnique({
      where: { name },
    });

    if (existingDepartment) {
      return res.status(400).json({ error: 'A department with this name already exists' });
    }

    // Create the department with Prisma
    const department = await prisma.department.create({
      data: {
        name,
      },
    });

    res.status(201).json({
      message: 'Department created successfully',
      department,
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
};

/**
 * Get all departments
 * @param req - Express request object
 * @param res - Express response object
 */
export const getAllDepartments = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            users: true,
            issues: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json({
      departments,
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
};

/**
 * Get a department by ID
 * @param req - Express request object with department ID
 * @param res - Express response object
 */
export const getDepartmentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        issues: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            _count: {
              select: {
                comments: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            users: true,
            issues: true,
          },
        },
      },
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({
      department,
    });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
};

/**
 * Update a department
 * @param req - Express request object with department ID and update data
 * @param res - Express response object
 */
export const updateDepartment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    // Only admins can update departments
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Only admins can update departments' });
    }

    const { id } = req.params;
    const { name } = req.body;

    // Check if the department exists
    const department = await prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    // Check if another department with this name already exists
    const existingDepartment = await prisma.department.findFirst({
      where: {
        name,
        NOT: {
          id,
        },
      },
    });

    if (existingDepartment) {
      return res.status(400).json({ error: 'Another department with this name already exists' });
    }

    // Update the department
    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: {
        name,
      },
    });

    res.json({
      message: 'Department updated successfully',
      department: updatedDepartment,
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ error: 'Failed to update department' });
  }
};

/**
 * Delete a department
 * @param req - Express request object with department ID
 * @param res - Express response object
 */
export const deleteDepartment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    // Only admins can delete departments
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Only admins can delete departments' });
    }

    const { id } = req.params;

    // Check if the department exists
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            issues: true,
          },
        },
      },
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Don't allow deletion if the department has associated users or issues
    if (department._count.users > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete department with associated users. Reassign users first.'
      });
    }

    if (department._count.issues > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete department with associated issues. Reassign issues first.'
      });
    }

    // Delete the department
    await prisma.department.delete({
      where: { id },
    });

    res.json({
      message: 'Department deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
};

/**
 * Assign a user to a department
 * @param req - Express request object with user ID and department ID
 * @param res - Express response object
 */
export const assignUserToDepartment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    // Only admins can assign users to departments
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Only admins can assign users to departments' });
    }

    const { userId, departmentId } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If departmentId is provided, check if the department exists
    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });

      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }
    }

    // Update the user's department
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        departmentId: departmentId || null,
      },
      include: {
        department: true,
      },
    });

    res.json({
      message: departmentId
        ? 'User assigned to department successfully'
        : 'User removed from department successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error assigning user to department:', error);
    res.status(500).json({ error: 'Failed to assign user to department' });
  }
};
