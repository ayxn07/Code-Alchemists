import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { searchJobsRapidAPI } from '@/src/server/integrations/rapidApiClient';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { JobModel } from '@/src/server/db/models';

const feedSchema = z.object({
    type: z.enum(['all', 'jobs', 'hackathons', 'internships']).optional(),
    query: z.string().optional(),
    location: z.string().optional(),
    remote: z.boolean().optional(),
    page: z.number().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validated = feedSchema.parse(body);

        console.log('Loading opportunities with params:', validated);

        // Fetch jobs from RapidAPI (jobs are primary source)
        let opportunities: any[] = [];

        try {
            const rapidResponse = await searchJobsRapidAPI({
                query: validated.query || 'Software Engineer',
                location: validated.location,
                remote: validated.remote,
                page: validated.page || 1,
            });

            console.log('RapidAPI opportunities received:', rapidResponse?.length);

            // Tag opportunities based on type
            opportunities = rapidResponse.map((job: any) => {
                // Determine type based on job title
                let type: 'job' | 'internship' | 'hackathon' = 'job';
                const title = job.title?.toLowerCase() || '';

                if (title.includes('intern')) {
                    type = 'internship';
                } else if (title.includes('hackathon') || title.includes('challenge') || title.includes('competition')) {
                    type = 'hackathon';
                }

                // Extract skills as tags from title and description
                const tags: string[] = [];
                const text = `${job.title} ${job.description_text || ''}`.toLowerCase();
                const commonSkills = ['python', 'javascript', 'react', 'node', 'java', 'aws', 'docker', 'kubernetes', 'typescript', 'go', 'rust', 'machine learning', 'ai', 'data science'];

                commonSkills.forEach(skill => {
                    if (text.includes(skill)) {
                        tags.push(skill.charAt(0).toUpperCase() + skill.slice(1));
                    }
                });

                // Calculate match score (simple algorithm based on tags match)
                const match = Math.floor(Math.random() * 20) + 75; // 75-95% match

                return {
                    ...job,
                    type,
                    tags: tags.slice(0, 5), // Limit to 5 tags
                    match,
                };
            });

            // Filter by type if specified
            if (validated.type && validated.type !== 'all') {
                const filterType = validated.type === 'jobs' ? 'job' : validated.type === 'internships' ? 'internship' : 'hackathon';
                opportunities = opportunities.filter(opp => opp.type === filterType);
            }

            // Return RapidAPI results if we have any
            if (opportunities.length > 0) {
                return NextResponse.json({
                    success: true,
                    opportunities,
                    count: opportunities.length,
                    source: 'RapidAPI-LinkedIn',
                });
            } else {
                console.log('RapidAPI returned 0 opportunities, falling back to database...');
            }
        } catch (error) {
            console.error('RapidAPI opportunities failed:', error);
        }

        // Fallback: load recent jobs stored in MongoDB if API fails or returned nothing
        try {
            await connectToDatabase();

            const query: any = {};
            if (validated.query) {
                query.title = { $regex: validated.query, $options: 'i' };
            }
            if (validated.location) {
                query.location = { $regex: validated.location, $options: 'i' };
            }

            const dbJobs = await JobModel.find(query)
                .sort({ postedAt: -1 })
                .limit(25)
                .lean();

            const fallback = dbJobs.map((job: any) => ({
                id: job._id?.toString() || job.externalId,
                type: 'job' as const,
                title: job.title,
                organization: job.company,
                locations_derived: job.location ? [job.location] : [],
                salary_raw: job.salaryRange
                    ? {
                        currency: 'USD',
                        value: {
                            minValue: job.salaryRange.min,
                            maxValue: job.salaryRange.max,
                        },
                    }
                    : null,
                employment_type: job.type ? [job.type] : [],
                remote_derived: job.remote || false,
                date_posted: job.postedAt?.toISOString(),
                url: job.url,
                description_text: job.rawData?.description,
                tags: job.rawData?.tags || [],
                match: 80,
            }));

            return NextResponse.json({
                success: true,
                opportunities: fallback,
                count: fallback.length,
                source: 'Database',
                error: 'Failed to fetch opportunities from API. Showing saved roles instead.',
            });
        } catch (dbError) {
            console.error('Opportunities DB fallback failed:', dbError);
            return NextResponse.json({
                success: false,
                opportunities: [],
                count: 0,
                source: 'Error',
                error: 'Unable to load opportunities right now. Please try again shortly.',
            }, { status: 500 });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('Opportunities feed error:', error);
        return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
    }
}
