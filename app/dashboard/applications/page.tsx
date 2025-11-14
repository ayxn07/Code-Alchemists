'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '@/src/app/components/DashboardLayout';

export default function ApplicationsPage() {
    const [filter, setFilter] = useState<'all' | 'applied' | 'interview' | 'offer' | 'rejected'>(
        'all'
    );

    const applications = [
        {
            id: 1,
            company: 'Google',
            position: 'Senior Software Engineer',
            status: 'interview',
            appliedDate: '2024-01-15',
            lastUpdate: '2 days ago',
            salary: '$150k - $220k',
            location: 'Mountain View, CA',
            notes: 'Second round scheduled for next week',
        },
        {
            id: 2,
            company: 'Meta',
            position: 'Frontend Engineer',
            status: 'applied',
            appliedDate: '2024-01-10',
            lastUpdate: '1 week ago',
            salary: '$140k - $200k',
            location: 'Remote',
            notes: 'Application under review',
        },
        {
            id: 3,
            company: 'Amazon',
            position: 'Full Stack Developer',
            status: 'offer',
            appliedDate: '2024-01-05',
            lastUpdate: '3 days ago',
            salary: '$130k - $190k',
            location: 'Seattle, WA',
            notes: 'Offer received! Deadline: Jan 30',
        },
        {
            id: 4,
            company: 'Microsoft',
            position: 'Cloud Engineer',
            status: 'rejected',
            appliedDate: '2024-01-01',
            lastUpdate: '1 week ago',
            salary: '$135k - $195k',
            location: 'Redmond, WA',
            notes: 'Position filled internally',
        },
    ];

    const statusColors = {
        applied: 'bg-blue-100 text-blue-700',
        interview: 'bg-green-100 text-green-700',
        offer: 'bg-purple-100 text-purple-700',
        rejected: 'bg-red-100 text-red-700',
        viewed: 'bg-yellow-100 text-yellow-700',
    };

    const statusIcons = {
        applied: '📝',
        interview: '🎤',
        offer: '🎉',
        rejected: '❌',
        viewed: '👀',
    };

    const filteredApps =
        filter === 'all' ? applications : applications.filter((app) => app.status === filter);

    const stats = [
        { label: 'Total Applied', value: applications.length, color: 'blue' },
        {
            label: 'Interviews',
            value: applications.filter((a) => a.status === 'interview').length,
            color: 'green',
        },
        {
            label: 'Offers',
            value: applications.filter((a) => a.status === 'offer').length,
            color: 'purple',
        },
        {
            label: 'Success Rate',
            value: '25%',
            color: 'orange',
        },
    ];

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Applications</h1>
                    <p className="text-gray-600">Track and manage all your job applications</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
                        >
                            <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-600">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100 mb-6"
                >
                    <div className="flex gap-3 flex-wrap">
                        {['all', 'applied', 'interview', 'offer', 'rejected'].map((status) => (
                            <motion.button
                                key={status}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFilter(status as any)}
                                className={`px-6 py-2 rounded-xl font-semibold capitalize transition ${filter === status
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                    }`}
                            >
                                {status}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Applications List */}
                <div className="space-y-4">
                    {filteredApps.map((app, i) => (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ x: 5 }}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex gap-4 flex-1">
                                    <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center text-3xl">
                                        {statusIcons[app.status as keyof typeof statusIcons]}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-800">{app.company}</h3>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColors[app.status as keyof typeof statusColors]
                                                    }`}
                                            >
                                                {app.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 font-medium mb-3">{app.position}</p>
                                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                            <div>📍 {app.location}</div>
                                            <div>💰 {app.salary}</div>
                                            <div>📅 Applied: {app.appliedDate}</div>
                                            <div>🔄 Updated: {app.lastUpdate}</div>
                                        </div>
                                        {app.notes && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-xl text-sm text-gray-700">
                                                <strong>Notes:</strong> {app.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                        title="Edit"
                                    >
                                        ✏️
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                                        title="View Details"
                                    >
                                        👁️
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                        title="Delete"
                                    >
                                        🗑️
                                    </motion.button>
                                </div>
                            </div>

                            <div className="flex gap-3 border-t border-blue-100 pt-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                                >
                                    Update Status
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 py-2 bg-purple-50 text-purple-600 rounded-xl font-semibold hover:bg-purple-100"
                                >
                                    View Job
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredApps.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 bg-white rounded-2xl border border-blue-100"
                    >
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No applications found</h3>
                        <p className="text-gray-600">Try changing the filter or start applying to jobs!</p>
                    </motion.div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}
