'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/src/app/components/DashboardLayout';

export default function InterviewPage() {
    const router = useRouter();
    const [showStartModal, setShowStartModal] = useState(false);
    const [selectedMode, setSelectedMode] = useState<'hr' | 'technical' | 'behavioral'>('hr');
    const [targetRole, setTargetRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(true);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/interview/sessions', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setSessions(data.sessions || []);
            }
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoadingSessions(false);
        }
    };

    const startInterview = async () => {
        if (!targetRole.trim()) {
            alert('Please enter a target role');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/interview/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    mode: selectedMode,
                    targetRole: targetRole.trim(),
                }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                // Store session data for the session page
                sessionStorage.setItem(`interview-${data.session.id}`, JSON.stringify({
                    currentQuestion: data.session.currentQuestion,
                    questionNumber: data.session.questionNumber,
                    totalQuestions: data.session.totalQuestions,
                }));

                router.push(`/dashboard/interview/session?id=${data.session.id}`);
            } else {
                alert(data.error || 'Failed to start interview');
            }
        } catch (error) {
            console.error('Failed to start interview:', error);
            alert('Failed to start interview. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const pastSessions = sessions.length > 0 ? sessions.slice(0, 10) : [];

    const modeDetails = {
        hr: {
            title: 'HR Round',
            desc: 'General questions about background, motivation, and cultural fit',
            questions: ['Tell me about yourself', 'Why this company?', 'Salary expectations'],
        },
        technical: {
            title: 'Technical Round',
            desc: 'Coding problems, system design, and technical deep dives',
            questions: ['Data structures', 'Algorithms', 'System design', 'Code reviews'],
        },
        behavioral: {
            title: 'Behavioral Round',
            desc: 'STAR method questions about past experiences and soft skills',
            questions: ['Conflict resolution', 'Leadership', 'Teamwork', 'Problem solving'],
        },
    };

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Interview Coach</h1>
                    <p className="text-gray-600">Practice with AI mentor - Voice & Video supported</p>
                </div>

                {/* Start New Interview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-linear-to-r from-[#65cae1] to-[#4db8d4] rounded-3xl p-8 text-white shadow-2xl mb-8"
                    style={{ boxShadow: '0 20px 40px rgba(101, 202, 225, 0.3)' }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold mb-3">Ready to Practice?</h2>
                            <p className="text-blue-100 mb-4 text-lg">
                                Choose your interview type and start practicing with AI feedback
                            </p>
                            <div className="flex gap-3">
                                <span className="px-4 py-2 bg-white/20 rounded-xl font-semibold">Voice Enabled</span>
                                <span className="px-4 py-2 bg-white/20 rounded-xl font-semibold">Video Ready</span>
                                <span className="px-4 py-2 bg-white/20 rounded-xl font-semibold">AI Powered</span>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowStartModal(true)}
                            className="px-8 py-4 bg-white text-[#4db8d4] rounded-2xl font-bold text-lg hover:bg-blue-50 shadow-xl"
                        >
                            Start Interview
                        </motion.button>
                    </div>
                </motion.div>

                {/* Interview Types */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {Object.entries(modeDetails).map(([key, details], i) => (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)' }}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 cursor-pointer"
                        >
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{details.title}</h3>
                            <p className="text-gray-600 mb-4">{details.desc}</p>
                            <div className="space-y-2">
                                {details.questions.map((q, j) => (
                                    <div key={j} className="text-sm text-gray-500 flex items-center gap-2">
                                        <span className="text-blue-500">✓</span> {q}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Past Sessions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Practice History</h2>
                        <span className="text-gray-600">{pastSessions.length} sessions completed</span>
                    </div>

                    <div className="space-y-4">
                        {pastSessions.map((session, i) => (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ x: 5 }}
                                className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4 flex-1">
                                        <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                                            {session.score}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-800">{session.role}</h3>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${session.mode === 'technical'
                                                        ? 'bg-green-100 text-green-700'
                                                        : session.mode === 'behavioral'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                        }`}
                                                >
                                                    {session.mode}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 text-sm text-gray-600">
                                                <span className="font-semibold">{session.date}</span>
                                                <span className="font-semibold">{session.duration}</span>
                                                <span className="font-semibold">{session.questionsCount} questions</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="px-4 py-2 bg-[#65cae1] text-white rounded-xl font-semibold hover:bg-[#4db8d4]"
                                            style={{ boxShadow: '0 4px 12px rgba(101, 202, 225, 0.3)' }}
                                        >
                                            Review
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="px-4 py-2 bg-[#65cae1] text-white rounded-xl font-semibold hover:bg-[#4db8d4]"
                                            style={{ boxShadow: '0 4px 12px rgba(101, 202, 225, 0.3)' }}
                                        >
                                            Retry
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Start Interview Modal */}
                {showStartModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowStartModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="bg-white rounded-3xl p-8 max-w-2xl w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-3xl font-bold mb-6">Start New Interview</h2>

                            {/* Mode Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Interview Type
                                </label>
                                <div className="grid grid-cols-3 gap-4">
                                    {Object.entries(modeDetails).map(([key, details]) => (
                                        <motion.button
                                            key={key}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedMode(key as any)}
                                            className={`p-4 rounded-xl border-2 transition ${selectedMode === key
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="font-bold text-base">{details.title}</div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Role Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Target Role
                                </label>
                                <input
                                    type="text"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    placeholder="e.g., Senior Software Engineer"
                                    className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Options */}
                            <div className="mb-6 space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5" />
                                    <span className="font-medium">Enable Voice Input</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5" />
                                    <span className="font-medium">Enable AI Voice Responses</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5" />
                                    <span className="font-medium">Enable Video Recording</span>
                                </label>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowStartModal(false)}
                                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={startInterview}
                                    disabled={loading || !targetRole || !selectedMode}
                                    className="flex-1 py-3 bg-[#65cae1] text-white rounded-xl font-semibold hover:bg-[#4db8d4] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ boxShadow: '0 8px 20px rgba(101, 202, 225, 0.3)' }}
                                >
                                    {loading ? 'Starting...' : 'Start Interview'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}
