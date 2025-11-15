import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { InterviewSessionModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';
import { generateJSON, generateText } from '@/src/server/integrations/geminiClient';
import { transcribeAudio } from '@/src/server/integrations/sttClient';
import { generateSpeech } from '@/src/server/integrations/elevenLabsClient';

const querySchema = z.object({
    sessionId: z.string(),
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

        const params = querySchema.safeParse({ sessionId: request.nextUrl.searchParams.get('sessionId') });
        if (!params.success) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
        }

        const contentType = request.headers.get('content-type') || '';
        if (!contentType.startsWith('audio/')) {
            return NextResponse.json({ error: 'Content-Type must be audio/*' }, { status: 400 });
        }

        const arrayBuffer = await request.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuffer);

        await connectToDatabase();

        const session = await InterviewSessionModel.findOne({
            _id: params.data.sessionId,
            userId: user.userId,
        });

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // 1) Transcribe audio to text
        const stt = await transcribeAudio({ audioData: audioBuffer });
        const answerText = stt.text?.trim() || '';
        if (!answerText) {
            return NextResponse.json({ error: 'Could not transcribe audio' }, { status: 400 });
        }

        // 2) Evaluate answer (reuse logic from /api/interview/next)
        const currentQuestionIndex = session.answers.length;
        const currentQuestion = session.questions[currentQuestionIndex]?.question || 'Unknown question';

        const evaluationPrompt = `You are an expert interviewer evaluating a candidate's answer for a ${session.mode} interview for the role of ${session.targetRole}.

QUESTION ASKED:
${currentQuestion}

CANDIDATE'S ANSWER:
${answerText}

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
            questionIndex: currentQuestionIndex,
            transcript: answerText,
            score: evaluation.score,
            feedback: evaluation.feedback,
        });

        const totalQuestions = session.mode === 'technical' ? 8 : session.mode === 'behavioral' ? 5 : 6;
        const isComplete = currentQuestionIndex >= totalQuestions - 1;

        if (isComplete) {
            session.completedAt = new Date();
            const avgScore = Math.round(
                session.answers.reduce((acc: number, a: any) => acc + a.score, 0) / session.answers.length
            );
            session.overallScore = avgScore;

            const overallFeedbackPrompt = `You are an expert career coach providing final feedback for an interview.

INTERVIEW DETAILS:
- Role: ${session.targetRole}
- Interview Type: ${session.mode}
- Average Score: ${avgScore}/100
- Total Questions: ${session.questions.length}

QUESTIONS AND ANSWERS:
${session.questions.map((q: any, idx: number) => `
Q${idx + 1}: ${q.question}
A${idx + 1}: ${session.answers[idx]?.transcript || 'No answer provided'}
Score: ${session.answers[idx]?.score || 0}/100
`).join('\n')}

Provide comprehensive interview feedback (3-4 sentences). Return only the feedback text.`;

            let overallFeedback: string;
            try {
                overallFeedback = await generateText(overallFeedbackPrompt);
            } catch (err) {
                console.error('Gemini overall feedback error:', err);
                overallFeedback = `You scored ${avgScore}/100 in this ${session.mode} interview. You demonstrated good communication skills and relevant experience. Focus on providing more specific examples with measurable results. Keep practicing.`;
            }

            await session.save();

            // TTS of final overall feedback
            const finalTTS = await generateSpeech({ text: overallFeedback });
            const finalTTSBase64 = Buffer.from(finalTTS).toString('base64');

            return NextResponse.json({
                success: true,
                complete: true,
                session: {
                    id: session._id.toString(),
                    overallScore: avgScore,
                    totalQuestions: session.questions.length,
                    feedback: overallFeedback,
                },
                evaluation,
                tts: {
                    mime: 'audio/mpeg',
                    feedbackBase64: finalTTSBase64,
                },
            });
        }

        // Generate next question based on history
        const conversationHistory = session.questions.map((q: any, idx: number) => `
Q: ${q.question}
A: ${session.answers[idx]?.transcript || 'No answer'} (Score: ${session.answers[idx]?.score || 0}/100)
`).join('\n');

        const nextQuestionPrompt = `You are an experienced interviewer conducting a ${session.mode} interview for ${session.targetRole}.

INTERVIEW CONTEXT:
- Question ${currentQuestionIndex + 2} of ${totalQuestions}
- Previous questions and answers:
${conversationHistory}

Generate the NEXT interview question. Return only the question text.`;

        let nextQuestion: string;
        try {
            nextQuestion = await generateText(nextQuestionPrompt);
            nextQuestion = nextQuestion.trim().replace(/^["']|["']$/g, '');
        } catch (err) {
            console.error('Gemini next question error, using fallback:', err);
            const fallbackQuestions = {
                hr: ['Why do you want to work here?', 'Where do you see yourself in 5 years?', 'What are your strengths?', 'Any questions for us?'],
                technical: ['Explain your approach to system design', 'How do you handle scalability?', 'Describe your testing strategy', 'What is your experience with CI/CD?'],
                behavioral: ['Tell me about a conflict you resolved', 'Describe a leadership experience', 'How do you handle pressure?', 'Share a failure and lesson learned'],
            } as const;
            const list = fallbackQuestions[session.mode as keyof typeof fallbackQuestions] || [];
            nextQuestion = list[currentQuestionIndex % list.length] || 'Tell me more about your experience.';
        }

        session.questions.push({ question: nextQuestion, askedAt: new Date() });
        await session.save();

        // TTS for both evaluation feedback (short) and next question
        const shortFeedback = `Score ${evaluation.score} out of 100. ${evaluation.feedback}`;
        const [feedbackAudio, nextQuestionAudio] = await Promise.all([
            generateSpeech({ text: shortFeedback }),
            generateSpeech({ text: nextQuestion }),
        ]);

        const feedbackBase64 = Buffer.from(feedbackAudio).toString('base64');
        const nextQuestionBase64 = Buffer.from(nextQuestionAudio).toString('base64');

        return NextResponse.json({
            success: true,
            complete: false,
            evaluation,
            nextQuestion,
            questionNumber: currentQuestionIndex + 2,
            totalQuestions,
            transcript: answerText,
            tts: {
                mime: 'audio/mpeg',
                feedbackBase64,
                nextQuestionBase64,
            },
        });
    } catch (error) {
        console.error('Voice route error:', error);
        return NextResponse.json({ error: 'Failed to process voice answer' }, { status: 500 });
    }
}
