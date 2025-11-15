import { InterviewSessionModel } from '../db/models';
import type { InterviewSession, InterviewQuestion, InterviewAnswer } from '@/src/types/models';
import type { Types } from 'mongoose';

export const interviewRepository = {
    async createSession(data: {
        userId: string | Types.ObjectId;
        role?: string;
        mode: 'hr' | 'technical' | 'behavioral';
        questions: InterviewQuestion[];
        viaVoice?: boolean;
    }): Promise<InterviewSession> {
        const session = await InterviewSessionModel.create({
            ...data,
            startedAt: new Date(),
            answers: [],
        });
        return session.toObject();
    },

    async appendQuestionAndAnswer(
        sessionId: string | Types.ObjectId,
        answer: InterviewAnswer
    ): Promise<InterviewSession | null> {
        const session = await InterviewSessionModel.findByIdAndUpdate(
            sessionId,
            { $push: { answers: answer } },
            { new: true }
        );
        return session ? session.toObject() : null;
    },

    async completeSession(
        sessionId: string | Types.ObjectId,
        summaryData: {
            overallScore: number;
        }
    ): Promise<InterviewSession | null> {
        const session = await InterviewSessionModel.findByIdAndUpdate(
            sessionId,
            {
                ...summaryData,
                completedAt: new Date(),
            },
            { new: true }
        );
        return session ? session.toObject() : null;
    },

    async getSessionsForUser(
        userId: string | Types.ObjectId,
        limit?: number
    ): Promise<InterviewSession[]> {
        const sessions = await InterviewSessionModel.find({ userId })
            .sort({ startedAt: -1 })
            .limit(limit || 50);
        return sessions.map((s) => s.toObject());
    },

    async getSessionById(id: string | Types.ObjectId): Promise<InterviewSession | null> {
        const session = await InterviewSessionModel.findById(id);
        return session ? session.toObject() : null;
    },

    async updateSession(
        id: string | Types.ObjectId,
        data: Partial<Omit<InterviewSession, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>
    ): Promise<InterviewSession | null> {
        const session = await InterviewSessionModel.findByIdAndUpdate(id, data, { new: true });
        return session ? session.toObject() : null;
    },
};
