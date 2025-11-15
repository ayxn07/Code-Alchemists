import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { InterviewSessionModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';
import { activityLogRepository } from '@/src/server/repositories/activityLogRepository';
import { profileRepository } from '@/src/server/repositories/profileRepository';
import { resumeRepository } from '@/src/server/repositories/resumeRepository';
import { generateText } from '@/src/server/integrations/geminiClient';

const startInterviewSchema = z.object({
    targetRole: z.string(),
    mode: z.enum(['hr', 'technical', 'behavioral']),
    options: z.object({
        voiceEnabled: z.boolean().optional(),
        videoEnabled: z.boolean().optional(),
    }).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { targetRole, mode, options } = startInterviewSchema.parse(body);

        await connectToDatabase();

        // Fetch user profile and resume for context
        const profile = await profileRepository.getProfileByUserId(user.userId);
        const resumes = await resumeRepository.getUserResumes(user.userId);
        const primaryResume = resumes.find(r => r.isPrimary) || resumes[0];

        const context = {
            targetRole,
            mode,
            userBackground: profile ? {
                headline: profile.headline,
                skills: profile.skills || [],
                experienceYears: profile.experienceYears,
            } : null,
            resumeSnippet: primaryResume?.rawText?.substring(0, 500) || 'No resume available',
        };

        // Generate first question using Gemini AI
        const modeDescriptions = {
            hr: 'HR/General interview focusing on background, motivation, cultural fit, and soft skills',
            technical: 'Technical interview with coding problems, system design, architecture questions, and technical concepts',
            behavioral: 'Behavioral interview using STAR method (Situation, Task, Action, Result) to assess past experiences and problem-solving',
        };

        const prompt = `You are an experienced interviewer conducting a ${modeDescriptions[mode]} for the role of ${targetRole}.

CANDIDATE CONTEXT:
${context.userBackground ? `
- Headline: ${context.userBackground.headline || 'Not provided'}
- Skills: ${context.userBackground.skills.join(', ') || 'None listed'}
- Experience: ${context.userBackground.experienceYears || 0} years
` : '- No profile information available'}

Resume Summary: ${context.resumeSnippet}

Generate the FIRST interview question for this candidate. The question should be:
- Appropriate for a ${mode} interview
- Relevant to the ${targetRole} position
- Clear and professional
- Open-ended to encourage detailed responses

Return ONLY the interview question text, nothing else.`;

        let firstQuestion: string;
        try {
            firstQuestion = await generateText(prompt);
            firstQuestion = firstQuestion.trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
        } catch (err) {
            console.error('Gemini error, using fallback question:', err);
            const fallbackQuestions = {
                hr: 'Tell me about yourself and why you\'re interested in the ' + targetRole + ' role.',
                technical: 'Can you walk me through your experience with the key technologies required for a ' + targetRole + ' position?',
                behavioral: 'Tell me about a time when you had to overcome a significant challenge in your work as a developer.',
            };
            firstQuestion = fallbackQuestions[mode];
        }

        const session = await InterviewSessionModel.create({
            userId: user.userId,
            targetRole,
            mode,
            questions: [
                {
                    question: firstQuestion,
                    askedAt: new Date(),
                },
            ],
            answers: [],
            startedAt: new Date(),
            settings: options || {},
        });

        // Log interview started activity
        try {
            await activityLogRepository.logActivity(user.userId, 'interview_started', {
                sessionId: session._id.toString(),
                role: targetRole,
                mode,
            });
        } catch (err) {
            console.error('Failed to log interview activity:', err);
        }

        return NextResponse.json({
            success: true,
            session: {
                id: session._id.toString(),
                currentQuestion: firstQuestion,
                questionNumber: 1,
                totalQuestions: mode === 'technical' ? 8 : mode === 'behavioral' ? 5 : 6,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('Start interview error:', error);
        return NextResponse.json({ error: 'Failed to start interview' }, { status: 500 });
    }
}
