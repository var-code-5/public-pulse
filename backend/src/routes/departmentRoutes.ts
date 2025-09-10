import { Router } from 'express';
import * as departmentController from '../controllers/departmentController';
import { verifyFirebaseToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';

const router = Router();

// Public routes - no authentication needed
router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);

// Protected routes - authentication needed
router.use(verifyFirebaseToken);

// Admin only routes
router.post('/', requireAdmin, departmentController.createDepartment);
router.put('/:id', requireAdmin, departmentController.updateDepartment);
router.delete('/:id', requireAdmin, departmentController.deleteDepartment);
router.post('/assign-user', requireAdmin, departmentController.assignUserToDepartment);

export default router;
