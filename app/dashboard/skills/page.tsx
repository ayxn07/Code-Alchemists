'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '@/src/app/components/DashboardLayout';

export default function SkillsPage() {
    const [activeTab, setActiveTab] = useState<'analysis' | 'learning'>('analysis');

    const skillGapData = {
        targetRole: 'Senior Software Engineer',
        matchPercent: 78,
        missingSkills: ['Kubernetes', 'GraphQL', 'System Design', 'Microservices'],
        outdatedSkills: ['jQuery', 'AngularJS'],
        strongSkills: ['React', 'Node.js', 'Python', 'AWS', 'TypeScript'],
    };

    const learningPlan = {
        weeklyHours: 10,
        totalWeeks: 12,
        items: [
            {
                id: 1,
                skill: 'Kubernetes',
                weekNumber: 1,
                status: 'in-progress',
                estimatedHours: 15,
                resources: [
                    { title: 'Kubernetes for Beginners', type: 'course', url: '#' },
                    { title: 'Official K8s Docs', type: 'docs', url: '#' },
                ],
            },
            {
                id: 2,
                skill: 'GraphQL',
                weekNumber: 4,
                status: 'not-started',
                estimatedHours: 12,
                resources: [
                    { title: 'GraphQL Crash Course', type: 'video', url: '#' },
                    { title: 'How to GraphQL', type: 'tutorial', url: '#' },
                ],
            },
            {
                id: 3,
                skill: 'System Design',
                weekNumber: 7,
                status: 'not-started',
                estimatedHours: 20,
                resources: [
                    { title: 'System Design Interview', type: 'book', url: '#' },
                    { title: 'Designing Data Intensive Apps', type: 'book', url: '#' },
                ],
            },
            {
                id: 4,
                skill: 'Microservices',
                weekNumber: 10,
                status: 'not-started',
                estimatedHours: 18,
                resources: [
                    { title: 'Microservices Patterns', type: 'course', url: '#' },
                    { title: 'Building Microservices', type: 'book', url: '#' },
                ],
            },
        ],
    };

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Skills & Learning</h1>
                    <p className="text-gray-600">Analyze skill gaps and follow AI-generated learning plans</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-4 mb-8">
                    {['analysis', 'learning'].map((tab) => (
                        <motion.button
                            key={tab}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-8 py-3 rounded-xl font-semibold capitalize transition ${activeTab === tab
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 border border-blue-200 hover:bg-blue-50'
                                }`}
                        >
                            {tab === 'analysis' ? '📊 Skill Gap Analysis' : '📚 Learning Plan'}
                        </motion.button>
                    ))}
                </div>

                {/* Skill Gap Analysis */}
                {activeTab === 'analysis' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Target Role & Match */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 mb-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                        Target Role: {skillGapData.targetRole}
                                    </h2>
                                    <p className="text-gray-600">Based on your profile and job market data</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-5xl font-bold text-green-600 mb-1">
                                        {skillGapData.matchPercent}%
                                    </div>
                                    <div className="text-sm text-gray-600">Match Score</div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                            >
                                ✨ Re-analyze for Different Role
                            </motion.button>
                        </motion.div>

                        {/* Skills Breakdown */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Strong Skills */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-2xl p-6 shadow-lg border border-green-200"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                                        ✅
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">Strong Skills</h3>
                                </div>
                                <div className="space-y-2">
                                    {skillGapData.strongSkills.map((skill) => (
                                        <motion.div
                                            key={skill}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="p-3 bg-green-50 rounded-xl font-medium text-green-700"
                                        >
                                            {skill}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Missing Skills */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl p-6 shadow-lg border border-orange-200"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                                        📈
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">Skills to Learn</h3>
                                </div>
                                <div className="space-y-2">
                                    {skillGapData.missingSkills.map((skill) => (
                                        <motion.div
                                            key={skill}
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            whileHover={{ scale: 1.02 }}
                                            className="p-3 bg-orange-50 rounded-xl font-medium text-orange-700 cursor-pointer hover:bg-orange-100"
                                        >
                                            {skill}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Outdated Skills */}
                            {skillGapData.outdatedSkills.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white rounded-2xl p-6 shadow-lg border border-red-200"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl">
                                            ⚠️
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800">Outdated Skills</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {skillGapData.outdatedSkills.map((skill) => (
                                            <div
                                                key={skill}
                                                className="p-3 bg-red-50 rounded-xl font-medium text-red-700"
                                            >
                                                {skill}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-6 text-center"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab('learning')}
                                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg"
                            >
                                📚 Generate Learning Plan
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}

                {/* Learning Plan */}
                {activeTab === 'learning' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Plan Overview */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-linear-to-r from-blue-600 to-blue-400 rounded-2xl p-8 text-white shadow-lg mb-6"
                        >
                            <h2 className="text-3xl font-bold mb-4">Your 12-Week Learning Journey</h2>
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <div className="text-3xl font-bold mb-1">{learningPlan.totalWeeks} Weeks</div>
                                    <div className="text-blue-100">Total Duration</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold mb-1">{learningPlan.weeklyHours}h / week</div>
                                    <div className="text-blue-100">Time Commitment</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold mb-1">{learningPlan.items.length} Skills</div>
                                    <div className="text-blue-100">To Master</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Learning Items */}
                        <div className="space-y-6">
                            {learningPlan.items.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center font-bold text-blue-600 text-lg">
                                                W{item.weekNumber}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-800 mb-2">{item.skill}</h3>
                                                <div className="flex gap-4 text-sm text-gray-600 mb-3">
                                                    <span>⏱️ {item.estimatedHours} hours</span>
                                                    <span>📅 Week {item.weekNumber}</span>
                                                </div>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'in-progress'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {item.status === 'in-progress' ? '🔄 In Progress' : '📝 Not Started'}
                                                </span>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"
                                        >
                                            {item.status === 'in-progress' ? '✓' : '▶️'}
                                        </motion.button>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-gray-700 mb-2">📚 Resources:</h4>
                                        {item.resources.map((resource, j) => (
                                            <motion.a
                                                key={j}
                                                href={resource.url}
                                                whileHover={{ x: 5 }}
                                                className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition cursor-pointer"
                                            >
                                                <span className="text-xl">
                                                    {resource.type === 'course' && '🎓'}
                                                    {resource.type === 'video' && '📹'}
                                                    {resource.type === 'book' && '📖'}
                                                    {resource.type === 'docs' && '📄'}
                                                    {resource.type === 'tutorial' && '💻'}
                                                </span>
                                                <span className="font-medium text-gray-800">{resource.title}</span>
                                                <span className="text-xs text-gray-500 ml-auto capitalize">
                                                    {resource.type}
                                                </span>
                                            </motion.a>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}
