import { JobModel } from '../db/models';
import type { Job } from '@/src/types/models';
import type { Types } from 'mongoose';

export const jobRepository = {
    async upsertJobFromExternal(data: {
        externalId: string;
        provider: string;
        title: string;
        company: string;
        location?: string;
        remote?: boolean;
        postedAt?: Date;
        salaryRange?: { currency?: string; min?: number; max?: number };
        url?: string;
        source?: string;
        rawData?: Record<string, unknown>;
    }): Promise<Job> {
        const job = await JobModel.findOneAndUpdate(
            { externalId: data.externalId, provider: data.provider },
            data,
            { upsert: true, new: true }
        );
        return job.toObject();
    },

    async getJobById(id: string | Types.ObjectId): Promise<Job | null> {
        const job = await JobModel.findById(id);
        return job ? job.toObject() : null;
    },

    async getJobsByIds(ids: (string | Types.ObjectId)[]): Promise<Job[]> {
        const jobs = await JobModel.find({ _id: { $in: ids } });
        return jobs.map((j) => j.toObject());
    },

    async findJobByExternal(externalId: string, provider: string): Promise<Job | null> {
        const job = await JobModel.findOne({ externalId, provider });
        return job ? job.toObject() : null;
    },

    async searchJobs(filters: {
        title?: string;
        company?: string;
        location?: string;
        remote?: boolean;
        limit?: number;
    }): Promise<Job[]> {
        const query: any = {};
        if (filters.title) query.title = { $regex: filters.title, $options: 'i' };
        if (filters.company) query.company = { $regex: filters.company, $options: 'i' };
        if (filters.location) query.location = { $regex: filters.location, $options: 'i' };
        if (filters.remote !== undefined) query.remote = filters.remote;

        const jobs = await JobModel.find(query)
            .sort({ createdAt: -1 })
            .limit(filters.limit || 50);
        return jobs.map((j) => j.toObject());
    },
};
