import { Router } from 'express';
import * as userController from '../controllers/userController';
import { verifyFirebaseToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';

const router = Router();

// All user routes require authentication
router.use(verifyFirebaseToken);

// Routes available to authenticated users for their own profile
router.get('/:id', userController.getUserById);
router.get('/:id/issues', userController.getUserIssues);
router.put('/:id', userController.updateUser);

// Routes for government officials
router.get('/government/assigned-issues', userController.getAssignedIssues);

// Admin only routes
router.get('/', requireAdmin, userController.getAllUsers);
router.post('/', requireAdmin, userController.createUser);
router.delete('/:id', requireAdmin, userController.deleteUser);

export default router;
