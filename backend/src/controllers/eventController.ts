import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import { uploadFile, getSignedUrl, getKeyFromUrl } from "../utils/s3";

/**
 * Helper function to process events and add signed URLs for images
 * @param events - Array of event objects or single event object with images
 * @returns Events with signed URLs for images
 */
const processEventImages = (events: any | any[]) => {
  // Handle both single event and array of events
  const processImage = (event: any) => {
    if (event.imageUrl) {
      const key = getKeyFromUrl(event.imageUrl);
      const signedUrl = getSignedUrl(key, 3600); // 1 hour expiry
      return {
        ...event,
        imageUrl: signedUrl,
      };
    }
    return event;
  };

  // Process single event or array of events
  if (Array.isArray(events)) {
    return events.map(event => processImage(event));
  } else {
    return processImage(events);
  }
};

/**
 * Create a new event
 * @param req - Express request object with authenticated user and event data
 * @param res - Express response object
 */
export const createEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, location, latitude, longitude, eventDate } =
      req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Find the user in our database using the Firebase UID
    const user = await prisma.user.findUnique({
      where: { firebaseUid: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create the event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        eventDate: eventDate ? new Date(eventDate) : new Date(),
        imageUrl: req.file ? await uploadFile(req.file) : null,
        creatorId: user.id,
      },
    });

    // Process the image URL to return a signed URL
    const processedEvent = processEventImages(event);

    return res.status(201).json(processedEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(500).json({ message: "Failed to create event" });
  }
};

/**
 * Get all events
 * @param req - Express request object
 * @param res - Express response object
 */
export const getAllEvents = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { eventDate: "asc" },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            profileURL: true,
            role: true,
          },
        },
      },
    });

    // Process the events to include signed URLs for images
    const processedEvents = processEventImages(events);

    return res.status(200).json(processedEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).json({ message: "Failed to fetch events" });
  }
};

/**
 * Get a specific event by ID
 * @param req - Express request object
 * @param res - Express response object
 */
export const getEventById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            profileURL: true,
            role: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Process the event to include signed URL for image
    const processedEvent = processEventImages(event);

    return res.status(200).json(processedEvent);
  } catch (error) {
    console.error("Error fetching event:", error);
    return res.status(500).json({ message: "Failed to fetch event" });
  }
};

/**
 * Update an existing event
 * @param req - Express request object with authenticated user and updated event data
 * @param res - Express response object
 */
export const updateEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, location, latitude, longitude, eventDate } =
      req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Find the user in our database using the Firebase UID
    const user = await prisma.user.findUnique({
      where: { firebaseUid: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the event to verify ownership
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Only the creator, admin, or government users can update the event
    if (
      existingEvent.creatorId !== user.id &&
      user.role !== "ADMIN" &&
      user.role !== "GOVERNMENT"
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this event" });
    }

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: title || undefined,
        description: description || undefined,
        location: location || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        eventDate: eventDate ? new Date(eventDate) : undefined,
        imageUrl: req.file ? await uploadFile(req.file) : undefined,
      },
    });

    // Process the event to include signed URL for image
    const processedEvent = processEventImages(updatedEvent);

    return res.status(200).json(processedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return res.status(500).json({ message: "Failed to update event" });
  }
};

/**
 * Delete an event
 * @param req - Express request object with authenticated user
 * @param res - Express response object
 */
export const deleteEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Find the user in our database using the Firebase UID
    const user = await prisma.user.findUnique({
      where: { firebaseUid: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the event to verify ownership
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Only the creator, admin, or government users can delete the event
    if (
      existingEvent.creatorId !== user.id &&
      user.role !== "ADMIN" &&
      user.role !== "GOVERNMENT"
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this event" });
    }

    // Delete the event
    await prisma.event.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return res.status(500).json({ message: "Failed to delete event" });
  }
};

/**
 * Get upcoming events
 * @param req - Express request object
 * @param res - Express response object
 */
export const getUpcomingEvents = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const now = new Date();

    const events = await prisma.event.findMany({
      where: {
        eventDate: {
          gte: now,
        },
      },
      orderBy: { eventDate: "asc" },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            profileURL: true,
            role: true,
          },
        },
      },
    });

    // Process the events to include signed URLs for images
    const processedEvents = processEventImages(events);

    return res.status(200).json(processedEvents);
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    return res.status(500).json({ message: "Failed to fetch upcoming events" });
  }
};

/**
 * Get nearby events based on latitude and longitude
 * @param req - Express request object
 * @param res - Express response object
 */
export const getNearbyEvents = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query; // radius in kilometers, default 10

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required" });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const rad = parseFloat(radius as string);

    // Get all events that have coordinates
    const events = await prisma.event.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            profileURL: true,
            role: true,
          },
        },
      },
    });

    // Filter events by distance
    // Using the Haversine formula to calculate distance between two points on a sphere
    const nearbyEvents = events.filter((event) => {
      if (!event.latitude || !event.longitude) return false;

      const R = 6371; // Earth's radius in kilometers
      const dLat = ((event.latitude - lat) * Math.PI) / 180;
      const dLon = ((event.longitude - lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((event.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return distance <= rad;
    });

    // Process the events to include signed URLs for images
    const processedEvents = processEventImages(nearbyEvents);

    return res.status(200).json(processedEvents);
  } catch (error) {
    console.error("Error fetching nearby events:", error);
    return res.status(500).json({ message: "Failed to fetch nearby events" });
  }
};
