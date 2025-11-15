import { ActivityLogModel } from '../db/models';
import type { ActivityLog } from '@/src/types/models';
import { Types } from 'mongoose';

export const activityLogRepository = {
    async logActivity(
        userId: string | Types.ObjectId,
        type: ActivityLog['type'],
        meta?: Record<string, unknown>
    ): Promise<ActivityLog> {
        const log = await ActivityLogModel.create({ userId, type, meta });
        return log.toObject();
    },

    async getRecentActivity(
        userId: string | Types.ObjectId,
        limit: number = 50
    ): Promise<ActivityLog[]> {
        const logs = await ActivityLogModel.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit);
        return logs.map((l) => l.toObject());
    },

    async getActivityByType(
        userId: string | Types.ObjectId,
        type: ActivityLog['type'],
        limit?: number
    ): Promise<ActivityLog[]> {
        const logs = await ActivityLogModel.find({ userId, type })
            .sort({ createdAt: -1 })
            .limit(limit || 50);
        return logs.map((l) => l.toObject());
    },

    async countActivitiesByType(userId: string | Types.ObjectId): Promise<Record<string, number>> {
        const counts = await ActivityLogModel.aggregate([
            { $match: { userId: new Types.ObjectId(userId.toString()) } },
            { $group: { _id: '$type', count: { $sum: 1 } } },
        ]);

        const result: Record<string, number> = {};
        counts.forEach((item) => {
            result[item._id] = item.count;
        });
        return result;
    },
};
