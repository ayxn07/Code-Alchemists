import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { ResumeModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';
import { generateText } from '@/src/server/integrations/geminiClient';

const rewriteSchema = z.object({
    resumeId: z.string(),
    section: z.string(),
    sectionContent: z.string(),
    targetRole: z.string().optional(),
    improvements: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { resumeId, section, sectionContent, targetRole, improvements } = rewriteSchema.parse(body);

        await connectToDatabase();

        const resume = await ResumeModel.findOne({ _id: resumeId, userId: user.userId });
        if (!resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // Use Gemini to rewrite the section
        const systemInstruction = `You are an expert resume writer. Rewrite the following resume section to make it more impactful and ATS-friendly.

Guidelines:
- Use strong action verbs
- Include quantifiable achievements
- Make it concise and impactful
- Optimize for ATS keywords
- Maintain professional tone
${targetRole ? `- Tailor for ${targetRole} position` : ''}
${improvements?.length ? `- Focus on: ${improvements.join(', ')}` : ''}

Return ONLY the rewritten content, no explanations.`;

        const rewrittenContent = await generateText(
            `Section: ${section}\n\nOriginal Content:\n${sectionContent}`,
            systemInstruction
        );

        // Save as new version
        const currentVersion = resume.versions?.length || 0;
        const newVersion = {
            versionNumber: currentVersion + 1,
            content: resume.rawText,
            atsScore: resume.atsScore,
            changes: `Rewrote ${section} section`,
            createdAt: new Date(),
        };

        // Update the resume with new version
        if (!resume.versions) {
            resume.versions = [];
        }
        resume.versions.push(newVersion);

        // Update the main content (this is simplified - in production, you'd need proper section replacement)
        const updatedContent = resume.rawText.replace(sectionContent, rewrittenContent);
        resume.rawText = updatedContent;
        resume.markModified('versions');
        await resume.save();

        return NextResponse.json({
            success: true,
            original: sectionContent,
            rewritten: rewrittenContent,
            versionNumber: newVersion.versionNumber,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('AI Rewrite error:', error);
        return NextResponse.json({ error: 'Failed to rewrite section' }, { status: 500 });
    }
}
