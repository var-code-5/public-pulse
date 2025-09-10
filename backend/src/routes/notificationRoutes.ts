import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import { verifyFirebaseToken } from '../middleware/auth';

const router = Router();

// All notification routes require authentication
router.use(verifyFirebaseToken);

// Routes for authenticated users
router.get('/', notificationController.getUserNotifications);
router.patch('/:id/read', notificationController.markNotificationAsRead);
router.patch('/read-all', notificationController.markAllNotificationsAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;
