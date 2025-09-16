import { Request, Response, NextFunction } from "express";
import admin from "../utils/firebase/admin";

// Extended Request interface to include user property and files from multer
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
    id?: string;
  };
  file?: Express.Multer.File;
  // Match Express's definition for files, which can be either an array or a record of arrays
  files?:
    | { [fieldname: string]: Express.Multer.File[] }
    | Express.Multer.File[];
}

/**
 * Middleware to verify Firebase authentication token
 * Extracts the token from the Authorization header and verifies its validity
 */
export const verifyFirebaseToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split("Bearer ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Invalid token format" });
    }

    // Verify the token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Add the user information to the request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
