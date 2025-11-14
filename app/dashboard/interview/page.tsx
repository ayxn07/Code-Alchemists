'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '@/src/app/components/DashboardLayout';

export default function InterviewPage() {
    const [showStartModal, setShowStartModal] = useState(false);
    const [selectedMode, setSelectedMode] = useState<'hr' | 'technical' | 'behavioral'>('hr');

    const pastSessions = [
        {
            id: 1,
            role: 'Software Engineer',
            mode: 'technical',
            date: '2024-01-15',
            score: 85,
            duration: '45 min',
            questionsCount: 8,
        },
        {
            id: 2,
            role: 'Senior Developer',
            mode: 'behavioral',
            date: '2024-01-10',
            score: 92,
            duration: '30 min',
            questionsCount: 5,
        },
        {
            id: 3,
            role: 'Tech Lead',
            mode: 'hr',
            date: '2024-01-05',
            score: 78,
            duration: '25 min',
            questionsCount: 6,
        },
    ];

    const modeDetails = {
        hr: {
            icon: '👔',
            title: 'HR Round',
            desc: 'General questions about background, motivation, and cultural fit',
            color: 'blue',
            questions: ['Tell me about yourself', 'Why this company?', 'Salary expectations'],
        },
        technical: {
            icon: '💻',
            title: 'Technical Round',
            desc: 'Coding problems, system design, and technical deep dives',
            color: 'green',
            questions: ['Data structures', 'Algorithms', 'System design', 'Code reviews'],
        },
        behavioral: {
            icon: '🤝',
            title: 'Behavioral Round',
            desc: 'STAR method questions about past experiences and soft skills',
            color: 'purple',
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
                    className="bg-linear-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold mb-3">Ready to Practice?</h2>
                            <p className="text-blue-100 mb-4 text-lg">
                                Choose your interview type and start practicing with AI feedback
                            </p>
                            <div className="flex gap-3">
                                <span className="px-4 py-2 bg-white/20 rounded-xl">🎤 Voice Enabled</span>
                                <span className="px-4 py-2 bg-white/20 rounded-xl">📹 Video Ready</span>
                                <span className="px-4 py-2 bg-white/20 rounded-xl">✨ AI Powered</span>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowStartModal(true)}
                            className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-50 shadow-xl"
                        >
                            🚀 Start Interview
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
                            <div className="text-5xl mb-4">{details.icon}</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{details.title}</h3>
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
                                                    {modeDetails[session.mode as keyof typeof modeDetails].icon} {session.mode}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 text-sm text-gray-600">
                                                <span>📅 {session.date}</span>
                                                <span>⏱️ {session.duration}</span>
                                                <span>❓ {session.questionsCount} questions</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100"
                                        >
                                            📊 Review
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="px-4 py-2 bg-green-50 text-green-600 rounded-xl font-semibold hover:bg-green-100"
                                        >
                                            🔄 Retry
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
                                            <div className="text-3xl mb-2">{details.icon}</div>
                                            <div className="font-semibold text-sm">{details.title}</div>
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
                                    placeholder="e.g., Senior Software Engineer"
                                    className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Options */}
                            <div className="mb-6 space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5" />
                                    <span className="font-medium">🎤 Enable Voice Input</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5" />
                                    <span className="font-medium">🔊 Enable AI Voice Responses</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5" />
                                    <span className="font-medium">📹 Enable Video Recording</span>
                                </label>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowStartModal(false)}
                                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg">
                                    Start Interview
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}
