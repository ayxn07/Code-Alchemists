import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/src/server/services/authService';

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // all, jobs, hackathons, internships

        // TODO: Integrate with job APIs, hackathon platforms, internship boards
        // For now, return mock feed

        const mockOpportunities = [
            {
                id: '1',
                type: 'job',
                title: 'Senior Full Stack Developer',
                organization: 'TechCorp',
                location: 'San Francisco, CA',
                remote: true,
                salary: '$120k - $160k',
                tags: ['React', 'Node.js', 'TypeScript'],
                postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                matchScore: 92,
                urgent: false,
            },
            {
                id: '2',
                type: 'hackathon',
                title: 'AI Innovation Challenge 2024',
                organization: 'MLH',
                location: 'Virtual',
                prize: '$50,000',
                tags: ['AI', 'Machine Learning', 'Python'],
                deadline: '2024-02-15',
                participants: 500,
                postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: '3',
                type: 'internship',
                title: 'Summer Software Engineering Intern',
                organization: 'DataWorks',
                location: 'New York, NY',
                remote: false,
                salary: '$30/hour',
                tags: ['Python', 'Data Science', 'React'],
                duration: '12 weeks',
                matchScore: 85,
                postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            },
        ];

        const filtered = type && type !== 'all'
            ? mockOpportunities.filter(opp => opp.type === type.slice(0, -1))
            : mockOpportunities;

        return NextResponse.json({
            success: true,
            opportunities: filtered,
            count: filtered.length,
            filters: {
                types: ['job', 'hackathon', 'internship'],
                activeFilters: type ? [type] : [],
            },
        });
    } catch (error) {
        console.error('Opportunities feed error:', error);
        return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
    }
}
