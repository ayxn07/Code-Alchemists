import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromToken } from '@/src/server/services/authService';

const analyzeSchema = z.object({
    targetRole: z.string(),
    userSkills: z.array(z.string()),
    experience: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { targetRole, userSkills, experience } = analyzeSchema.parse(body);

        // TODO: Integrate with LLM to analyze skill gaps
        // For now, return mock data

        const mockRequiredSkills = [
            'React',
            'TypeScript',
            'Node.js',
            'MongoDB',
            'AWS',
            'Docker',
            'Kubernetes',
            'GraphQL',
            'Testing (Jest, Cypress)',
            'CI/CD',
        ];

        const missingSkills = mockRequiredSkills.filter((skill) => !userSkills.includes(skill));
        const matchingSkills = mockRequiredSkills.filter((skill) => userSkills.includes(skill));
        const matchPercent = Math.round((matchingSkills.length / mockRequiredSkills.length) * 100);

        const outdatedSkills = userSkills.filter((skill) =>
            ['jQuery', 'AngularJS', 'Backbone.js'].includes(skill)
        );

        return NextResponse.json({
            success: true,
            analysis: {
                targetRole,
                matchPercent,
                strongSkills: matchingSkills,
                missingSkills,
                outdatedSkills,
                recommendations: [
                    'Focus on learning containerization technologies (Docker, Kubernetes)',
                    'Build projects showcasing GraphQL API development',
                    'Obtain AWS certification to strengthen cloud credentials',
                ],
                marketDemand: {
                    high: ['React', 'TypeScript', 'AWS'],
                    medium: ['Node.js', 'MongoDB'],
                    growing: ['Kubernetes', 'GraphQL'],
                },
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('Skill analysis error:', error);
        return NextResponse.json({ error: 'Failed to analyze skills' }, { status: 500 });
    }
}
