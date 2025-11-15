import { SkillGapAnalysisModel } from '../db/models';
import type { SkillGapAnalysis } from '@/src/types/models';
import type { Types } from 'mongoose';

export const skillsRepository = {
    async saveAnalysis(data: {
        userId: string | Types.ObjectId;
        targetRole: string;
        matchPercent: number;
        missingSkills: string[];
        outdatedSkills: string[];
        highDemandSkills?: string[];
        generatedFrom?: {
            resumeId?: Types.ObjectId;
            profileSnapshot?: Record<string, unknown>;
        };
    }): Promise<SkillGapAnalysis> {
        const analysis = await SkillGapAnalysisModel.create(data);
        return analysis.toObject();
    },

    async getLatestAnalysis(
        userId: string | Types.ObjectId,
        targetRole?: string
    ): Promise<SkillGapAnalysis | null> {
        const query: any = { userId };
        if (targetRole) query.targetRole = targetRole;

        const analysis = await SkillGapAnalysisModel.findOne(query).sort({ createdAt: -1 });
        return analysis ? analysis.toObject() : null;
    },

    async getAnalysisHistory(
        userId: string | Types.ObjectId,
        limit?: number
    ): Promise<SkillGapAnalysis[]> {
        const analyses = await SkillGapAnalysisModel.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit || 10);
        return analyses.map((a) => a.toObject());
    },

    async getAnalysisByRole(
        userId: string | Types.ObjectId,
        targetRole: string
    ): Promise<SkillGapAnalysis[]> {
        const analyses = await SkillGapAnalysisModel.find({ userId, targetRole }).sort({
            createdAt: -1,
        });
        return analyses.map((a) => a.toObject());
    },
};
