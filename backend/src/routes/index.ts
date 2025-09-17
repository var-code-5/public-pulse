import { Router } from "express";
import citizenRoutes from "./citizen";
import governmentRoutes from "./government";
import adminRoutes from "./admin";
import issueRoutes from "./issueRoutes";
import commentRoutes from "./commentRoutes";
import voteRoutes from "./voteRoutes";
import notificationRoutes from "./notificationRoutes";
import departmentRoutes from "./departmentRoutes";
import userRoutes from "./userRoutes";
import imageRoutes from "./imageRoutes";
import eventRoutes from "./eventRoutes";

const router = Router();

// User type specific routes
router.use("/citizen", citizenRoutes);
router.use("/government", governmentRoutes);
router.use("/admin", adminRoutes);

// Feature routes
router.use("/issues", issueRoutes);
router.use("/comments", commentRoutes);
router.use("/votes", voteRoutes);
router.use("/notifications", notificationRoutes);
router.use("/departments", departmentRoutes);
router.use("/users", userRoutes);
router.use("/images", imageRoutes);
router.use("/events", eventRoutes);

export default router;
