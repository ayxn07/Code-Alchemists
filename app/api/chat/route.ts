import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromToken } from '@/src/server/services/authService';
import { getUserProfile } from '@/src/server/services/profileService';
import { generateChat } from '@/src/server/integrations/geminiClient';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { ResumeModel, ApplicationModel } from '@/src/server/db/models';

const chatSchema = z.object({
    message: z.string(),
    conversationHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
    })).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { message, conversationHistory = [] } = chatSchema.parse(body);

        await connectToDatabase();

        // Get user context for personalized responses
        const profile = await getUserProfile(user.userId);
        const resumes = await ResumeModel.find({ userId: user.userId }).sort({ createdAt: -1 }).limit(1).lean();
        const applications = await ApplicationModel.find({ userId: user.userId }).sort({ createdAt: -1 }).limit(5).lean();

        // Build context for Gemini
        const userContext = `
User Profile:
- Name: ${user.name}
- Email: ${user.email}
- Headline: ${(profile as any)?.headline || 'Not set'}
- Skills: ${(profile as any)?.skills?.join(', ') || 'Not set'}
- Target Roles: ${(profile as any)?.targetRoles?.join(', ') || 'Not set'}
- Experience Level: ${(profile as any)?.experienceYears || 'Not set'} years

Recent Activity:
- Total Applications: ${applications.length}
- Has Resume: ${resumes.length > 0 ? 'Yes' : 'No'}
${resumes.length > 0 ? `- Latest Resume ATS Score: ${(resumes[0] as any)?.atsScore || 'Not scored'}` : ''}
        `.trim();

        const systemInstruction = `You are CareerPilot, an expert AI career advisor and job search assistant. You help users with:
- Resume and CV optimization
- Job search strategies
- Interview preparation
- Skill development and learning paths
- Career planning and transitions
- Application tracking and follow-ups
- Salary negotiations
- Professional networking

Guidelines:
- Be professional, encouraging, and actionable
- Provide specific, practical advice tailored to the user's profile
- Reference their actual data (skills, applications, resumes) when relevant
- Keep responses concise but comprehensive (2-4 paragraphs max)
- Use bullet points for lists and action items
- Ask clarifying questions when needed
- Celebrate wins and offer constructive guidance for challenges

User Context:
${userContext}

Always keep the user's career goals and current situation in mind when responding.`;

        // Build conversation with history
        const messages = [
            ...conversationHistory,
            { role: 'user' as const, content: message },
        ];

        console.log('[ChatBot] Generating response for user:', user.userId);

        const response = await generateChat(messages, systemInstruction);

        console.log('[ChatBot] Response generated (truncated):', response.slice(0, 200));

        return NextResponse.json({
            success: true,
            response,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('[ChatBot] Error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({
            error: 'Failed to generate response',
            details: errorMessage
        }, { status: 500 });
    }
}
