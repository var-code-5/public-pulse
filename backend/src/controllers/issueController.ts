import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import { IssueStatus } from "../generated/prisma";
import { uploadMultipleFiles, deleteMultipleFiles, getSignedUrl, getKeyFromUrl } from "../utils/s3";
import { analyzeIssue } from "../utils/ai/issueAnalysisWorkflow";

/**
 * Helper function to process issue objects and replace image URLs with signed URLs
 * @param issues - Array of issue objects or single issue object with images
 * @returns Issue(s) with signed URLs for images
 */
const processIssueImages = (issues: any | any[]) => {
  // Handle both single issue and array of issues
  const processImages = (issue: any) => {
    if (issue.images && issue.images.length > 0) {
      issue.images = issue.images.map((image: any) => {
        const key = getKeyFromUrl(image.url);
        const signedUrl = getSignedUrl(key, 3600); // 1 hour expiry
        return {
          ...image,
          url: signedUrl,
        };
      });
    }
    return issue;
  };

  // Process single issue or array of issues
  if (Array.isArray(issues)) {
    return issues.map(issue => processImages(issue));
  } else {
    return processImages(issues);
  }
};

/**
 * Create a new issue
 * @param req - Express request object with authenticated user and issue data
 * @param res - Express response object
 */
export const createIssue = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Authentication required" });
    }

    const { title, description, latitude, longitude } = req.body;
    const authorId = req.user.id;

    // Validate required fields
    if (
      !title ||
      !description ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res
        .status(400)
        .json({
          error: "Title, description, latitude, and longitude are required",
        });
    }

    // Use AI to analyze the issue and determine severity and department
    const analysisResult = await analyzeIssue(title, description);

    // Upload images to S3 if they exist
    let imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      try {
        imageUrls = await uploadMultipleFiles(req.files);
      } catch (uploadError) {
        console.error("Error uploading images to S3:", uploadError);
        return res.status(500).json({ error: "Failed to upload images" });
      }
    }

    // Create a new issue with Prisma transaction to handle images
    const issue = await prisma.$transaction(async (prisma) => {
      // Create the issue with AI-determined severity and department
      const newIssue = await prisma.issue.create({
        data: {
          title: title,
          description: description,
          latitude: Number(latitude),
          longitude: Number(longitude),
          severity: analysisResult.severity,
          departmentId: analysisResult.departmentId,
          authorId: authorId,
        },
      });

      // Create image records with S3 URLs
      if (imageUrls.length > 0) {
        for (const imageUrl of imageUrls) {
          await prisma.image.create({
            data: {
              url: imageUrl,
              issueId: newIssue.id,
            },
          });
        }
      }

      return newIssue;
    });

    // Return the created issue with author and images
    const fullIssue = await prisma.issue.findUnique({
      where: { id: issue.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        department: true,
        images: true,
      },
    });

    // Process image URLs to generate signed URLs
    const processedIssue = processIssueImages(fullIssue);

    res.status(201).json({
      message: "Issue created successfully",
      issue: processedIssue,
    });
  } catch (error) {
    console.error("Error creating issue:", error);
    res.status(500).json({ error: "Failed to create issue" });
  }
};

/**
 * Get all issues with pagination and filtering
 * @param req - Express request object with query parameters
 * @param res - Express response object
 */
