'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/src/app/components/DashboardLayout';

export default function SkillsPage() {
    const [activeTab, setActiveTab] = useState<'analysis' | 'learning'>('analysis');
    const [skillGapData, setSkillGapData] = useState<any>(null);
    const [learningPlan, setLearningPlan] = useState<any>(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);

    // Fetch user profile
    const fetchUserProfile = async () => {
        try {
            const response = await fetch('/api/profile');
            if (response.ok) {
                const result = await response.json();
                setUserProfile(result.profile);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    // Fetch skill analysis
    const fetchSkillAnalysis = async (targetRole?: string) => {
        setLoadingAnalysis(true);
        setError(null);
        try {
            const response = await fetch('/api/skills/analyze-dynamic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetRole }),
            });

            if (!response.ok) {
                throw new Error('Failed to analyze skills');
            }

            const result = await response.json();
            setSkillGapData(result.data);
        } catch (err: any) {
            console.error('Error analyzing skills:', err);
            setError(err.message);
        } finally {
            setLoadingAnalysis(false);
        }
    };

    // Fetch existing learning plan
    const fetchLearningPlan = async () => {
        setLoadingPlan(true);
        try {
            const response = await fetch('/api/learning/generate-plan');
            if (!response.ok) {
                throw new Error('Failed to fetch learning plan');
            }

            const result = await response.json();
            if (result.data) {
                setLearningPlan(result.data);
            }
        } catch (err: any) {
            console.error('Error fetching learning plan:', err);
        } finally {
            setLoadingPlan(false);
        }
    };

    // Generate new learning plan
    const generateLearningPlan = async () => {
        if (!skillGapData) return;

        setLoadingPlan(true);
        setError(null);
        try {
            const response = await fetch('/api/learning/generate-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    missingSkills: skillGapData.missingSkills,
                    targetRole: skillGapData.targetRole,
                    weeklyHours: 10,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate learning plan');
            }

            const result = await response.json();
            setLearningPlan(result.data);
            setActiveTab('learning');
        } catch (err: any) {
            console.error('Error generating learning plan:', err);
            setError(err.message);
        } finally {
            setLoadingPlan(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
        fetchSkillAnalysis();
        fetchLearningPlan();
    }, []);

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Skills & Learning</h1>
                    <p className="text-gray-600">AI-powered skill gap analysis and personalized learning plans</p>
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
                                ? 'text-white shadow-lg'
                                : 'bg-white text-gray-700 border'
                                }`}
                            style={activeTab === tab ? { backgroundImage: 'linear-gradient(to right, #65cae1, #4db8d4)', boxShadow: '0 8px 20px rgba(101, 202, 225, 0.3)' } : { borderColor: 'rgba(101, 202, 225, 0.3)' }}
                        >
                            {tab === 'analysis' ? '📊 Skill Gap Analysis' : '📚 Learning Plan'}
                        </motion.button>
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                        {error}
                    </div>
                )}

                {/* Skill Gap Analysis */}
                {activeTab === 'analysis' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {loadingAnalysis ? (
                            <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
                                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                                <p className="text-gray-600 text-lg">Analyzing your skills with AI...</p>
                            </div>
                        ) : skillGapData ? (
                            <>
                                {/* User Profile Overview */}
                                {userProfile && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-2xl p-8 shadow-lg mb-6 text-white"
                                        style={{ backgroundImage: 'linear-gradient(135deg, #65cae1 0%, #4db8d4 50%, #3ba5c0 100%)', boxShadow: '0 12px 30px rgba(101, 202, 225, 0.3)' }}
                                    >
                                        <h2 className="text-3xl font-bold mb-6">Your Professional Profile</h2>
                                        <div className="grid md:grid-cols-3 gap-6">
                                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                                <div className="text-white/70 text-sm mb-1">Current Role</div>
                                                <div className="text-xl font-bold">{userProfile.currentRole || 'Not specified'}</div>
                                            </div>
                                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                                <div className="text-white/70 text-sm mb-1">Experience</div>
                                                <div className="text-xl font-bold">{userProfile.experienceYears || 0} Years</div>
                                            </div>
                                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                                <div className="text-white/70 text-sm mb-1">Total Skills</div>
                                                <div className="text-xl font-bold">{userProfile.skills?.length || 0} Skills</div>
                                            </div>
                                        </div>
                                        {userProfile.headline && (
                                            <div className="mt-6 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                                <div className="text-white/70 text-sm mb-2">Professional Headline</div>
                                                <p className="text-lg">{userProfile.headline}</p>
                                            </div>
                                        )}
                                        {userProfile.targetRoles && userProfile.targetRoles.length > 0 && (
                                            <div className="mt-6 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                                <div className="text-white/70 text-sm mb-2">Target Roles</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {userProfile.targetRoles.map((role: string, i: number) => (
                                                        <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                                                            {role}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {userProfile.skills && userProfile.skills.length > 0 && (
                                            <div className="mt-6 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                                <div className="text-white/70 text-sm mb-3">Your Current Skills</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {userProfile.skills.map((skill: string, i: number) => (
                                                        <span key={i} className="px-3 py-1.5 bg-white/20 rounded-lg text-sm font-medium">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Target Role & Match */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl p-8 shadow-lg border mb-6"
                                    style={{ borderColor: 'rgba(101, 202, 225, 0.2)', boxShadow: '0 8px 20px rgba(101, 202, 225, 0.1)' }}
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

                                    {skillGapData.insights && (
                                        <div className="mb-6 p-4 rounded-xl"
                                            style={{ background: 'rgba(101, 202, 225, 0.1)' }}>
                                            <p className="text-gray-700">{skillGapData.insights}</p>
                                        </div>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => fetchSkillAnalysis()}
                                        disabled={loadingAnalysis}
                                        className="px-6 py-3 text-white rounded-xl font-semibold disabled:opacity-50"
                                        style={{ backgroundImage: 'linear-gradient(to right, #65cae1, #4db8d4)', boxShadow: '0 8px 20px rgba(101, 202, 225, 0.3)' }}
                                    >
                                        ✨ Re-analyze Skills
                                    </motion.button>
                                </motion.div>

                                {/* Skills Breakdown */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Strong Skills */}
                                    {skillGapData.strongSkills && skillGapData.strongSkills.length > 0 && (
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
                                                {skillGapData.strongSkills.map((skill: string) => (
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
                                    )}

                                    {/* Missing Skills */}
                                    {skillGapData.missingSkills && skillGapData.missingSkills.length > 0 && (
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
                                                {skillGapData.missingSkills.map((skill: string) => (
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
                                    )}

                                    {/* Outdated Skills */}
                                    {skillGapData.outdatedSkills && skillGapData.outdatedSkills.length > 0 && (
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
                                                {skillGapData.outdatedSkills.map((skill: string) => (
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

                                    {/* Recommendations */}
                                    {skillGapData.recommendations && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="bg-white rounded-2xl p-6 shadow-lg border border-purple-200"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                                    style={{ background: 'rgba(101, 202, 225, 0.15)' }}>
                                                    💡
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-800">Recommendations</h3>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="p-3 bg-purple-50 rounded-xl">
                                                    <p className="text-sm font-semibold text-purple-900 mb-1">Priority:</p>
                                                    <p className="text-gray-700">{skillGapData.recommendations.priority}</p>
                                                </div>
                                                <div className="p-3 bg-purple-50 rounded-xl">
                                                    <p className="text-sm font-semibold text-purple-900 mb-1">Timeline:</p>
                                                    <p className="text-gray-700">{skillGapData.recommendations.timeline}</p>
                                                </div>
                                                {skillGapData.recommendations.certifications && skillGapData.recommendations.certifications.length > 0 && (
                                                    <div className="p-3 bg-purple-50 rounded-xl">
                                                        <p className="text-sm font-semibold text-purple-900 mb-2">Suggested Certifications:</p>
                                                        <ul className="list-disc list-inside space-y-1">
                                                            {skillGapData.recommendations.certifications.map((cert: string, i: number) => (
                                                                <li key={i} className="text-gray-700">{cert}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-6 text-center"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={generateLearningPlan}
                                        disabled={loadingPlan}
                                        className="px-8 py-4 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50"
                                        style={{ backgroundImage: 'linear-gradient(to right, #65cae1, #4db8d4)', boxShadow: '0 8px 20px rgba(101, 202, 225, 0.3)' }}
                                    >
                                        {loadingPlan ? '⏳ Generating...' : '📚 Generate Learning Plan'}
                                    </motion.button>
                                </motion.div>
                            </>
                        ) : (
                            <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
                                <p className="text-gray-600 text-lg">No skill analysis available yet.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Learning Plan */}
                {activeTab === 'learning' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {loadingPlan ? (
                            <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
                                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                                <p className="text-gray-600 text-lg">Generating your personalized learning plan with AI...</p>
                            </div>
                        ) : learningPlan && learningPlan.items ? (
                            <>
                                {/* Plan Overview */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-linear-to-r from-blue-600 to-blue-400 rounded-2xl p-8 text-white shadow-lg mb-6"
                                >
                                    <h2 className="text-3xl font-bold mb-4">Your Learning Journey</h2>
                                    <div className="grid grid-cols-3 gap-6">
                                        <div>
                                            <div className="text-3xl font-bold mb-1">{learningPlan.totalWeeks || 12} Weeks</div>
                                            <div className="text-blue-100">Total Duration</div>
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold mb-1">{learningPlan.weeklyHours || 10}h / week</div>
                                            <div className="text-blue-100">Time Commitment</div>
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold mb-1">{learningPlan.items.length} Skills</div>
                                            <div className="text-blue-100">To Master</div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Tips */}
                                {learningPlan.tips && learningPlan.tips.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-200 mb-6"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">
                                                💡
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800">Success Tips</h3>
                                        </div>
                                        <ul className="space-y-2">
                                            {learningPlan.tips.map((tip: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-yellow-600 mt-1">✓</span>
                                                    <span className="text-gray-700">{tip}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )}

                                {/* Learning Items */}
                                <div className="space-y-6">
                                    {learningPlan.items.map((item: any, i: number) => (
                                        <motion.div
                                            key={item.id || i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="bg-white rounded-2xl p-6 shadow-lg border"
                                            style={{ borderColor: 'rgba(101, 202, 225, 0.2)' }}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex gap-4">
                                                    <div className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-lg"
                                                        style={{ background: 'rgba(101, 202, 225, 0.15)', color: '#4db8d4' }}>
                                                        W{item.weekNumber}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{item.skill}</h3>
                                                        {item.description && (
                                                            <p className="text-gray-600 mb-3">{item.description}</p>
                                                        )}
                                                        <div className="flex gap-4 text-sm text-gray-600 mb-3">
                                                            <span>⏱️ {item.estimatedHours} hours</span>
                                                            <span>📅 Week {item.weekNumber}</span>
                                                            {item.difficulty && (
                                                                <span className="capitalize">📊 {item.difficulty}</span>
                                                            )}
                                                        </div>
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'in-progress'
                                                                ? 'bg-green-100 text-green-700'
                                                                : item.status === 'completed'
                                                                    ? 'text-white'
                                                                    : 'bg-gray-100 text-gray-600'
                                                                }`}
                                                            style={item.status === 'completed' ? { background: 'linear-gradient(to right, #65cae1, #4db8d4)' } : {}}
                                                        >
                                                            {item.status === 'in-progress' ? '🔄 In Progress' :
                                                                item.status === 'completed' ? '✅ Completed' :
                                                                    '📝 Not Started'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {item.resources && item.resources.length > 0 && (
                                                    <div className="space-y-2 mt-4">
                                                        <h4 className="font-semibold text-gray-700 mb-2">📚 Resources:</h4>
                                                        {item.resources.map((resource: any, j: number) => (
                                                            <motion.a
                                                                key={j}
                                                                href={resource.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                whileHover={{ x: 5 }}
                                                                className="flex items-center gap-3 p-3 rounded-xl transition cursor-pointer"
                                                                style={{ background: 'rgba(101, 202, 225, 0.1)' }}
                                                            >
                                                                <span className="text-xl">
                                                                    {resource.type === 'course' && '🎓'}
                                                                    {resource.type === 'video' && '📹'}
                                                                    {resource.type === 'book' && '📖'}
                                                                    {resource.type === 'docs' && '📄'}
                                                                    {resource.type === 'tutorial' && '💻'}
                                                                    {resource.type === 'practice' && '🔨'}
                                                                </span>
                                                                <div className="flex-1">
                                                                    <span className="font-medium text-gray-800 block">{resource.title}</span>
                                                                    {resource.provider && (
                                                                        <span className="text-xs text-gray-500">{resource.provider}</span>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-gray-500 capitalize">
                                                                    {resource.type}
                                                                </span>
                                                            </motion.a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-6 text-center"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={generateLearningPlan}
                                        disabled={loadingPlan}
                                        className="px-8 py-4 bg-[#65cae1] text-white rounded-xl font-semibold hover:bg-[#4db8d4] shadow-lg disabled:opacity-50"
                                        style={{ boxShadow: '0 8px 20px rgba(101, 202, 225, 0.3)' }}
                                    >
                                        Regenerate Plan
                                    </motion.button>
                                </motion.div>
                            </>
                        ) : (
                            <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
                                <p className="text-gray-600 text-lg mb-4">No learning plan available yet.</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveTab('analysis')}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                                >
                                    Start with Skill Analysis
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </DashboardLayout >
    );
}
