import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { ApplicationModel, InterviewSessionModel, LearningPlanModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';
import { activityLogRepository } from '@/src/server/repositories/activityLogRepository';

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();


        // Get application stats (defensive)
        let applications: any[] = [];
        try {
            applications = await ApplicationModel.find({ userId: user.userId }).lean();
        } catch (err) {
            console.error('Error loading applications:', err);
            applications = [];
        }
        const totalApplications = Array.isArray(applications) ? applications.length : 0;
        const interviewCount = Array.isArray(applications) ? applications.filter((app: any) => app.status === 'interview').length : 0;
        const offerCount = Array.isArray(applications) ? applications.filter((app: any) => app.status === 'offer').length : 0;
        const responseRate = totalApplications
            ? Math.round(
                (applications.filter((app: any) => ['viewed', 'interview', 'offer'].includes(app.status)).length /
                    totalApplications) *
                100
            )
            : 0;


        // Get interview practice stats (defensive)
        let interviewSessions: any[] = [];
        try {
            interviewSessions = await InterviewSessionModel.find({
                userId: user.userId,
                completedAt: { $exists: true },
            }).lean();
        } catch (err) {
            console.error('Error loading interview sessions:', err);
            interviewSessions = [];
        }
        const avgInterviewScore =
            Array.isArray(interviewSessions) && interviewSessions.length > 0
                ? Math.round(
                    interviewSessions.reduce((acc: number, s: any) => acc + (s.overallScore || 0), 0) /
                    interviewSessions.length
                )
                : 0;


        // Get learning progress (defensive)
        let learningPlan: any = null;
        try {
            learningPlan = await LearningPlanModel.findOne({
                userId: user.userId,
                overallStatus: { $in: ['in-progress', 'not-started'] },
            }).lean();
        } catch (err) {
            console.error('Error loading learning plan:', err);
            learningPlan = null;
        }
        const lp = learningPlan as any;
        // Calculate progress from completed items
        const totalItems = lp?.items?.length || 0;
        const completedItems = lp?.items?.filter((item: any) => item.status === 'completed')?.length || 0;
        const learningProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;


        // Get recent activity from activity logs (defensive)
        let recentActivity: any[] = [];
        try {
            const activityLogs = await activityLogRepository.getRecentActivity(user.userId, 10);
            if (Array.isArray(activityLogs)) {
                recentActivity = activityLogs.map((log: any) => {
                    let text = '';
                    let icon = '📝';
                    let color = 'blue';
                    let link = '/dashboard';

                    switch (log.type) {
                        case 'application_created':
                            icon = '📝';
                            color = 'blue';
                            text = `Applied to ${log.meta?.jobTitle || 'a position'} at ${log.meta?.company || 'a company'}`;
                            link = `/dashboard/applications`;
                            break;
                        case 'application_status_changed':
                            icon = '🔄';
                            color = 'orange';
                            text = `Application status changed to ${log.meta?.status || 'updated'}`;
                            link = `/dashboard/applications`;
                            break;
                        case 'resume_uploaded':
                            icon = '📄';
                            color = 'purple';
                            text = `Updated resume: ${log.meta?.filename || 'New resume uploaded'}`;
                            link = `/dashboard/cv`;
                            break;
                        case 'interview_started':
                            icon = '🎤';
                            color = 'green';
                            text = `Started mock interview for ${log.meta?.role || 'a role'}`;
                            link = `/dashboard/interview`;
                            break;
                        case 'interview_completed':
                            icon = '✅';
                            color = 'green';
                            text = `Completed mock interview with score ${log.meta?.score || 'N/A'}`;
                            link = `/dashboard/interview`;
                            break;
                        case 'learning_plan_generated':
                            icon = '🎯';
                            color = 'purple';
                            text = `Generated learning plan for ${log.meta?.role || 'skill development'}`;
                            link = `/dashboard/skills`;
                            break;
                        case 'login':
                            icon = '🔐';
                            color = 'gray';
                            text = 'Logged into your account';
                            link = '/dashboard';
                            break;
                        case 'signup':
                            icon = '🎉';
                            color = 'purple';
                            text = 'Created your CareerPilot account';
                            link = '/dashboard';
                            break;
                        default:
                            text = 'Activity logged';
                    }

                    return {
                        id: log._id?.toString?.() || '',
                        icon,
                        text,
                        color,
                        link,
                        time: log.createdAt,
                    };
                });
            } else {
                recentActivity = [];
            }
        } catch (activityError) {
            console.error('Failed to fetch recent activity:', activityError);
            // Continue with empty activity array
        }

        return NextResponse.json({
            success: true,
            totalApplications,
            interviewsScheduled: interviewCount,
            offersReceived: offerCount,
            recentActivity,
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
        });
    } catch (error) {
        console.error('Dashboard summary error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard summary' }, { status: 500 });
    }
}
