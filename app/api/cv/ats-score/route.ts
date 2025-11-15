import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { ResumeModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';
import { generateJSON } from '@/src/server/integrations/geminiClient';

const atsScoreSchema = z.object({
    resumeId: z.string(),
    jobDescription: z.string().optional(),
});

interface ATSAnalysis {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    keywordMatches: string[];
}

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { resumeId, jobDescription } = atsScoreSchema.parse(body);

        await connectToDatabase();

        const resume = await ResumeModel.findOne({ _id: resumeId, userId: user.userId });
        if (!resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // Use Gemini to analyze resume for ATS compatibility
        const systemInstruction = `You are an ATS (Applicant Tracking System) expert. Analyze the resume and provide:
1. ATS Score (0-100)
2. Strengths (3-5 points)
3. Weaknesses (3-5 points)
4. Specific suggestions for improvement (5-7 points)
5. Keyword matches found

Return as JSON:
{
  "score": number,
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[],
  "keywordMatches": string[]
}`;

        const analysisPrompt = jobDescription
            ? `Analyze this resume against this job description:\n\nJob Description:\n${jobDescription}\n\nResume:\n${resume.rawText}`
            : `Analyze this resume for general ATS compatibility:\n\n${resume.rawText}`;

        const atsAnalysis = await generateJSON<ATSAnalysis>(analysisPrompt, systemInstruction);

        // Update resume with ATS analysis
        resume.atsScore = atsAnalysis.score;
        resume.atsAnalysis = atsAnalysis;
        await resume.save();

        return NextResponse.json({
            success: true,
            analysis: atsAnalysis,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('ATS Score error:', error);
        return NextResponse.json({ error: 'Failed to analyze resume' }, { status: 500 });
    }
}
