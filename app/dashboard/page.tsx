
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/src/app/components/DashboardLayout';
import ChatBot from '@/src/app/components/ChatBot';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        applications: 0,
        interviews: 0,
        offers: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ email: payload.email, userId: payload.userId });
            } catch (e) {
                console.error('Failed to decode token');
            }
        }

        // Fetch real stats
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/dashboard/summary', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStats({
                    applications: data.totalApplications || 0,
                    interviews: data.interviewsScheduled || 0,
                    offers: data.offersReceived || 0
                });
                setRecentActivity(data.recentActivity || []);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (date: string | Date) => {
        const now = new Date();
        const then = new Date(date);
        const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        const weeks = Math.floor(days / 7);
        if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        const months = Math.floor(days / 30);
        return `${months} month${months > 1 ? 's' : ''} ago`;
    };

    // statCards removed as requested

    const quickActions = [
        { icon: '🔍', title: 'Find Jobs', desc: 'Search & apply to opportunities', color: 'from-blue-600 to-blue-400', link: '/dashboard/jobs' },
        { icon: '📄', title: 'Upload CV', desc: 'Update your resume', color: 'from-green-600 to-green-400', link: '/dashboard/cv' },
        { icon: '🎯', title: 'Skill Analysis', desc: 'Check your skill gaps', color: 'from-purple-600 to-purple-400', link: '/dashboard/skills' },
        { icon: '🎤', title: 'Mock Interview', desc: 'Practice with AI coach', color: 'from-orange-600 to-orange-400', link: '/dashboard/interview' },
    ];

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 sm:mb-8"
                >
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                        Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                        Here's your job hunt overview for today
                    </p>
                </motion.div>

                {/* Stats Grid removed as requested */}

                <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, type: 'spring' }}
                        className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-100/50 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg">
                                ⚡
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Quick Actions</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:gap-5">
                            {quickActions.map((action, i) => (
                                <Link key={i} href={action.link}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                                        whileHover={{ y: -8, scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.25)' }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`bg-linear-to-br ${action.color} rounded-2xl p-5 text-white cursor-pointer shadow-lg relative overflow-hidden group`}
                                    >
                                        <motion.div
                                            className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"
                                        />
                                        <div className="relative z-10">
                                            <motion.div
                                                className="text-4xl mb-3"
                                                whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {action.icon}
                                            </motion.div>
                                            <h4 className="font-bold text-base mb-1">{action.title}</h4>
                                            <p className="text-xs opacity-90">{action.desc}</p>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, type: 'spring' }}
                        className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-100/50 backdrop-blur-sm"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-2xl shadow-lg">
                                    📊
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Recent Activity</h3>
                            </div>
                        </div>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"
                                />
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📊</div>
                                <p className="text-gray-600">No recent activity yet</p>
                                <p className="text-sm text-gray-500 mt-2">Start applying to jobs to see your activity here</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentActivity.slice(0, 5).map((activity, i) => (
                                    <Link key={activity.id} href={activity.link}>
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            whileHover={{ x: 5 }}
                                            className="flex items-start gap-4 p-4 rounded-xl hover:bg-blue-50 transition cursor-pointer border border-blue-100"
                                        >
                                            <div className={`w-10 h-10 shrink-0 rounded-lg bg-${activity.color}-100 flex items-center justify-center text-xl`}>
                                                {activity.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-800 font-medium">{activity.text}</p>
                                                <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.time)}</p>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </motion.div>

            {/* ChatBot Widget */}
            <ChatBot />
        </DashboardLayout>
    );
}