export const getAllIssues = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // Parse query parameters for pagination and filtering
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as IssueStatus | undefined;
    const departmentId = req.query.departmentId as string | undefined;
    const search = req.query.search as string | undefined;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.issue.count({ where });

    // Get issues with pagination and filtering
    const issues = await prisma.issue.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        department: true,
        images: true,
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Calculate votes for each issue
    const issuesWithVoteCounts = await Promise.all(
      issues.map(async (issue) => {
        const upvotes = await prisma.vote.count({
          where: {
            issueId: issue.id,
            type: "UPVOTE",
          },
        });

        const downvotes = await prisma.vote.count({
          where: {
            issueId: issue.id,
            type: "DOWNVOTE",
          },
        });

        // Check if the current user has voted on this issue
        let userVote = null;
        if (req.user && req.user.id) {
          const vote = await prisma.vote.findFirst({
            where: {
              issueId: issue.id,
              userId: req.user.id,
            },
          });

          if (vote) {
            userVote = vote.type;
          }
        }

        return {
          ...issue,
          votes: {
            upvotes,
            downvotes,
            userVote,
          },
        };
      })
    );

    // Process image URLs to generate signed URLs
    const processedIssues = processIssueImages(issuesWithVoteCounts);
    
    const totalPages = Math.ceil(total / limit);

    res.json({
      issues: processedIssues,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching issues:", error);
    res.status(500).json({ error: "Failed to fetch issues" });
  }
};

/**
 * Get a specific issue by ID
 * @param req - Express request object with issue ID
 * @param res - Express response object
 */
export const getIssueById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileURL: true,
            role: true,
          },
        },
        department: true,
        images: true,
        comments: {
          where: {
            parentId: null, // Only get top-level comments
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
            _count: {
              select: {
                replies: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        statusLogs: {
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
          orderBy: {
            changedAt: "desc",
          },
        },
      },
    });

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    // Get vote counts
    const upvotes = await prisma.vote.count({
      where: {
        issueId: id,
        type: "UPVOTE",
      },
    });

    const downvotes = await prisma.vote.count({
      where: {
        issueId: id,
        type: "DOWNVOTE",
      },
    });

    // Check if the current user has voted on this issue
    let userVote = null;
    if (req.user && req.user.id) {
      const vote = await prisma.vote.findFirst({
        where: {
          issueId: id,
          userId: req.user.id,
        },
      });

      if (vote) {
        userVote = vote.type;
      }
    }

    const issueWithVotes = {
      ...issue,
      votes: {
        upvotes,
        downvotes,
        userVote,
      },
    };

    // Process image URLs to generate signed URLs
    const processedIssue = processIssueImages(issueWithVotes);

    res.json({ issue: processedIssue });
  } catch (error) {
    console.error("Error fetching issue:", error);
    res.status(500).json({ error: "Failed to fetch issue" });
  }
};

/**
 * Update an issue
 * @param req - Express request object with issue ID and update data
 * @param res - Express response object
 */
export const updateIssue = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Authentication required" });
    }

    const { id } = req.params;
    const { title, description, latitude, longitude, severity } = req.body;
    const shouldReplaceImages =
      req.body.replaceImages === "true" || req.body.replaceImages === true;

    // Find the issue to check ownership
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    // Check if the user is the author or an admin/government official
    const isAuthor = issue.authorId === req.user.id;
    const isAdminOrGovernment =
      req.user.role === "ADMIN" || req.user.role === "GOVERNMENT";

    if (!isAuthor && !isAdminOrGovernment) {
      return res
        .status(403)
        .json({
          error: "Forbidden: You do not have permission to update this issue",
        });
    }

    // Upload new images to S3 if they exist
    let newImageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      try {
        newImageUrls = await uploadMultipleFiles(req.files);
      } catch (uploadError) {
        console.error("Error uploading images to S3:", uploadError);
        return res.status(500).json({ error: "Failed to upload images" });
      }
    }

    // Update the issue with Prisma transaction to handle images
    const updatedIssue = await prisma.$transaction(async (prisma) => {
      // Update the issue
      const updatedIssue = await prisma.issue.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(latitude !== undefined && { latitude }),
          ...(longitude !== undefined && { longitude }),
          ...(severity !== undefined && { severity }),
        },
      });

      // Handle image replacement if requested
      if (shouldReplaceImages && issue.images.length > 0) {
        // Delete old images from S3
        try {
          await deleteMultipleFiles(issue.images.map((img) => img.url));
        } catch (deleteError) {
          console.error("Error deleting old images from S3:", deleteError);
          // Continue with the update even if S3 deletion fails
        }

        // Delete old image records from the database
        await prisma.image.deleteMany({
          where: { issueId: id },
        });
      }

      // Add new images
      if (newImageUrls.length > 0) {
        for (const imageUrl of newImageUrls) {
          await prisma.image.create({
            data: {
              url: imageUrl,
              issueId: id,
            },
          });
        }
      }

      return updatedIssue;
    });

    // Return the updated issue with author and images
    const fullUpdatedIssue = await prisma.issue.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        images: true,
      },
    });

    res.json({
      message: "Issue updated successfully",
      issue: fullUpdatedIssue,
    });
  } catch (error) {
    console.error("Error updating issue:", error);
    res.status(500).json({ error: "Failed to update issue" });
  }
};

