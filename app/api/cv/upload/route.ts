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
import { activityLogRepository } from '@/src/server/repositories/activityLogRepository';

const uploadSchema = z.object({
    title: z.string(),
    content: z.string().optional(),
    pdfData: z.string().optional(), // Base64 encoded PDF
    isPrimary: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, content, pdfData, isPrimary } = uploadSchema.parse(body);

        await connectToDatabase();

        let extractedContent = content || '';

        // If PDF data is provided, extract text from it
        if (pdfData) {
            try {
                // Remove the data URL prefix if present
                const base64Data = pdfData.includes('base64,')
                    ? pdfData.split('base64,')[1]
                    : pdfData;

                const pdfBuffer = Buffer.from(base64Data, 'base64');

                // Use require for pdf-parse to avoid ESM issues
                const pdfParse = require('pdf-parse');
                const pdfParsed = await pdfParse(pdfBuffer);
                extractedContent = pdfParsed.text;

                if (!extractedContent || extractedContent.trim().length === 0) {
                    return NextResponse.json(
                        { error: 'Could not extract text from PDF. Please ensure it\'s not an image-only PDF.' },
                        { status: 400 }
                    );
                }
            } catch (pdfError) {
                console.error('PDF parsing error:', pdfError);
                return NextResponse.json(
                    { error: 'Failed to parse PDF file. Please ensure it\'s a valid PDF.' },
                    { status: 400 }
                );
            }
        }

        if (!extractedContent || extractedContent.trim().length === 0) {
            return NextResponse.json(
                { error: 'No content provided. Please upload a PDF or provide text content.' },
                { status: 400 }
            );
        }

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
                `Parse this CV and extract structured information:\n\n${extractedContent}`,
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
            rawText: extractedContent,
            structuredData,
            isPrimary: isPrimary || false,
            versions: [{
                versionNumber: 1,
                content: extractedContent,
                changes: 'Initial upload',
                createdAt: new Date(),
            }],
        });

        // Log resume upload activity
        try {
            await activityLogRepository.logActivity(user.userId, 'resume_uploaded', {
                resumeId: resume._id.toString(),
                filename: title,
                isPrimary: isPrimary || false,
            });
        } catch (err) {
            console.error('Failed to log resume upload activity:', err);
        }

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
