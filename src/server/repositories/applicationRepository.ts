import { ApplicationModel } from '../db/models';
import type { Application, ApplicationStatus } from '@/src/types/models';
import { Types } from 'mongoose';

export const applicationRepository = {
    async createApplication(data: {
        userId: string | Types.ObjectId;
        jobId: string | Types.ObjectId;
        status?: ApplicationStatus;
        tailoredResumeId?: string | Types.ObjectId;
        coverLetter?: string;
        appliedAt?: Date;
        source?: string;
        notes?: string;
        viaN8n?: boolean;
    }): Promise<Application> {
        const application = await ApplicationModel.create({
            ...data,
            lastStatusChangeAt: new Date(),
        });
        return application.toObject();
    },

    async getApplicationsByUser(
        userId: string | Types.ObjectId,
        filters?: {
            status?: ApplicationStatus;
            limit?: number;
            skip?: number;
        }
    ): Promise<Application[]> {
        const query: any = { userId };
        if (filters?.status) query.status = filters.status;

        const applications = await ApplicationModel.find(query)
            .sort({ createdAt: -1 })
            .limit(filters?.limit || 100)
            .skip(filters?.skip || 0)
            .populate('jobId');

        return applications.map((a) => a.toObject());
    },

    async getApplicationById(id: string | Types.ObjectId): Promise<Application | null> {
        const application = await ApplicationModel.findById(id).populate('jobId');
        return application ? application.toObject() : null;
    },

    async updateApplicationStatus(
        id: string | Types.ObjectId,
        status: ApplicationStatus,
        notes?: string
    ): Promise<Application | null> {
        const application = await ApplicationModel.findByIdAndUpdate(
            id,
            { status, lastStatusChangeAt: new Date(), ...(notes && { notes }) },
            { new: true }
        );
        return application ? application.toObject() : null;
    },

    async updateApplication(
        id: string | Types.ObjectId,
        data: Partial<Omit<Application, '_id' | 'userId' | 'jobId' | 'createdAt' | 'updatedAt'>>
    ): Promise<Application | null> {
        const application = await ApplicationModel.findByIdAndUpdate(id, data, { new: true });
        return application ? application.toObject() : null;
    },

    async getApplicationByUserAndJob(
        userId: string | Types.ObjectId,
        jobId: string | Types.ObjectId
    ): Promise<Application | null> {
        const application = await ApplicationModel.findOne({ userId, jobId });
        return application ? application.toObject() : null;
    },

    async countApplicationsByStatus(userId: string | Types.ObjectId): Promise<Record<string, number>> {
        const counts = await ApplicationModel.aggregate([
            { $match: { userId: new Types.ObjectId(userId.toString()) } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        const result: Record<string, number> = {};
        counts.forEach((item) => {
            result[item._id] = item.count;
        });
        return result;
    },
};
