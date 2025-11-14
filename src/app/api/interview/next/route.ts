import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { InterviewSessionModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';

const nextQuestionSchema = z.object({
    sessionId: z.string(),
    answer: z.string(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, answer } = nextQuestionSchema.parse(body);

        await connectToDatabase();

        const session = await InterviewSessionModel.findOne({
            _id: sessionId,
            userId: user.userId,
        });

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // TODO: Use LLM to evaluate answer and generate next question
        // For now, use mock evaluation

        const mockScore = Math.floor(Math.random() * 30) + 70;
        const currentQuestionIndex = session.answers.length;

        session.answers.push({
            answer,
            score: mockScore,
            feedback: 'Good answer with relevant examples. Consider adding more specific metrics.',
            answeredAt: new Date(),
        });

        // Generate next question or complete session
        const nextQuestions = {
            hr: [
                'Why do you want to work for this company?',
                'Where do you see yourself in 5 years?',
                'What are your salary expectations?',
                'Do you have any questions for us?',
            ],
            technical: [
                'How would you design a scalable microservices architecture?',
                'Explain the concept of database indexing and when to use it.',
                'What are the differences between REST and GraphQL?',
                'How do you handle errors in async functions?',
                'Describe your experience with CI/CD pipelines.',
            ],
            behavioral: [
                'Describe a time when you disagreed with a team member.',
                'Tell me about a project where you showed leadership.',
                'How do you handle tight deadlines and pressure?',
                'Give an example of when you failed and what you learned.',
            ],
        };

        const modeQuestions = nextQuestions[session.mode as keyof typeof nextQuestions] || [];
        const isComplete = currentQuestionIndex >= modeQuestions.length;

        if (isComplete) {
            session.completedAt = new Date();
            const avgScore = Math.round(
                session.answers.reduce((acc: number, a: any) => acc + a.score, 0) / session.answers.length
            );
            session.overallScore = avgScore;
            await session.save();

            return NextResponse.json({
                success: true,
                complete: true,
                session: {
                    id: session._id.toString(),
                    overallScore: avgScore,
                    totalQuestions: session.questions.length,
                    feedback: 'Great job! You demonstrated strong communication and relevant experience.',
                },
            });
        }

        const nextQuestion = modeQuestions[currentQuestionIndex];
        session.questions.push({
            question: nextQuestion,
            askedAt: new Date(),
        });

        await session.save();

        return NextResponse.json({
            success: true,
            complete: false,
            currentScore: mockScore,
            feedback: 'Good answer. Try to provide more specific examples next time.',
            nextQuestion,
            questionNumber: currentQuestionIndex + 2,
            totalQuestions: modeQuestions.length + 1,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('Next question error:', error);
        return NextResponse.json({ error: 'Failed to process answer' }, { status: 500 });
    }
}
