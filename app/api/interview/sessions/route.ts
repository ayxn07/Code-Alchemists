import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { InterviewSessionModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        const sessions = await InterviewSessionModel.find({
            userId: user.userId,
            completedAt: { $exists: true },
        })
            .sort({ completedAt: -1 })
            .limit(10)
            .lean();

        return NextResponse.json({
            success: true,
            sessions: sessions.map((session: any) => ({
                id: session._id.toString(),
                targetRole: session.targetRole,
                mode: session.mode,
                overallScore: session.overallScore,
                questionCount: session.questions.length,
                startedAt: session.startedAt,
                completedAt: session.completedAt,
                duration: Math.round((session.completedAt - session.startedAt) / 60000) + ' min',
            })),
        });
    } catch (error) {
        console.error('Get interview sessions error:', error);
        return NextResponse.json({ error: 'Failed to fetch interview sessions' }, { status: 500 });
    }
}
