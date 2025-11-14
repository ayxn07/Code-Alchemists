import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { JobModel } from '@/src/server/db/models';
import { searchJobsRapidAPI } from '@/src/server/integrations/rapidApiClient';

const searchSchema = z.object({
    role: z.string().optional(),
    location: z.string().optional(),
    remote: z.boolean().optional(),
    salaryMin: z.number().optional(),
    salaryMax: z.number().optional(),
    jobType: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
    skills: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validated = searchSchema.parse(body);

        // Try to fetch from RapidAPI first
        let externalJobs = [];
        try {
            externalJobs = await searchJobsRapidAPI({
                query: validated.role,
                location: validated.location,
                remote: validated.remote,
                datePosted: 'month',
            });

            // Save new jobs to database
            await connectToDatabase();
            for (const job of externalJobs) {
                await JobModel.findOneAndUpdate(
                    { externalId: job.id, provider: job.source },
                    {
                        $set: {
                            title: job.title,
                            company: job.company,
                            location: job.location,
                            description: job.description,
                            salaryRange: job.salary,
                            type: job.type.toLowerCase(),
                            isRemote: job.remote,
                            postedAt: new Date(job.postedDate),
                            externalUrl: job.applyUrl,
                            provider: job.source,
                        },
                    },
                    { upsert: true, new: true }
                );
            }
        } catch (error) {
            console.error('RapidAPI search failed, falling back to database:', error);
        }

        await connectToDatabase();        // Build MongoDB query
        const query: any = {};

        if (validated.role) {
            query.title = { $regex: validated.role, $options: 'i' };
        }

        if (validated.location) {
            query.location = { $regex: validated.location, $options: 'i' };
        }

        if (validated.remote !== undefined) {
            query.isRemote = validated.remote;
        }

        if (validated.salaryMin || validated.salaryMax) {
            query.salaryRange = {};
            if (validated.salaryMin) {
                query['salaryRange.min'] = { $gte: validated.salaryMin };
            }
            if (validated.salaryMax) {
                query['salaryRange.max'] = { $lte: validated.salaryMax };
            }
        }

        if (validated.jobType) {
            query.type = validated.jobType;
        }

        if (validated.skills && validated.skills.length > 0) {
            query.requiredSkills = { $in: validated.skills };
        }

        const jobs = await JobModel.find(query)
            .sort({ postedAt: -1 })
            .limit(50)
            .lean();

        return NextResponse.json({
            success: true,
            jobs: jobs.map((job: any) => ({
                id: job._id.toString(),
                title: job.title,
                company: job.company,
                location: job.location,
                salary: job.salaryRange
                    ? `$${job.salaryRange.min.toLocaleString()} - $${job.salaryRange.max.toLocaleString()}`
                    : 'Not specified',
                remote: job.isRemote,
                type: job.type,
                description: job.description,
                requiredSkills: job.requiredSkills || [],
                postedAt: job.postedAt,
                externalUrl: job.externalUrl,
            })),
            count: jobs.length,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('Job search error:', error);
        return NextResponse.json({ error: 'Failed to search jobs' }, { status: 500 });
    }
}
