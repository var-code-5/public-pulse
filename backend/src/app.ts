import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";
import fs from "fs";
import path from "path";

// Load environment variables - first try secrets directory for Docker
const envPath = fs.existsSync("/app/secrets/.env")
  ? "/app/secrets/.env"
  : path.resolve(process.cwd(), ".env");
dotenv.config({ path: envPath });

// Create Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API routes
app.use("/api", routes);

// Root route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to Public Pulse API" });
});

// Health check endpoint for Docker
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
