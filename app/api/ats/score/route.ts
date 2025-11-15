import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromToken } from '@/src/server/services/authService';

const scoreSchema = z.object({
    jobDescription: z.string(),
    resumeText: z.string(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { jobDescription, resumeText } = scoreSchema.parse(body);

        // TODO: Integrate with LLM for ATS scoring
        // For now, return mock score

        const score = Math.floor(Math.random() * 30) + 70; // 70-100

        return NextResponse.json({
            success: true,
            atsScore: {
                overall: score,
                breakdown: {
                    keywordMatch: score - 5,
                    formatting: 95,
                    skillsAlignment: score + 2,
                    experienceRelevance: score - 3,
                    quantifiableAchievements: score - 10,
                },
                recommendations: [
                    {
                        severity: 'high',
                        category: 'keywords',
                        message: 'Add these missing keywords from the job description: GraphQL, PostgreSQL, CI/CD',
                    },
                    {
                        severity: 'medium',
                        category: 'formatting',
                        message: 'Use bullet points consistently throughout all experience sections',
                    },
                    {
                        severity: 'low',
                        category: 'content',
                        message: 'Add more quantifiable achievements (e.g., "Increased performance by 40%")',
                    },
                ],
                matchedKeywords: [
                    'React',
                    'TypeScript',
                    'Node.js',
                    'AWS',
                    'Agile',
                    'Leadership',
                    'Microservices',
                    'Docker',
                ],
                missingKeywords: ['GraphQL', 'PostgreSQL', 'CI/CD', 'Test-Driven Development'],
                improvementTips: [
                    'Tailor your professional summary to mirror the job description language',
                    'Reorganize skills section to prioritize required technologies',
                    'Add specific metrics to demonstrate impact in previous roles',
                ],
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('ATS score error:', error);
        return NextResponse.json({ error: 'Failed to calculate ATS score' }, { status: 500 });
    }
}
