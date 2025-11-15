import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { ResumeModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';
import { generateJSON } from '@/src/server/integrations/geminiClient';

interface ParsedCV {
    summary?: string;
    experience?: Array<{
        title: string;
        company: string;
        startDate?: string;
        endDate?: string;
        bullets: string[];
    }>;
    education?: Array<{
        degree: string;
        institution: string;
        year?: string;
    }>;
    skills?: string[];
    certifications?: Array<{
        name: string;
        issuer: string;
        year?: string;
    }>;
}

const uploadSchema = z.object({
    title: z.string(),
    content: z.string(),
    isPrimary: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, content, isPrimary } = uploadSchema.parse(body);

        await connectToDatabase();

        // Use Gemini to parse CV into structured format
        const systemInstruction = `You are a CV parser. Extract structured information from the CV text.
Return a JSON object with these fields:
- summary: string (professional summary)
- experience: array of {title, company, startDate, endDate, bullets: string[]}
- education: array of {degree, institution, year}
- skills: array of skill names (string[])
- certifications: array of {name, issuer, year}`;

        let structuredData: ParsedCV = {};
        try {
            structuredData = await generateJSON<ParsedCV>(
                `Parse this CV and extract structured information:\n\n${content}`,
                systemInstruction
            );
        } catch (error) {
            console.error('Failed to parse CV with Gemini:', error);
            // Continue with empty structured data
        }

        // If isPrimary, unset other primary resumes
        if (isPrimary) {
            await ResumeModel.updateMany(
                { userId: user.userId, isPrimary: true },
                { $set: { isPrimary: false } }
            );
        }

        const resume = await ResumeModel.create({
            userId: user.userId,
            title,
            rawText: content,
            structuredData,
            isPrimary: isPrimary || false,
        });

        return NextResponse.json({
            success: true,
            resume: {
                id: resume._id.toString(),
                title: resume.title,
                isPrimary: resume.isPrimary,
                createdAt: resume.createdAt,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('Upload CV error:', error);
        return NextResponse.json({ error: 'Failed to upload CV' }, { status: 500 });
    }
}
