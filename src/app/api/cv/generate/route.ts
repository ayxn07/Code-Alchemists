import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { ResumeModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';
import { getUserProfile } from '@/src/server/services/profileService';
import { generateText } from '@/src/server/integrations/geminiClient';

const generateSchema = z.object({
    template: z.enum(['harvard', 'modern', 'professional', 'minimal']),
    targetRole: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { template, targetRole } = generateSchema.parse(body);

        await connectToDatabase();

        // Get user profile
        const profile = await getUserProfile(user.userId);
        if (!profile) {
            return NextResponse.json({ error: 'Please complete your profile first' }, { status: 400 });
        }

        // Use Gemini to generate CV content
        const systemInstruction = `You are an expert CV writer. Generate a professional CV in plain text format.
Use the ${template} template style.
${targetRole ? `Tailor the CV for a ${targetRole} position.` : ''}
Include: summary, experience, education, skills sections.
Use bullet points with quantifiable achievements.`;

        const p = profile as any;
        const profileInfo = `
Name: ${user.name}
Email: ${user.email}
Headline: ${p.headline || 'Not provided'}
About: ${p.about || 'Not provided'}
Skills: ${p.skills?.join(', ') || 'Not provided'}
Target Roles: ${p.targetRoles?.join(', ') || 'Not provided'}
Experience Level: ${p.experienceLevel || 'Not provided'}
    `.trim();

        const cvContent = await generateText(
            `Generate a professional CV with this profile information:\n\n${profileInfo}`,
            systemInstruction
        );

        // Save generated CV
        const resume = await ResumeModel.create({
            userId: user.userId,
            title: `Generated CV - ${template} (${new Date().toLocaleDateString()})`,
            rawText: cvContent,
            structuredData: {
                template,
                generatedAt: new Date(),
                targetRole,
            },
            isPrimary: false,
        });

        return NextResponse.json({
            success: true,
            resume: {
                id: resume._id.toString(),
                title: resume.title,
                content: cvContent,
                createdAt: resume.createdAt,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('Generate CV error:', error);
        return NextResponse.json({ error: 'Failed to generate CV' }, { status: 500 });
    }
}
