import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/src/server/services/authService';
import { profileRepository } from '@/src/server/repositories/profileRepository';
import { resumeRepository } from '@/src/server/repositories/resumeRepository';
import { learningPlanRepository } from '@/src/server/repositories/learningPlanRepository';
import { generateJSON } from '@/src/server/integrations/geminiClient';
import { connectToDatabase } from '@/src/server/db/mongoClient';

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { missingSkills, targetRole, weeklyHours = 10 } = body;

        // Fetch user profile and resumes
        const profile = await profileRepository.getProfileByUserId(user.userId);
        const resumes = await resumeRepository.getUserResumes(user.userId);

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const primaryResume = resumes.find((r) => r.isPrimary) || resumes[0];

        const context = {
            profile: {
                headline: profile.headline,
                currentRole: profile.currentRole,
                skills: profile.skills || [],
                experienceYears: profile.experienceYears,
            },
            resume: primaryResume
                ? {
                    title: primaryResume.title,
                    rawText: primaryResume.rawText,
                }
                : null,
            missingSkills: missingSkills || [],
            targetRole: targetRole || profile.currentRole || 'Software Engineer',
            weeklyHours,
        };

        console.log('[Learning Plan Generate] Generating plan for user:', user.userId);

        // Prompt Gemini to generate learning plan
        const prompt = `Create a personalized learning plan for a ${context.targetRole} candidate.

CANDIDATE INFO:
Current Skills: ${context.profile.skills.join(', ') || 'None'}
Experience: ${context.profile.experienceYears || 0} years
Current Role: ${context.profile.currentRole || 'Not specified'}

SKILLS TO LEARN:
${context.missingSkills.length > 0 ? context.missingSkills.join(', ') : 'General upskilling needed'}

CONSTRAINTS:
Available Time: ${context.weeklyHours} hours per week
Target Role: ${context.targetRole}

Create a structured learning plan as JSON with:
- weeklyHours (number): Hours per week
- totalWeeks (number): Total duration (8-16 weeks)
- items (array): Each with id, skill, description, weekNumber, status="not-started", estimatedHours, difficulty, and resources array (each resource has title, type, url, provider)
- milestones (array): Weekly checkpoints with week, title, description
- tips (array): 3-5 practical learning tips

Prioritize high-impact skills first. Include real learning resources (Coursera, Udemy, YouTube, official docs, etc.) with actual URLs when possible.`;

        let learningPlanData;
        try {
            learningPlanData = await generateJSON(prompt);
            console.log('[Learning Plan Generate] Gemini response received');
        } catch (geminiError) {
            console.error('[Learning Plan Generate] Gemini API error:', geminiError);
            // Return a fallback learning plan
            learningPlanData = {
                weeklyHours: context.weeklyHours,
                totalWeeks: 12,
                items: (context.missingSkills.length > 0 ? context.missingSkills : ['Communication', 'Problem Solving', 'Technical Writing']).map((skill: string, idx: number) => ({
                    id: idx + 1,
                    skill,
                    description: `Learn and practice ${skill} for ${context.targetRole}`,
                    weekNumber: Math.floor(idx / 2) + 1,
                    status: 'not-started',
                    estimatedHours: 10,
                    difficulty: 'intermediate',
                    resources: [{
                        title: `${skill} Course`,
                        type: 'course',
                        url: 'https://www.coursera.org',
                        provider: 'Coursera'
                    }]
                })),
                milestones: Array.from({ length: 12 }, (_, i) => ({
                    week: i + 1,
                    title: `Week ${i + 1} Checkpoint`,
                    description: `Review progress on assigned skills`
                })),
                tips: [
                    'Practice consistently every day',
                    'Build real projects to apply what you learn',
                    'Join online communities for support',
                    'Take breaks to avoid burnout'
                ]
            };
        }

        // Save the learning plan to database
        const savedPlan = await learningPlanRepository.savePlan(
            user.userId,
            learningPlanData.items.map((item: any) => ({
                skill: item.skill,
                description: item.description,
                resourceLink: item.resources?.[0]?.url,
                resourceTitle: item.resources?.[0]?.title,
                difficulty: item.difficulty,
                estimatedHours: item.estimatedHours,
                status: 'not-started' as const,
                weekNumber: item.weekNumber,
            })),
            'not-started'
        );

        return NextResponse.json({
            success: true,
            data: {
                ...learningPlanData,
                planId: savedPlan._id,
            },
        });
    } catch (error: unknown) {
        console.error('[Learning Plan Generate] Error:', error);
        const message = error instanceof Error ? error.message : 'Failed to generate learning plan';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// GET endpoint to fetch existing learning plan
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const plan = await learningPlanRepository.getPlanForUser(user.userId);

        if (!plan) {
            return NextResponse.json({
                success: true,
                data: null,
                message: 'No learning plan found',
            });
        }

        return NextResponse.json({
            success: true,
            data: plan,
        });
    } catch (error: unknown) {
        console.error('[Learning Plan GET] Error:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch learning plan';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
