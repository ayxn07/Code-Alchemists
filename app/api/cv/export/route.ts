import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { ResumeModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';

const exportSchema = z.object({
    resumeId: z.string(),
    template: z.enum(['harvard', 'modern', 'minimalist', 'creative']).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { resumeId, template = 'harvard' } = exportSchema.parse(body);

        await connectToDatabase();

        const resume = await ResumeModel.findOne({ _id: resumeId, userId: user.userId });
        if (!resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // Return resume data with template info for client-side PDF generation
        return NextResponse.json({
            success: true,
            resume: {
                title: resume.title,
                content: resume.rawText,
                structuredData: resume.structuredData,
                template,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('Export PDF error:', error);
        return NextResponse.json({ error: 'Failed to export PDF' }, { status: 500 });
    }
}
