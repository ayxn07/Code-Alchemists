import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { LearningPlanModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';
import { activityLogRepository } from '@/src/server/repositories/activityLogRepository';

const generatePlanSchema = z.object({
    targetRole: z.string(),
    missingSkills: z.array(z.string()),
    timeframe: z.number().optional(), // weeks
});

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { targetRole, missingSkills, timeframe = 12 } = generatePlanSchema.parse(body);

        await connectToDatabase();

        // TODO: Use LLM to generate personalized learning plan
        // For now, create mock plan

        const weeksPerSkill = Math.ceil(timeframe / missingSkills.length);
        const items = missingSkills.map((skill, index) => ({
            skill,
            priority: index < 3 ? 'high' : 'medium',
            estimatedHours: weeksPerSkill * 10,
            resources: [
                {
                    type: 'course',
                    title: `Complete ${skill} Masterclass`,
                    url: `https://example.com/courses/${skill.toLowerCase().replace(' ', '-')}`,
                    duration: '20 hours',
                },
                {
                    type: 'video',
                    title: `${skill} - Full Tutorial`,
                    url: `https://youtube.com/watch?v=example`,
                    duration: '3 hours',
                },
                {
                    type: 'docs',
                    title: `Official ${skill} Documentation`,
                    url: `https://docs.example.com/${skill.toLowerCase()}`,
                    duration: 'Reference',
                },
            ],
            weekNumber: Math.floor(index * weeksPerSkill) + 1,
            completed: false,
        }));

        const plan = await LearningPlanModel.create({
            userId: user.userId,
            targetRole,
            totalWeeks: timeframe,
            items,
            status: 'active',
            progress: 0,
        });

        // Log learning plan generation activity
        try {
            await activityLogRepository.logActivity(user.userId, 'learning_plan_generated', {
                planId: plan._id.toString(),
                role: targetRole,
                skillCount: missingSkills.length,
            });
        } catch (err) {
            console.error('Failed to log learning plan activity:', err);
        }

        return NextResponse.json({
            success: true,
            plan: {
                id: plan._id.toString(),
                targetRole: (plan as any).targetRole,
                totalWeeks: (plan as any).totalWeeks,
                items: (plan as any).items,
                progress: (plan as any).progress,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('Generate learning plan error:', error);
        return NextResponse.json({ error: 'Failed to generate learning plan' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        const plan = await LearningPlanModel.findOne({
            userId: user.userId,
            status: 'active',
        }).lean();

        if (!plan) {
            return NextResponse.json({
                success: true,
                plan: null,
            });
        }

        return NextResponse.json({
            success: true,
            plan: {
                id: (plan as any)._id.toString(),
                targetRole: (plan as any).targetRole,
                totalWeeks: (plan as any).totalWeeks,
                items: (plan as any).items,
                progress: (plan as any).progress,
                createdAt: (plan as any).createdAt,
            },
        });
    } catch (error) {
        console.error('Get learning plan error:', error);
        return NextResponse.json({ error: 'Failed to fetch learning plan' }, { status: 500 });
    }
}
