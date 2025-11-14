'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

export default function EmployeeDashboard() {
    const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'jobs' | 'profile'>(
        'overview'
    );

    const stats = [
        { label: 'Applications', value: '24', icon: '📝', color: 'from-blue-500 to-blue-600' },
        { label: 'Interviews', value: '5', icon: '🎤', color: 'from-green-500 to-green-600' },
        { label: 'Offers', value: '2', icon: '🎉', color: 'from-purple-500 to-purple-600' },
        { label: 'Profile Views', value: '142', icon: '👀', color: 'from-orange-500 to-orange-600' },
    ];

    const recentApplications = [
        {
            company: 'Google',
            position: 'Senior Software Engineer',
            status: 'interview',
            date: '2 days ago',
            logo: '🔵',
        },
        {
            company: 'Microsoft',
            position: 'Cloud Architect',
            status: 'applied',
            date: '5 days ago',
            logo: '🟦',
        },
        {
            company: 'Amazon',
            position: 'Full Stack Developer',
            status: 'viewed',
            date: '1 week ago',
            logo: '🟠',
        },
    ];

    const recommendedJobs = [
        {
            company: 'Meta',
            position: 'Frontend Engineer',
            location: 'Remote',
            salary: '$120k - $180k',
            match: 95,
        },
        {
            company: 'Netflix',
            position: 'DevOps Engineer',
            location: 'San Francisco',
            salary: '$140k - $200k',
            match: 88,
        },
        {
            company: 'Apple',
            position: 'iOS Developer',
            location: 'Cupertino',
            salary: '$130k - $190k',
            match: 92,
        },
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50">
            {/* Top Navigation */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className="border-b border-blue-100 sticky top-0 z-50 backdrop-blur-md bg-white/90"
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <motion.h1
                            whileHover={{ scale: 1.05 }}
                            className="text-2xl font-bold bg-linear-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent cursor-pointer"
                        >
                            RapidAI
                        </motion.h1>
                        <div className="hidden md:flex gap-6">
                            {['overview', 'applications', 'jobs', 'profile'].map((tab) => (
                                <motion.button
                                    key={tab}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-4 py-2 rounded-lg font-medium capitalize transition ${activeTab === tab
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-blue-50'
                                        }`}
                                >
                                    {tab}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="relative p-2 text-gray-600 hover:text-blue-600 transition"
                        >
                            <span className="text-2xl">🔔</span>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </motion.button>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-10 h-10 rounded-full bg-linear-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold cursor-pointer"
                        >
                            JD
                        </motion.div>
                    </div>
                </div>
            </motion.nav>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h2 className="text-4xl font-bold text-gray-800 mb-2">Welcome back, John! 👋</h2>
                    <p className="text-gray-600 text-lg">
                        You have 3 new interview invitations and 12 job matches today
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)' }}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-4xl">{stat.icon}</span>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                    className={`w-12 h-12 rounded-full bg-linear-to-r ${stat.color} opacity-20`}
                                />
                            </div>
                            <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-600">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Recent Applications */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Recent Applications</h3>
                            <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                                View All →
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {recentApplications.map((app, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ x: 5 }}
                                    className="flex items-center justify-between p-4 rounded-xl hover:bg-blue-50 transition cursor-pointer border border-blue-100"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-linear-to-r from-blue-500 to-blue-600 flex items-center justify-center text-2xl">
                                            {app.logo}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800">{app.company}</h4>
                                            <p className="text-sm text-gray-600">{app.position}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${app.status === 'interview'
                                                ? 'bg-green-100 text-green-700'
                                                : app.status === 'applied'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                        >
                                            {app.status}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-1">{app.date}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recommended Jobs */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Recommended for You</h3>
                            <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                                See More →
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {recommendedJobs.map((job, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="p-4 rounded-xl border-2 border-blue-100 hover:border-blue-300 transition cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-bold text-gray-800">{job.company}</h4>
                                            <p className="text-sm text-gray-600">{job.position}</p>
                                        </div>
                                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                            {job.match}% Match
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                        <span>📍 {job.location}</span>
                                        <span>💰 {job.salary}</span>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                                    >
                                        Quick Apply
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="mt-8 grid md:grid-cols-3 gap-6"
                >
                    {[
                        { icon: '🎯', title: 'Start Job Hunt Twin', desc: 'Let AI apply for you' },
                        { icon: '📝', title: 'Tailor Resume', desc: 'ATS-optimize for a job' },
                        { icon: '🎤', title: 'Practice Interview', desc: 'Mock with AI coach' },
                    ].map((action, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
                            className="bg-linear-to-r from-blue-600 to-blue-400 rounded-2xl p-6 text-white cursor-pointer shadow-lg"
                        >
                            <div className="text-4xl mb-3">{action.icon}</div>
                            <h4 className="text-xl font-bold mb-2">{action.title}</h4>
                            <p className="text-blue-100">{action.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
