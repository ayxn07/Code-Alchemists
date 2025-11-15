import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { ApplicationModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';
import { activityLogRepository } from '@/src/server/repositories/activityLogRepository';

const createApplicationSchema = z.object({
    jobId: z.string(),
    resumeId: z.string(),
    coverLetter: z.string().optional(),
    notes: z.string().optional(),
    source: z.string().optional(),
});

const updateStatusSchema = z.object({
    status: z.enum(['applied', 'viewed', 'interview', 'assessment', 'offer', 'rejected', 'withdrawn']),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validated = createApplicationSchema.parse(body);

        await connectToDatabase();

        const application = await ApplicationModel.create({
            userId: user.userId,
            jobId: validated.jobId,
            resumeId: validated.resumeId,
            coverLetter: validated.coverLetter,
            notes: validated.notes,
            source: validated.source || 'manual',
            status: 'applied',
            appliedAt: new Date(),
            timeline: [
                {
                    status: 'applied',
                    date: new Date(),
                    notes: 'Application submitted',
                },
            ],
        });

        // Populate job to get details for activity log
        await application.populate('jobId');
        const job = application.jobId as any;

        // Log application created activity
        try {
            await activityLogRepository.logActivity(user.userId, 'application_created', {
                jobTitle: job?.title || 'Unknown Position',
                company: job?.company || 'Unknown Company',
                applicationId: application._id.toString(),
            });
        } catch (err) {
            console.error('Failed to log application activity:', err);
        }

        return NextResponse.json({
            success: true,
            application: {
                id: application._id.toString(),
                jobId: application.jobId,
                status: application.status,
                appliedAt: application.appliedAt,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('Create application error:', error);
        return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '50');

        await connectToDatabase();

        const query: any = { userId: user.userId };
        if (status) {
            query.status = status;
        }

        const applications = await ApplicationModel.find(query)
            .sort({ appliedAt: -1 })
            .limit(limit)
            .populate('jobId')
            .lean();

        return NextResponse.json({
            success: true,
            applications: applications.map((app: any) => ({
                id: app._id.toString(),
                job: {
                    id: app.jobId?._id?.toString(),
                    title: app.jobId?.title,
                    company: app.jobId?.company,
                    location: app.jobId?.location,
                },
                status: app.status,
                appliedAt: app.appliedAt,
                notes: app.notes,
                timeline: app.timeline,
            })),
            count: applications.length,
        });
    } catch (error) {
        console.error('Get applications error:', error);
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }
}
