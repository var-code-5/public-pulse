import { Router } from "express";
import { RequestHandler } from "express";
import * as imageController from "../controllers/imageController";
import { verifyFirebaseToken } from "../middleware/auth";
import { requireCitizen } from "../middleware/roles";

const router = Router();

// Type assertion function to fix Express middleware type incompatibilities
const asHandler = (handler: any): RequestHandler => handler;

// All routes require authentication
router.use(asHandler(verifyFirebaseToken));

// Get images by user ID
router.get(
  "/user/:userId",
  asHandler(requireCitizen),
  asHandler(imageController.getImagesByUserId)
);

// Delete specific image - citizens can delete their own images
router.delete(
  "/:imageId",
  asHandler(requireCitizen),
  asHandler(imageController.deleteImage)
);

export default router;
