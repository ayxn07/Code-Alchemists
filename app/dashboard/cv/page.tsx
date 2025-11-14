'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '@/src/app/components/DashboardLayout';

export default function CVPage() {
    const [resumes, setResumes] = useState([
        {
            id: 1,
            title: 'Senior Software Engineer - Tech',
            isPrimary: true,
            updatedAt: '2 days ago',
            tags: ['Tech', 'Full-Stack'],
        },
        {
            id: 2,
            title: 'Frontend Developer - Startup',
            isPrimary: false,
            updatedAt: '1 week ago',
            tags: ['Frontend', 'React'],
        },
        {
            id: 3,
            title: 'Engineering Manager',
            isPrimary: false,
            updatedAt: '2 weeks ago',
            tags: ['Leadership', 'Management'],
        },
    ]);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">CV Manager</h1>
                        <p className="text-gray-600">Manage, generate, and optimize your resumes</p>
                    </div>
                    <div className="flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowUploadModal(true)}
                            className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50"
                        >
                            📤 Upload CV
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowGenerateModal(true)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg"
                        >
                            ✨ Generate with AI
                        </motion.button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    {[
                        { icon: '🎯', title: 'ATS Score Check', desc: 'Get your resume scored' },
                        { icon: '✍️', title: 'AI Rewrite Section', desc: 'Improve any section' },
                        { icon: '📊', title: 'Compare Versions', desc: 'See what changed' },
                    ].map((action, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-linear-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white cursor-pointer shadow-lg"
                        >
                            <div className="text-4xl mb-3">{action.icon}</div>
                            <h3 className="text-lg font-bold mb-1">{action.title}</h3>
                            <p className="text-sm text-blue-100">{action.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Resumes List */}
                <div className="space-y-4">
                    {resumes.map((resume, i) => (
                        <motion.div
                            key={resume.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ x: 5 }}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center text-3xl">
                                        📄
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-bold text-gray-800">{resume.title}</h3>
                                            {resume.isPrimary && (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                    PRIMARY
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">Updated {resume.updatedAt}</p>
                                        <div className="flex gap-2">
                                            {resume.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"
                                        title="Edit"
                                    >
                                        ✏️
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100"
                                        title="Download"
                                    >
                                        ⬇️
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100"
                                        title="Duplicate"
                                    >
                                        📋
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
                                        title="Delete"
                                    >
                                        🗑️
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Upload Modal */}
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowUploadModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold mb-4">Upload Resume</h2>
                            <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center mb-4 hover:bg-blue-50 transition cursor-pointer">
                                <div className="text-5xl mb-3">📁</div>
                                <p className="text-gray-600 mb-2">Drop your file here or click to browse</p>
                                <p className="text-sm text-gray-500">PDF, DOC, DOCX (Max 5MB)</p>
                            </div>
                            <input
                                type="text"
                                placeholder="Resume Title"
                                className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold"
                                >
                                    Cancel
                                </button>
                                <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold">
                                    Upload
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Generate Modal */}
                {showGenerateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowGenerateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold mb-4">✨ Generate Resume with AI</h2>
                            <p className="text-gray-600 mb-6">
                                AI will create a professional resume from your profile
                            </p>
                            <select className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4">
                                <option>Harvard Template</option>
                                <option>Modern</option>
                                <option>Minimalist</option>
                                <option>Creative</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Target Role (e.g., Senior Software Engineer)"
                                className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowGenerateModal(false)}
                                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold"
                                >
                                    Cancel
                                </button>
                                <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold">
                                    Generate
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}
