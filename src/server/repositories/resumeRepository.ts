import { ResumeModel } from '../db/models';
import type { Resume } from '@/src/types/models';
import type { Types } from 'mongoose';

export const resumeRepository = {
    async getUserResumes(userId: string | Types.ObjectId): Promise<Resume[]> {
        const resumes = await ResumeModel.find({ userId }).sort({ createdAt: -1 });
        return resumes.map((r) => r.toObject());
    },

    async getResumeById(id: string | Types.ObjectId): Promise<Resume | null> {
        const resume = await ResumeModel.findById(id);
        return resume ? resume.toObject() : null;
    },

    async createResume(
        userId: string | Types.ObjectId,
        data: {
            title: string;
            rawText: string;
            structuredData?: Record<string, unknown>;
            isPrimary?: boolean;
            templateType?: string;
            atsScore?: number;
            tags?: string[];
        }
    ): Promise<Resume> {
        // If this is marked as primary, unset other primary resumes
        if (data.isPrimary) {
            await ResumeModel.updateMany({ userId, isPrimary: true }, { isPrimary: false });
        }

        const resume = await ResumeModel.create({ ...data, userId });
        return resume.toObject();
    },

    async updateResume(
        id: string | Types.ObjectId,
        data: Partial<Omit<Resume, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>
    ): Promise<Resume | null> {
        const resume = await ResumeModel.findByIdAndUpdate(id, data, { new: true });
        return resume ? resume.toObject() : null;
    },

    async setPrimaryResume(userId: string | Types.ObjectId, resumeId: string | Types.ObjectId): Promise<void> {
        // Unset all primary flags for this user
        await ResumeModel.updateMany({ userId }, { isPrimary: false });
        // Set the specified resume as primary
        await ResumeModel.findByIdAndUpdate(resumeId, { isPrimary: true });
    },

    async deleteResume(id: string | Types.ObjectId): Promise<boolean> {
        const result = await ResumeModel.deleteOne({ _id: id });
        return result.deletedCount > 0;
    },

    async getPrimaryResume(userId: string | Types.ObjectId): Promise<Resume | null> {
        const resume = await ResumeModel.findOne({ userId, isPrimary: true });
        return resume ? resume.toObject() : null;
    },
};
