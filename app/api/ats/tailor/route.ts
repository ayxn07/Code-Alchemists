import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromToken } from '@/src/server/services/authService';

const tailorSchema = z.object({
    jobDescription: z.string(),
    resumeId: z.string(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { jobDescription, resumeId } = tailorSchema.parse(body);

        // TODO: Integrate with LLM for CV tailoring
        // For now, return mock tailored sections

        return NextResponse.json({
            success: true,
            tailoredResume: {
                summary: `Experienced software engineer with 5+ years specializing in the exact technologies mentioned in the job description. Proven track record of delivering scalable solutions aligned with your requirements.`,
                skills: [
                    'React (mentioned 3x in JD)',
                    'TypeScript (required)',
                    'Node.js (backend requirement)',
                    'AWS (cloud infrastructure)',
                    'Docker & Kubernetes (DevOps)',
                ],
                experience: [
                    {
                        title: 'Senior Software Engineer',
                        company: 'TechCorp',
                        bullets: [
                            '• Built scalable microservices architecture using Node.js and Docker (directly matches JD requirement)',
                            '• Led team of 5 engineers in developing React-based admin dashboard (aligns with frontend needs)',
                            '• Reduced deployment time by 60% through CI/CD pipeline optimization (matches DevOps focus)',
                        ],
                    },
                ],
                keywords: {
                    matched: ['React', 'TypeScript', 'Node.js', 'AWS', 'Agile', 'Team Leadership'],
                    missing: ['GraphQL', 'PostgreSQL'],
                    suggestions: 'Consider highlighting any GraphQL or PostgreSQL experience if applicable',
                },
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('ATS tailor error:', error);
        return NextResponse.json({ error: 'Failed to tailor resume' }, { status: 500 });
    }
}
