import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { InterviewSessionModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';
import { generateJSON, generateText } from '@/src/server/integrations/geminiClient';

const nextQuestionSchema = z.object({
    sessionId: z.string(),
    answer: z.string(),
});

interface AnswerEvaluation {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
}

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

        const currentQuestionIndex = session.answers.length;
        const currentQuestion = session.questions[currentQuestionIndex]?.question || 'Unknown question';

        // Use Gemini AI to evaluate the answer
        const evaluationPrompt = `You are an expert interviewer evaluating a candidate's answer for a ${session.mode} interview for the role of ${session.targetRole}.

QUESTION ASKED:
${currentQuestion}

CANDIDATE'S ANSWER:
${answer}

Evaluate this answer and provide:
1. A score from 0-100
2. Constructive feedback (2-3 sentences)
3. 2-3 key strengths in the answer
4. 2-3 areas for improvement

Return a JSON object with this exact structure:
{
  "score": <number 0-100>,
  "feedback": "<string>",
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"]
}`;

        let evaluation: AnswerEvaluation;
        try {
            evaluation = await generateJSON<AnswerEvaluation>(evaluationPrompt);
        } catch (err) {
            console.error('Gemini evaluation error, using fallback:', err);
            evaluation = {
                score: 75,
                feedback: 'Good answer with relevant details. Consider providing more specific examples and metrics.',
                strengths: ['Clear communication', 'Relevant experience mentioned'],
                improvements: ['Add more specific examples', 'Include quantifiable results'],
            };
        }

        session.answers.push({
            answer,
            score: evaluation.score,
            feedback: evaluation.feedback,
            answeredAt: new Date(),
        });

        const totalQuestions = session.mode === 'technical' ? 8 : session.mode === 'behavioral' ? 5 : 6;
        const isComplete = currentQuestionIndex >= totalQuestions - 1;

        if (isComplete) {
            session.completedAt = new Date();
            const avgScore = Math.round(
                session.answers.reduce((acc: number, a: any) => acc + a.score, 0) / session.answers.length
            );
            session.overallScore = avgScore;

            // Generate overall interview feedback using Gemini
            const overallFeedbackPrompt = `You are an expert career coach providing final feedback for an interview.

INTERVIEW DETAILS:
- Role: ${session.targetRole}
- Interview Type: ${session.mode}
- Average Score: ${avgScore}/100
- Total Questions: ${session.questions.length}

QUESTIONS AND ANSWERS:
${session.questions.map((q: any, idx: number) => `
Q${idx + 1}: ${q.question}
A${idx + 1}: ${session.answers[idx]?.answer || 'No answer provided'}
Score: ${session.answers[idx]?.score || 0}/100
`).join('\n')}

Provide comprehensive interview feedback (3-4 sentences) covering:
1. Overall performance assessment
2. Key strengths demonstrated
3. Main areas for improvement
4. Encouragement and next steps

Return ONLY the feedback text, no JSON or formatting.`;

            let overallFeedback: string;
            try {
                overallFeedback = await generateText(overallFeedbackPrompt);
            } catch (err) {
                console.error('Gemini overall feedback error:', err);
                overallFeedback = `You scored ${avgScore}/100 in this ${session.mode} interview. You demonstrated good communication skills and relevant experience. Focus on providing more specific examples with measurable results. Keep practicing to improve your confidence and delivery.`;
            }

            await session.save();

            return NextResponse.json({
                success: true,
                complete: true,
                session: {
                    id: session._id.toString(),
                    overallScore: avgScore,
                    totalQuestions: session.questions.length,
                    feedback: overallFeedback,
                },
                evaluation: {
                    score: evaluation.score,
                    feedback: evaluation.feedback,
                    strengths: evaluation.strengths,
                    improvements: evaluation.improvements,
                },
            });
        }

        // Generate next question using Gemini AI based on conversation history
        const conversationHistory = session.questions.map((q: any, idx: number) => `
Q: ${q.question}
A: ${session.answers[idx]?.answer || 'No answer'} (Score: ${session.answers[idx]?.score || 0}/100)
`).join('\n');

        const nextQuestionPrompt = `You are an experienced interviewer conducting a ${session.mode} interview for ${session.targetRole}.

INTERVIEW CONTEXT:
- Question ${currentQuestionIndex + 2} of ${totalQuestions}
- Previous questions and answers:
${conversationHistory}

Generate the NEXT interview question that:
1. Builds on previous answers naturally
2. Explores different aspects of the ${session.mode} interview
3. Is appropriate for the ${session.targetRole} position
4. Maintains professional interview flow
5. For technical: include coding/architecture/system design
6. For behavioral: use STAR method prompts
7. For HR: assess cultural fit, motivation, career goals

Return ONLY the next question text, nothing else.`;

        let nextQuestion: string;
        try {
            nextQuestion = await generateText(nextQuestionPrompt);
            nextQuestion = nextQuestion.trim().replace(/^["']|["']$/g, '');
        } catch (err) {
            console.error('Gemini next question error, using fallback:', err);
            const fallbackQuestions = {
                hr: ['Why do you want to work here?', 'Where do you see yourself in 5 years?', 'What are your salary expectations?', 'Any questions for us?'],
                technical: ['Explain your approach to system design', 'How do you handle scalability?', 'Describe your testing strategy', "What's your experience with CI/CD?"],
                behavioral: ['Tell me about a conflict you resolved', 'Describe a leadership experience', 'How do you handle pressure?', 'Share a failure and lesson learned'],
            };
            const fallbackList = fallbackQuestions[session.mode as keyof typeof fallbackQuestions] || [];
            nextQuestion = fallbackList[currentQuestionIndex % fallbackList.length] || 'Tell me more about your experience.';
        }

        session.questions.push({
            question: nextQuestion,
            askedAt: new Date(),
        });

        await session.save();

        return NextResponse.json({
            success: true,
            complete: false,
            evaluation: {
                score: evaluation.score,
                feedback: evaluation.feedback,
                strengths: evaluation.strengths,
                improvements: evaluation.improvements,
            },
            nextQuestion,
            questionNumber: currentQuestionIndex + 2,
            totalQuestions,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('Next question error:', error);
        return NextResponse.json({ error: 'Failed to process answer' }, { status: 500 });
    }
}