/**
 * Update the status of an issue
 * @param req - Express request object with issue ID and new status
 * @param res - Express response object
 */
export const updateIssueStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Authentication required" });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (
      !status ||
      !Object.values(IssueStatus).includes(status as IssueStatus)
    ) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Check if issue exists
    const issue = await prisma.issue.findUnique({
      where: { id },
    });

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    // Only government officials and admins can update issue status
    if (req.user.role !== "GOVERNMENT" && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({
          error:
            "Forbidden: Only government officials and admins can update issue status",
        });
    }

    // Update the status and create a status history entry
    const updatedIssue = await prisma.$transaction(async (prisma) => {
      // Update the issue status
      const updatedIssue = await prisma.issue.update({
        where: { id },
        data: {
          status: status as IssueStatus,
        },
      });

      // Create a status history entry
      await prisma.issueStatusHistory.create({
        data: {
          issueId: id,
          status: status as IssueStatus,
          changedById: req.user?.id || "default",
        },
      });

      // Create a notification for the issue author
      await prisma.notification.create({
        data: {
          userId: issue.authorId,
          issueId: id,
          message: `Your issue "${issue.title}" status has been updated to ${status}`,
        },
      });

      return updatedIssue;
    });

    res.json({
      message: "Issue status updated successfully",
      issue: updatedIssue,
    });
  } catch (error) {
    console.error("Error updating issue status:", error);
    res.status(500).json({ error: "Failed to update issue status" });
  }
};

/**
 * Assign an issue to a department
 * @param req - Express request object with issue ID and department ID
 * @param res - Express response object
 */
export const assignIssueToDepartment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Authentication required" });
    }

    const { id } = req.params;
    const { departmentId } = req.body;

    // Check if issue exists
    const issue = await prisma.issue.findUnique({
      where: { id },
    });

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    // Only government officials and admins can assign issues to departments
    if (req.user.role !== "GOVERNMENT" && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({
          error:
            "Forbidden: Only government officials and admins can assign issues to departments",
        });
    }

    // If departmentId is provided, verify it exists
    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });

      if (!department) {
        return res.status(404).json({ error: "Department not found" });
      }
    }

    // Update the issue with the department assignment
    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: {
        departmentId: departmentId || null,
      },
      include: {
        department: true,
      },
    });

    // Create a notification for the issue author
    if (departmentId) {
      await prisma.notification.create({
        data: {
          userId: issue.authorId,
          issueId: id,
          message: `Your issue "${issue.title}" has been assigned to a department`,
        },
      });
    }

    res.json({
      message: departmentId
        ? "Issue assigned to department successfully"
        : "Issue removed from department successfully",
      issue: updatedIssue,
    });
  } catch (error) {
    console.error("Error assigning issue to department:", error);
    res.status(500).json({ error: "Failed to assign issue to department" });
  }
};

/**
 * Delete an issue
 * @param req - Express request object with issue ID
 * @param res - Express response object
 */
