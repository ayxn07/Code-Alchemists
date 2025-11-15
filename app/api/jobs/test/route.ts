import { NextResponse } from 'next/server';
import { searchJobsRapidAPI } from '@/src/server/integrations/rapidApiClient';

export async function GET() {
    try {
        const jobs = await searchJobsRapidAPI({
            query: 'Data Engineer',
            location: '',
            page: 1,
        });

        return NextResponse.json({
            success: true,
            count: jobs.length,
            sample: jobs[0], // Return first job to see structure
            jobs: jobs.slice(0, 3), // Return first 3 jobs
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
        }, { status: 500 });
    }
}
