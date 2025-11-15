import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { JobModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';

const saveJobSchema = z.object({
    jobId: z.string(),
    title: z.string(),
    company: z.string(),
    location: z.string().optional(),
    salary: z.string().optional(),
    type: z.string().optional(),
    url: z.string().optional(),
    notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        // Get user from token
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { jobId, title, company, location, salary, type, url, notes } = saveJobSchema.parse(body);

        await connectToDatabase();

        // Save or update job in database
        const job = await JobModel.findOneAndUpdate(
            { externalId: jobId },
            {
                $set: {
                    title,
                    company,
                    location,
                    url,
                    source: 'User Saved',
                    postedAt: new Date(),
                },
            },
            { upsert: true, new: true }
        );

        // TODO: Create a SavedJobs collection to track user-specific saved jobs
        // For now, just return success
        return NextResponse.json({
            success: true,
            message: 'Job saved successfully',
            savedJob: {
                jobId: job._id.toString(),
                userId: user.userId,
                title,
                company,
                location,
                salary,
                type,
                url,
                notes,
                savedAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('Save job error:', error);
        return NextResponse.json({ error: 'Failed to save job' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        // In a real app, fetch from SavedJobs collection
        // For now, return empty array
        return NextResponse.json({
            success: true,
            savedJobs: [],
        });
    } catch (error) {
        console.error('Get saved jobs error:', error);
        return NextResponse.json({ error: 'Failed to fetch saved jobs' }, { status: 500 });
    }
}
