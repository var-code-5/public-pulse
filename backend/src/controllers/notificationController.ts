import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Get all notifications for the authenticated user
 * @param req - Express request object with authenticated user
 * @param res - Express response object
 */
export const getUserNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const onlyUnread = req.query.unread === 'true';

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {
      userId: req.user.id,
    };

    if (onlyUnread) {
      where.read = false;
    }

    // Get total count for pagination
    const total = await prisma.notification.count({ where });

    // Get notifications with pagination
    const notifications = await prisma.notification.findMany({
      where,
      include: {
        issue: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    // Get count of unread notifications for the badge counter
    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user.id,
        read: false,
      },
    });

    res.json({
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

/**
 * Mark a notification as read
 * @param req - Express request object with notification ID
 * @param res - Express response object
 */
export const markNotificationAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const { id } = req.params;

    // Check if the notification exists and belongs to the user
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found or does not belong to you' });
    }

    // Update the notification to mark it as read
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        read: true,
      },
    });

    res.json({
      message: 'Notification marked as read',
      notification: updatedNotification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

/**
 * Mark all notifications as read for the authenticated user
 * @param req - Express request object with authenticated user
 * @param res - Express response object
 */
export const markAllNotificationsAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    // Update all unread notifications for the user
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    res.json({
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

/**
 * Delete a notification
 * @param req - Express request object with notification ID
 * @param res - Express response object
 */
export const deleteNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const { id } = req.params;

    // Check if the notification exists and belongs to the user
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found or does not belong to you' });
    }

    // Delete the notification
    await prisma.notification.delete({
      where: { id },
    });

    res.json({
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};
