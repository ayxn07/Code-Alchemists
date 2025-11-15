import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromToken } from '@/src/server/services/authService';

const trendsSchema = z.object({
    role: z.string(),
    location: z.string().optional(),
    experience: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { role, location, experience } = trendsSchema.parse(body);

        // TODO: Integrate with LLM and market data APIs
        // For now, return mock trends

        return NextResponse.json({
            success: true,
            trends: {
                hotSkills: [
                    { skill: 'React', growth: '+25%', demand: 'High', avgSalary: '$110k' },
                    { skill: 'TypeScript', growth: '+30%', demand: 'High', avgSalary: '$115k' },
                    { skill: 'Python', growth: '+18%', demand: 'Very High', avgSalary: '$120k' },
                    { skill: 'AWS', growth: '+22%', demand: 'High', avgSalary: '$125k' },
                ],
                decliningSkills: [
                    { skill: 'jQuery', growth: '-15%', demand: 'Low' },
                    { skill: 'AngularJS', growth: '-20%', demand: 'Low' },
                ],
                emergingTechnologies: [
                    { tech: 'AI/ML Integration', adoption: 'Rapid', potential: 'Very High' },
                    { tech: 'Edge Computing', adoption: 'Growing', potential: 'High' },
                    { tech: 'Web3', adoption: 'Early', potential: 'Medium' },
                ],
                hiringTrends: {
                    topSectors: ['Technology', 'Healthcare Tech', 'FinTech'],
                    remoteOpportunities: '65% of jobs offer remote work',
                    competitionLevel: 'Medium-High',
                },
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('Market trends error:', error);
        return NextResponse.json({ error: 'Failed to fetch market trends' }, { status: 500 });
    }
}
