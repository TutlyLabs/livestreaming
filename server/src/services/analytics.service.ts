import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';

const prisma = new PrismaClient();
const redis = new Redis();

export class AnalyticsService {
  static async trackViewerJoin(streamId: string, userId: string, userAgent: string, geoData: any) {
    try {
      await prisma.stream.update({
        where: { id: streamId },
        data: { viewers: { increment: 1 } }
      });

      const analytics = await prisma.streamAnalytics.upsert({
        where: { streamId },
        create: {
          streamId,
          uniqueViewers: 1,
          totalViews: 1,
          geographicData: { [geoData.country]: 1 },
          deviceStats: { [userAgent]: 1 }
        },
        update: {
          totalViews: { increment: 1 },
          uniqueViewers: { increment: 1 }
        }
      });

      // Store viewer session start time in Redis
      await redis.hset(`stream:${streamId}:viewers`, userId, Date.now());

      return analytics;
    } catch (error) {
      console.error('Error tracking viewer join:', error);
      throw error;
    }
  }

  static async trackViewerLeave(streamId: string, userId: string) {
    try {
      await prisma.stream.update({
        where: { id: streamId },
        data: { viewers: { decrement: 1 } }
      });

      const joinTime = await redis.hget(`stream:${streamId}:viewers`, userId);
      if (joinTime) {
        const duration = (Date.now() - parseInt(joinTime)) / 1000;
        await redis.hdel(`stream:${streamId}:viewers`, userId);

        const analytics = await prisma.streamAnalytics.findUnique({
          where: { streamId }
        });

        if (analytics) {
          const newAverage = 
            (analytics.averageViewTime * analytics.totalViews + duration) / 
            (analytics.totalViews + 1);

          await prisma.streamAnalytics.update({
            where: { streamId },
            data: { averageViewTime: newAverage }
          });
        }
      }
    } catch (error) {
      console.error('Error tracking viewer leave:', error);
      throw error;
    }
  }

  static async updatePeakViewers(streamId: string, currentViewers: number) {
    try {
      await prisma.streamAnalytics.update({
        where: { streamId },
        data: {
          peakViewers: {
            set: currentViewers,
            increment: currentViewers > await prisma.streamAnalytics.findUnique({
              where: { streamId }
            }).then(a => a?.peakViewers || 0) ? 1 : 0
          }
        }
      });
    } catch (error) {
      console.error('Error updating peak viewers:', error);
      throw error;
    }
  }
}