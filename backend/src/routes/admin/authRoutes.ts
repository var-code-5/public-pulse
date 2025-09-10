import { Router } from 'express';
import * as authController from '../../controllers/admin/authController';
import { verifyFirebaseToken } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roles';

const router = Router();

// Admin auth routes
router.post('/signup', verifyFirebaseToken, authController.signup);
router.get('/profile', verifyFirebaseToken, requireAdmin, authController.getProfile);

export default router;
