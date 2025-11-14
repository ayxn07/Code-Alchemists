import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { InterviewSessionModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';

const startInterviewSchema = z.object({
    targetRole: z.string(),
    mode: z.enum(['hr', 'technical', 'behavioral']),
    options: z.object({
        voiceEnabled: z.boolean().optional(),
        videoEnabled: z.boolean().optional(),
    }).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { targetRole, mode, options } = startInterviewSchema.parse(body);

        await connectToDatabase();

        // Generate first question based on mode
        const firstQuestions = {
            hr: 'Tell me about yourself and why you\'re interested in this role.',
            technical: 'Can you explain the difference between synchronous and asynchronous programming?',
            behavioral: 'Tell me about a time when you had to handle a difficult situation at work.',
        };

        const session = await InterviewSessionModel.create({
            userId: user.userId,
            targetRole,
            mode,
            questions: [
                {
                    question: firstQuestions[mode],
                    askedAt: new Date(),
                },
            ],
            answers: [],
            startedAt: new Date(),
            settings: options || {},
        });

        return NextResponse.json({
            success: true,
            session: {
                id: session._id.toString(),
                currentQuestion: firstQuestions[mode],
                questionNumber: 1,
                totalQuestions: mode === 'technical' ? 8 : mode === 'behavioral' ? 5 : 6,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('Start interview error:', error);
        return NextResponse.json({ error: 'Failed to start interview' }, { status: 500 });
    }
}