export const deleteIssue = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Authentication required" });
    }

    const { id } = req.params;

    // Find the issue to check ownership and get images
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    // Check if the user is the author or an admin
    const isAuthor = issue.authorId === req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return res
        .status(403)
        .json({
          error: "Forbidden: You do not have permission to delete this issue",
        });
    }

    // Delete images from S3 if they exist
    if (issue.images.length > 0) {
      try {
        await deleteMultipleFiles(issue.images.map((img) => img.url));
      } catch (deleteError) {
        console.error("Error deleting images from S3:", deleteError);
        // Continue with the database deletion even if S3 deletion fails
      }
    }

    // Delete all related data using Prisma transaction
    await prisma.$transaction(async (prisma) => {
      // Delete related comments' votes
      await prisma.vote.deleteMany({
        where: {
          comment: {
            issueId: id,
          },
        },
      });

      // Delete related comments
      await prisma.comment.deleteMany({
        where: {
          issueId: id,
        },
      });

      // Delete related votes
      await prisma.vote.deleteMany({
        where: {
          issueId: id,
        },
      });

      // Delete related images from database
      await prisma.image.deleteMany({
        where: {
          issueId: id,
        },
      });

      // Delete related status logs
      await prisma.issueStatusHistory.deleteMany({
        where: {
          issueId: id,
        },
      });

      // Delete related notifications
      await prisma.notification.deleteMany({
        where: {
          issueId: id,
        },
      });

      // Finally delete the issue
      await prisma.issue.delete({
        where: {
          id,
        },
      });
    });

    res.json({
      message: "Issue deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting issue:", error);
    res.status(500).json({ error: "Failed to delete issue" });
  }
};

/**
 * Get nearby issues based on location
 * @param req - Express request object with latitude, longitude, and radius
 * @param res - Express response object
 */
export const getNearbyIssues = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const latitude = parseFloat(req.query.latitude as string);
    const longitude = parseFloat(req.query.longitude as string);
    const radius = parseFloat(req.query.radius as string) || 5; // default 5km radius

    if (isNaN(latitude) || isNaN(longitude)) {
      return res
        .status(400)
        .json({ error: "Valid latitude and longitude are required" });
    }

    // Use raw SQL for distance calculation
    // Note: This is simplified and might not be perfectly accurate for large distances
    // For production, consider using PostGIS or a more sophisticated distance calculation
    const issues = await prisma.$queryRaw`
      SELECT 
        i.*,
        (6371 * acos(cos(radians(${latitude})) * cos(radians(i."latitude")) * 
        cos(radians(i."longitude") - radians(${longitude})) + 
        sin(radians(${latitude})) * sin(radians(i."latitude")))) AS distance
      FROM "Issue" i
      WHERE (6371 * acos(cos(radians(${latitude})) * cos(radians(i."latitude")) * 
        cos(radians(i."longitude") - radians(${longitude})) + 
        sin(radians(${latitude})) * sin(radians(i."latitude")))) < ${radius}
      ORDER BY distance
      LIMIT 50
    `;

    // Get additional information for each issue
    const issuesWithDetails = await Promise.all(
      (issues as any[]).map(async (issue) => {
        const issueWithDetails = await prisma.issue.findUnique({
          where: { id: issue.id },
          include: {
            author: {
              select: {
                id: true,
                name: true,
              },
            },
            department: true,
            images: {
              take: 1, // Just get the first image for preview
            },
            _count: {
              select: {
                comments: true,
                votes: true,
              },
            },
          },
        });

        const upvotes = await prisma.vote.count({
          where: {
            issueId: issue.id,
            type: "UPVOTE",
          },
        });

        const downvotes = await prisma.vote.count({
          where: {
            issueId: issue.id,
            type: "DOWNVOTE",
          },
        });

        return {
          ...issueWithDetails,
          distance: issue.distance,
          votes: {
            upvotes,
            downvotes,
          },
        };
      })
    );

    res.json({
      issues: issuesWithDetails,
      query: {
        latitude,
        longitude,
        radius,
      },
    });
  } catch (error) {
    console.error("Error fetching nearby issues:", error);
    res.status(500).json({ error: "Failed to fetch nearby issues" });
  }
};
