import express from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';
import { uploadToS3 } from '../utils/s3.js';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const streamSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional()
});

// Create new stream
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description } = streamSchema.parse(req.body);
    const streamKey = uuidv4();
    
    const stream = await prisma.stream.create({
      data: {
        title,
        description,
        streamKey,
        user: {
          connect: { id: req.user.userId }
        },
        analytics: {
          create: {}
        }
      },
      include: {
        analytics: true
      }
    });
    
    res.json({ stream });
  } catch (error) {
    console.error("Stream creation error:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get all active streams
router.get('/active', async (req, res) => {
  try {
    const streams = await prisma.stream.findMany({
      where: { isLive: true },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });
    res.json({ streams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's streams
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const streams = await prisma.stream.findMany({
      where: { userId: req.params.userId },
      include: {
        analytics: true
      }
    });
    res.json({ streams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stream authentication webhook for NGINX-RTMP
router.post('/auth', async (req, res) => {
  try {
    const stream = await prisma.stream.findFirst({
      where: { streamKey: req.body.name }
    });
    
    if (!stream) {
      return res.status(403).send('Invalid stream key');
    }

    await prisma.stream.update({
      where: { id: stream.id },
      data: {
        isLive: true,
        startedAt: new Date()
      }
    });
    
    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Error');
  }
});

// Stream completion webhook
router.post('/complete', async (req, res) => {
  try {
    const stream = await prisma.stream.findFirst({
      where: { streamKey: req.body.name }
    });
    
    if (stream) {
      const recordingUrl = await uploadToS3(`/recordings/${req.body.name}.flv`);
      
      await prisma.stream.update({
        where: { id: stream.id },
        data: {
          isLive: false,
          endedAt: new Date(),
          recordingUrl
        }
      });
    }
    
    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Error');
  }
});

// Get stream by ID
router.get('/:streamId', async (req, res) => {
  try {
    const stream = await prisma.stream.findUnique({
      where: { id: req.params.streamId },
      select: {
        id: true,
        title: true,
        description: true,
        isLive: true,
        viewers: true,
        user: {
          select: {
            name: true
          }
        }
      }
    });
    
    if (!stream) {
      return res.status(404).json({ error: "Stream not found" });
    }
    
    res.json({ stream });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stream analytics
router.get('/:streamId/analytics', authenticateToken, async (req, res) => {
  try {
    const analytics = await prisma.streamAnalytics.findUnique({
      where: { streamId: req.params.streamId }
    });

    if (!analytics) {
      return res.status(404).json({ error: "Analytics not found" });
    }

    res.json({ analytics });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: error.message });
  }
});

export const streamRoutes = router;