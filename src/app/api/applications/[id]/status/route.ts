import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { ApplicationModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';

const updateStatusSchema = z.object({
    status: z.enum(['applied', 'viewed', 'interview', 'assessment', 'offer', 'rejected', 'withdrawn']),
    notes: z.string().optional(),
});

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { status, notes } = updateStatusSchema.parse(body);

        await connectToDatabase();

        const application = await ApplicationModel.findOne({
            _id: params.id,
            userId: user.userId,
        });

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // Update status and add to timeline
        application.status = status;
        application.timeline.push({
            status,
            date: new Date(),
            notes: notes || `Status updated to ${status}`,
        });

        await application.save();

        return NextResponse.json({
            success: true,
            application: {
                id: application._id.toString(),
                status: application.status,
                timeline: application.timeline,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('Update application status error:', error);
        return NextResponse.json({ error: 'Failed to update application status' }, { status: 500 });
    }
}
