import { LearningPlanModel } from '../db/models';
import type { LearningPlan, LearningPlanItem } from '@/src/types/models';
import type { Types } from 'mongoose';

export const learningPlanRepository = {
    async getPlanForUser(userId: string | Types.ObjectId): Promise<LearningPlan | null> {
        const plan = await LearningPlanModel.findOne({ userId }).sort({ createdAt: -1 });
        return plan ? plan.toObject() : null;
    },

    async savePlan(
        userId: string | Types.ObjectId,
        items: LearningPlanItem[],
        overallStatus?: 'not-started' | 'in-progress' | 'completed'
    ): Promise<LearningPlan> {
        const plan = await LearningPlanModel.create({
            userId,
            items,
            overallStatus: overallStatus || 'not-started',
        });
        return plan.toObject();
    },

    async updatePlanItem(
        userId: string | Types.ObjectId,
        itemIndex: number,
        updates: Partial<LearningPlanItem>
    ): Promise<LearningPlan | null> {
        const plan = await LearningPlanModel.findOne({ userId }).sort({ createdAt: -1 });
        if (!plan || !plan.items[itemIndex]) return null;

        Object.assign(plan.items[itemIndex], updates);
        await plan.save();
        return plan.toObject();
    },

    async updateOverallStatus(
        userId: string | Types.ObjectId,
        status: 'not-started' | 'in-progress' | 'completed'
    ): Promise<LearningPlan | null> {
        const plan = await LearningPlanModel.findOneAndUpdate(
            { userId },
            { overallStatus: status },
            { new: true, sort: { createdAt: -1 } }
        );
        return plan ? plan.toObject() : null;
    },
};
