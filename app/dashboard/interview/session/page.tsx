'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/src/app/components/DashboardLayout';

interface Evaluation {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
}

function InterviewSessionPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('id');

    const [currentQuestion, setCurrentQuestion] = useState('');
    const [questionNumber, setQuestionNumber] = useState(1);
    const [totalQuestions, setTotalQuestions] = useState(6);
    const [answer, setAnswer] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isPlayingTTS, setIsPlayingTTS] = useState(false);
    const [recordingError, setRecordingError] = useState<string | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [overallScore, setOverallScore] = useState(0);
    const [overallFeedback, setOverallFeedback] = useState('');

    useEffect(() => {
        if (!sessionId) {
            router.push('/dashboard/interview');
            return;
        }

        // Get session data from sessionStorage (set when starting interview)
        const sessionData = sessionStorage.getItem(`interview-${sessionId}`);
        if (sessionData) {
            try {
                const data = JSON.parse(sessionData);
                setCurrentQuestion(data.currentQuestion || 'Loading question...');
                setQuestionNumber(data.questionNumber || 1);
                setTotalQuestions(data.totalQuestions || 6);
                setLoading(false);
            } catch (error) {
                console.error('Error parsing session data:', error);
                router.push('/dashboard/interview');
            }
        } else {
            router.push('/dashboard/interview');
        }
    }, [sessionId, router]);

    // Helper to play base64 audio and await completion
    const playBase64Audio = (base64: string, mime = 'audio/mpeg'): Promise<void> => {
        return new Promise((resolve, reject) => {
            try {
                const audioData = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
                const blob = new Blob([audioData], { type: mime });
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                setIsPlayingTTS(true);
                audio.onended = () => {
                    setIsPlayingTTS(false);
                    URL.revokeObjectURL(url);
                    resolve();
                };
                audio.onerror = (e) => {
                    setIsPlayingTTS(false);
                    URL.revokeObjectURL(url);
                    reject(e);
                };
                audio.play().catch(err => {
                    setIsPlayingTTS(false);
                    URL.revokeObjectURL(url);
                    reject(err);
                });
            } catch (err) {
                setIsPlayingTTS(false);
                reject(err);
            }
        });
    };

    const startRecording = async () => {
        setRecordingError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const preferredTypes = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/mp4',
                'audio/ogg;codecs=opus',
                'audio/ogg'
            ];
            let mimeType = '';
            for (const t of preferredTypes) {
                if ((window as any).MediaRecorder && (MediaRecorder as any).isTypeSupported?.(t)) {
                    mimeType = t;
                    break;
                }
            }

            const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined as any);
            recorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e: BlobEvent) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };
            recorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
                chunksRef.current = [];
                // Stop tracks
                streamRef.current?.getTracks().forEach(t => t.stop());
                streamRef.current = null;
                try {
                    await sendVoiceAnswer(blob, recorder.mimeType || 'audio/webm');
                } catch (err) {
                    console.error('Voice submit error:', err);
                    alert('Failed to process voice answer. Please try again.');
                }
            };

            recorder.start();
            setIsRecording(true);
        } catch (err: any) {
            console.error('getUserMedia error:', err);
            setRecordingError(err?.message || 'Microphone access denied');
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        const rec = recorderRef.current;
        if (rec && rec.state !== 'inactive') {
            rec.stop();
        }
        recorderRef.current = null;
        setIsRecording(false);
    };

    const toggleRecording = () => {
        if (isRecording) stopRecording(); else startRecording();
    };

    const sendVoiceAnswer = async (audioBlob: Blob, contentType: string) => {
        if (!sessionId) return;
        setSubmitting(true);
        setEvaluation(null);

        const res = await fetch(`/api/interview/voice?sessionId=${encodeURIComponent(sessionId)}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                'Content-Type': contentType || 'audio/webm'
            },
            body: audioBlob,
        });

        if (!res.ok) {
            setSubmitting(false);
            throw new Error('Voice API error');
        }

        const data = await res.json();

        // Set transcript into text area for visibility
        if (data.transcript) {
            setAnswer(data.transcript);
        }

        // Show evaluation immediately
        if (data.evaluation) {
            setEvaluation(data.evaluation);
        }

        try {
            // Play feedback TTS first if present
            if (data.tts?.feedbackBase64) {
                await playBase64Audio(data.tts.feedbackBase64, data.tts.mime || 'audio/mpeg');
            }

            if (data.complete) {
                // Finalize interview
                if (data.session) {
                    setIsComplete(true);
                    setOverallScore(data.session.overallScore || 0);
                    setOverallFeedback(data.session.feedback || '');
                } else {
                    setIsComplete(true);
                }
                return;
            }

            // Then play next question and advance
            if (data.tts?.nextQuestionBase64) {
                await playBase64Audio(data.tts.nextQuestionBase64, data.tts.mime || 'audio/mpeg');
            }

            // Advance to next question
            setCurrentQuestion(data.nextQuestion);
            setQuestionNumber(data.questionNumber);
            setAnswer('');
            setEvaluation(null);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim() || !sessionId) return;

        setSubmitting(true);
        setEvaluation(null);

        try {
            const res = await fetch('/api/interview/next', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    sessionId,
                    answer: answer.trim(),
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to submit answer');
            }

            const data = await res.json();

            // Show evaluation
            setEvaluation(data.evaluation);

            if (data.complete) {
                // Interview complete
                setIsComplete(true);
                setOverallScore(data.session.overallScore);
                setOverallFeedback(data.session.feedback);
            } else {
                // Move to next question after showing evaluation
                setTimeout(() => {
                    setCurrentQuestion(data.nextQuestion);
                    setQuestionNumber(data.questionNumber);
                    setAnswer('');
                    setEvaluation(null);
                }, 5000); // Show evaluation for 5 seconds
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
            alert('Failed to submit answer. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleFinish = () => {
        router.push('/dashboard/interview');
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-[#65cae1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 font-semibold">Loading interview session...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (isComplete) {
        return (
            <DashboardLayout>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-4xl mx-auto py-12"
                >
                    <div className="bg-white rounded-3xl p-12 shadow-2xl text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="w-32 h-32 bg-gradient-to-br from-[#65cae1] to-[#4db8d4] rounded-full mx-auto mb-6 flex items-center justify-center"
                            style={{ boxShadow: '0 20px 40px rgba(101, 202, 225, 0.4)' }}
                        >
                            <span className="text-white text-5xl font-bold">{overallScore}</span>
                        </motion.div>

                        <h1 className="text-4xl font-bold text-gray-800 mb-4">Interview Complete!</h1>
                        <p className="text-xl text-gray-600 mb-8">
                            You've successfully completed all {totalQuestions} questions.
                        </p>

                        <div className="bg-[#e0f7fc] rounded-2xl p-6 mb-8 text-left">
                            <h2 className="text-xl font-bold text-gray-800 mb-3">Overall Feedback</h2>
                            <p className="text-gray-700 leading-relaxed">{overallFeedback}</p>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleFinish}
                                className="px-8 py-4 bg-[#65cae1] text-white rounded-2xl font-bold text-lg hover:bg-[#4db8d4]"
                                style={{ boxShadow: '0 8px 20px rgba(101, 202, 225, 0.3)' }}
                            >
                                Back to Dashboard
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-gray-800">Interview Session</h1>
                        <div className="px-6 py-2 bg-[#65cae1] text-white rounded-full font-bold">
                            Question {questionNumber} / {totalQuestions}
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                            transition={{ duration: 0.5 }}
                            className="bg-gradient-to-r from-[#65cae1] to-[#4db8d4] h-3 rounded-full"
                            style={{ boxShadow: '0 2px 8px rgba(101, 202, 225, 0.3)' }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {evaluation ? (
                        <motion.div
                            key="evaluation"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-3xl p-8 shadow-2xl mb-8"
                        >
                            <div className="text-center mb-6">
                                <div className="inline-block px-6 py-3 bg-gradient-to-r from-[#65cae1] to-[#4db8d4] text-white rounded-2xl font-bold text-2xl mb-4"
                                    style={{ boxShadow: '0 8px 20px rgba(101, 202, 225, 0.3)' }}>
                                    Score: {evaluation.score}/100
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Answer Evaluation</h2>
                                <p className="text-gray-600">{evaluation.feedback}</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-green-50 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-green-800 mb-3">Strengths</h3>
                                    <ul className="space-y-2">
                                        {evaluation.strengths.map((strength, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-green-700">
                                                <span className="text-green-600 font-bold">✓</span>
                                                <span>{strength}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-orange-50 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-orange-800 mb-3">Areas to Improve</h3>
                                    <ul className="space-y-2">
                                        {evaluation.improvements.map((improvement, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-orange-700">
                                                <span className="text-orange-600 font-bold">→</span>
                                                <span>{improvement}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <p className="text-center text-gray-500 mt-6 font-semibold">
                                Loading next question...
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="question"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Question Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-br from-[#65cae1] to-[#4db8d4] rounded-3xl p-8 text-white shadow-2xl mb-8"
                                style={{ boxShadow: '0 20px 40px rgba(101, 202, 225, 0.3)' }}
                            >
                                <h2 className="text-2xl font-bold mb-4">Question {questionNumber}</h2>
                                <p className="text-xl leading-relaxed">{currentQuestion}</p>
                            </motion.div>

                            {/* Answer Input */}
                            <div className="bg-white rounded-3xl p-8 shadow-2xl">
                                <div className="mb-6">
                                    <label className="block text-lg font-bold text-gray-800 mb-4">
                                        Your Answer
                                    </label>
                                    <textarea
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        disabled={submitting}
                                        placeholder="Type your answer here... Be specific and provide examples where possible."
                                        rows={8}
                                        className="w-full px-6 py-4 border-2 border-[#65cae1] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#65cae1]/20 resize-none text-gray-700 text-lg"
                                    />
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-sm text-gray-500 font-semibold">
                                            {answer.length} characters
                                        </span>
                                        <span className="text-sm text-gray-500 font-semibold">
                                            Minimum 50 characters recommended
                                        </span>
                                    </div>
                                </div>

                                {/* Voice Recording Option */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-semibold text-gray-700">Voice Answer</span>
                                            {recordingError && (
                                                <div className="text-red-600 text-sm mt-1">{recordingError}</div>
                                            )}
                                            {isPlayingTTS && (
                                                <div className="text-[#4db8d4] text-sm mt-1 font-semibold">Playing feedback...</div>
                                            )}
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={toggleRecording}
                                            disabled={submitting}
                                            className={`px-6 py-3 rounded-xl font-bold ${isRecording
                                                ? 'bg-red-500 text-white'
                                                : 'bg-[#65cae1] text-white hover:bg-[#4db8d4]'
                                                } disabled:opacity-50`}
                                            style={!isRecording ? { boxShadow: '0 8px 20px rgba(101, 202, 225, 0.3)' } : undefined}
                                        >
                                            {isRecording ? 'Stop Recording' : 'Start Recording'}
                                        </motion.button>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-500">
                                        {isRecording ? 'Recording... speak your answer, then press Stop' : 'Click Start Recording to answer by voice'}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => router.push('/dashboard/interview')}
                                        disabled={submitting}
                                        className="px-8 py-4 bg-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:bg-gray-300 disabled:opacity-50"
                                    >
                                        Exit Interview
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSubmitAnswer}
                                        disabled={submitting || answer.length < 20}
                                        className="flex-1 px-8 py-4 bg-[#65cae1] text-white rounded-2xl font-bold text-lg hover:bg-[#4db8d4] disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ boxShadow: '0 8px 20px rgba(101, 202, 225, 0.3)' }}
                                    >
                                        {submitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Submitting...
                                            </span>
                                        ) : (
                                            'Submit Answer'
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}

export default function InterviewSessionPage() {
    return (
        <Suspense
            fallback={
                <DashboardLayout>
                    <div className="flex items-center justify-center h-screen">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-[#65cae1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600 font-semibold">Loading interview session...</p>
                        </div>
                    </div>
                </DashboardLayout>
            }
        >
            <InterviewSessionPageInner />
        </Suspense>
    );
}
