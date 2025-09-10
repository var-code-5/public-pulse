import { Router } from 'express';
import citizenRoutes from './citizen';
import governmentRoutes from './government';
import adminRoutes from './admin';

const router = Router();

// User type specific routes
router.use('/citizen', citizenRoutes);
router.use('/government', governmentRoutes);
router.use('/admin', adminRoutes);

export default router;
