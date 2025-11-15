import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { JobModel } from '@/src/server/db/models';
import { searchJobsRapidAPI } from '@/src/server/integrations/rapidApiClient';

const searchSchema = z.object({
    query: z.string().optional(),
    location: z.string().optional(),
    remote: z.boolean().optional(),
    salaryMin: z.number().optional(),
    salaryMax: z.number().optional(),
    employmentTypes: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    page: z.number().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validated = searchSchema.parse(body);

        // Fetch jobs from RapidAPI
        let rapidAPIJobs = [];
        try {
            console.log('Calling RapidAPI with params:', {
                query: validated.query || 'Data Engineer',
                location: validated.location,
            });

            const rapidResponse = await searchJobsRapidAPI({
                query: validated.query || 'Data Engineer',
                location: validated.location,
                remote: validated.remote,
                employmentTypes: validated.employmentTypes,
                datePosted: 'month',
                page: validated.page || 1,
            });

            console.log('RapidAPI response received:', rapidResponse?.length, 'jobs');

            // Keep RapidAPI format as-is (it already matches the expected format)
            rapidAPIJobs = rapidResponse;

            // Save jobs to database in background
            if (rapidResponse && rapidResponse.length > 0) {
                connectToDatabase().then(async () => {
                    for (const job of rapidResponse) {
                        await JobModel.findOneAndUpdate(
                            { externalId: job.id, provider: 'linkedin' },
                            {
                                $set: {
                                    title: job.title,
                                    company: job.organization,
                                    location: job.locations_derived?.[0] || 'Not specified',
                                    remote: job.remote_derived,
                                    postedAt: new Date(job.date_posted),
                                    url: job.url,
                                    source: 'linkedin',
                                    salaryRange: job.salary_raw?.value ? {
                                        min: job.salary_raw.value.minValue,
                                        max: job.salary_raw.value.maxValue,
                                        currency: job.salary_raw.currency
                                    } : null,
                                    rawData: job,
                                },
                            },
                            { upsert: true, new: true }
                        );
                    }
                }).catch(err => console.error('Failed to save jobs to DB:', err));
            }

            // Return RapidAPI results immediately (even if empty array)
            if (rapidAPIJobs.length > 0) {
                return NextResponse.json({
                    success: true,
                    jobs: rapidAPIJobs,
                    count: rapidAPIJobs.length,
                    source: 'RapidAPI-LinkedIn',
                });
            } else {
                console.log('RapidAPI returned 0 jobs, falling back to database...');
            }
        } catch (error) {
            console.error('RapidAPI search failed:', error);
            // Continue to database fallback
        }

        // Fallback to database if RapidAPI failed
        await connectToDatabase();
        const query: any = {};

        if (validated.query) {
            query.title = { $regex: validated.query, $options: 'i' };
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

        if (validated.employmentTypes && validated.employmentTypes.length > 0) {
            query.type = { $in: validated.employmentTypes };
        }

        if (validated.skills && validated.skills.length > 0) {
            query.requiredSkills = { $in: validated.skills };
        }

        const jobs = await JobModel.find(query)
            .sort({ postedAt: -1 })
            .limit(50)
            .lean();

        // Convert database jobs to match RapidAPI format
        const formattedJobs = jobs.map((job: any) => ({
            id: job._id?.toString() || job.externalId,
            title: job.title,
            organization: job.company,
            organization_logo: job.rawData?.organization_logo || null,
            locations_derived: job.location ? [job.location] : [],
            salary_raw: job.salaryRange ? {
                currency: 'USD',
                value: {
                    minValue: job.salaryRange.min,
                    maxValue: job.salaryRange.max,
                }
            } : null,
            employment_type: job.type ? [job.type] : [],
            remote_derived: job.remote || false,
            date_posted: job.postedAt?.toISOString(),
            url: job.url,
            description_text: job.rawData?.description,
        }));

        return NextResponse.json({
            success: true,
            jobs: formattedJobs,
            count: formattedJobs.length,
            source: 'Database',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('Job search error:', error);
        return NextResponse.json({ error: 'Failed to search jobs' }, { status: 500 });
    }
}
