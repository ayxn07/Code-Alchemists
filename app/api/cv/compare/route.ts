import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { ResumeModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';

const compareSchema = z.object({
    resumeId: z.string(),
    version1: z.number().optional(),
    version2: z.number().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { resumeId, version1, version2 } = compareSchema.parse(body);

        await connectToDatabase();

        const resume = await ResumeModel.findOne({ _id: resumeId, userId: user.userId });
        if (!resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        if (!resume.versions || resume.versions.length === 0) {
            return NextResponse.json({ error: 'No version history available' }, { status: 400 });
        }

        // Get current version
        const currentContent = resume.rawText;
        const currentScore = resume.atsScore;

        // Get comparison versions
        let content1 = currentContent;
        let score1 = currentScore;
        let label1 = 'Current Version';

        if (version1 !== undefined) {
            const v1 = resume.versions.find((v: any) => v.versionNumber === version1);
            if (v1) {
                content1 = v1.content;
                score1 = v1.atsScore;
                label1 = `Version ${version1}`;
            }
        }

        let content2 = currentContent;
        let score2 = currentScore;
        let label2 = 'Current Version';

        if (version2 !== undefined) {
            const v2 = resume.versions.find((v: any) => v.versionNumber === version2);
            if (v2) {
                content2 = v2.content;
                score2 = v2.atsScore;
                label2 = `Version ${version2}`;
            }
        }

        return NextResponse.json({
            success: true,
            comparison: {
                version1: {
                    label: label1,
                    content: content1,
                    atsScore: score1,
                },
                version2: {
                    label: label2,
                    content: content2,
                    atsScore: score2,
                },
            },
            availableVersions: resume.versions.map((v: any) => ({
                versionNumber: v.versionNumber,
                changes: v.changes,
                atsScore: v.atsScore,
                createdAt: v.createdAt,
            })),
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('Compare versions error:', error);
        return NextResponse.json({ error: 'Failed to compare versions' }, { status: 500 });
    }
}
