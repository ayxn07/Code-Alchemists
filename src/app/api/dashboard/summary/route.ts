import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { ApplicationModel, InterviewSessionModel, LearningPlanModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        // Get application stats
        const applications = await ApplicationModel.find({ userId: user.userId }).lean();
        const totalApplications = applications.length;
        const interviewCount = applications.filter((app: any) => app.status === 'interview').length;
        const offerCount = applications.filter((app: any) => app.status === 'offer').length;
        const responseRate = totalApplications
            ? Math.round(
                (applications.filter((app: any) => ['viewed', 'interview', 'offer'].includes(app.status)).length /
                    totalApplications) *
                100
            )
            : 0;

        // Get interview practice stats
        const interviewSessions = await InterviewSessionModel.find({
            userId: user.userId,
            completedAt: { $exists: true },
        }).lean();

        const avgInterviewScore =
            interviewSessions.length > 0
                ? Math.round(
                    interviewSessions.reduce((acc: number, s: any) => acc + (s.overallScore || 0), 0) /
                    interviewSessions.length
                )
                : 0;

        // Get learning progress
        const learningPlan = await LearningPlanModel.findOne({
            userId: user.userId,
            status: 'active',
        }).lean();

        const lp = learningPlan as any;
        const learningProgress = lp?.progress || 0;        // Recent activity
        const recentApplications = applications
            .sort((a: any, b: any) => b.appliedAt - a.appliedAt)
            .slice(0, 5)
            .map((app: any) => ({
                id: app._id.toString(),
                jobTitle: 'Software Engineer', // Would come from populated job
                company: 'TechCorp',
                status: app.status,
                appliedAt: app.appliedAt,
            }));

        return NextResponse.json({
            success: true,
            summary: {
                applications: {
                    total: totalApplications,
                    inProgress: applications.filter((app: any) =>
                        ['applied', 'viewed', 'interview'].includes(app.status)
                    ).length,
                    offers: offerCount,
                    responseRate,
                },
                interviews: {
                    total: interviewCount,
                    practiceCount: interviewSessions.length,
                    avgScore: avgInterviewScore,
                },
                learning: {
                    progress: learningProgress,
                    activeSkills: lp?.items?.length || 0,
                },
            },
            recentActivity: recentApplications,
            weeklyStats: {
                applicationsThisWeek: 7,
                interviewsThisWeek: 2,
                hoursLearning: 12,
            },
        });
    } catch (error) {
        console.error('Dashboard summary error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard summary' }, { status: 500 });
    }
}
