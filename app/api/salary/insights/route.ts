import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromToken } from '@/src/server/services/authService';

const salarySchema = z.object({
    role: z.string(),
    location: z.string(),
    experience: z.string().optional(),
    skills: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { role, location, experience, skills } = salarySchema.parse(body);

        // TODO: Integrate with salary data APIs and LLM
        // For now, return mock insights

        const baseMin = 80000;
        const baseMax = 150000;
        const experienceMultiplier = experience === 'senior' ? 1.4 : experience === 'mid' ? 1.2 : 1.0;

        return NextResponse.json({
            success: true,
            insights: {
                salaryRange: {
                    min: Math.round(baseMin * experienceMultiplier),
                    max: Math.round(baseMax * experienceMultiplier),
                    currency: 'USD',
                    period: 'annual',
                },
                marketAverage: Math.round(((baseMin + baseMax) / 2) * experienceMultiplier),
                percentile: 65,
                breakdown: {
                    baseSalary: Math.round((baseMin + baseMax) / 2 * experienceMultiplier * 0.85),
                    bonus: Math.round((baseMin + baseMax) / 2 * experienceMultiplier * 0.1),
                    equity: Math.round((baseMin + baseMax) / 2 * experienceMultiplier * 0.05),
                },
                byCompanySize: {
                    startup: `$${Math.round(baseMin * experienceMultiplier * 0.9).toLocaleString()} - $${Math.round(baseMax * experienceMultiplier * 0.95).toLocaleString()}`,
                    midSize: `$${Math.round(baseMin * experienceMultiplier).toLocaleString()} - $${Math.round(baseMax * experienceMultiplier).toLocaleString()}`,
                    enterprise: `$${Math.round(baseMin * experienceMultiplier * 1.1).toLocaleString()} - $${Math.round(baseMax * experienceMultiplier * 1.15).toLocaleString()}`,
                },
                recommendations: [
                    'Your expected range aligns with market rates for this role',
                    'Consider highlighting AWS and React skills for 10-15% salary boost',
                    'Companies in San Francisco typically pay 20% more for this role',
                ],
                topPayingCompanies: [
                    { name: 'Google', range: '$150k - $220k', benefits: 'Excellent' },
                    { name: 'Meta', range: '$145k - $215k', benefits: 'Excellent' },
                    { name: 'Amazon', range: '$130k - $200k', benefits: 'Good' },
                ],
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('Salary insights error:', error);
        return NextResponse.json({ error: 'Failed to fetch salary insights' }, { status: 500 });
    }
}
