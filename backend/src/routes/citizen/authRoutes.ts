import { Router } from 'express';
import * as authController from '../../controllers/citizen/authController';
import { verifyFirebaseToken } from '../../middleware/auth';

const router = Router();

// Citizen auth routes
router.post('/signup', verifyFirebaseToken, authController.signup);
router.get('/profile', verifyFirebaseToken, authController.getProfile);

export default router;
