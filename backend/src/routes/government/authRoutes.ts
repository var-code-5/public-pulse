import { Router } from 'express';
import * as authController from '../../controllers/government/authController';
import { verifyFirebaseToken } from '../../middleware/auth';
import { requireGovernment } from '../../middleware/roles';

const router = Router();

// Government auth routes
router.post('/signup', verifyFirebaseToken, authController.signup);
router.get('/profile', verifyFirebaseToken, requireGovernment, authController.getProfile);

export default router;
