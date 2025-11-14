'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '@/src/app/components/DashboardLayout';

export default function JobsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        location: '',
        remote: false,
        salaryMin: '',
        jobType: 'all',
    });

    const jobs = [
        {
            id: 1,
            company: 'Google',
            position: 'Senior Software Engineer',
            location: 'Mountain View, CA',
            salary: '$150k - $220k',
            type: 'Full-time',
            remote: true,
            posted: '2 days ago',
            match: 95,
            logo: '🔵',
        },
        {
            id: 2,
            company: 'Meta',
            position: 'Frontend Engineer',
            location: 'Remote',
            salary: '$140k - $200k',
            type: 'Full-time',
            remote: true,
            posted: '1 week ago',
            match: 92,
            logo: '💙',
        },
        {
            id: 3,
            company: 'Amazon',
            position: 'Full Stack Developer',
            location: 'Seattle, WA',
            salary: '$130k - $190k',
            type: 'Full-time',
            remote: false,
            posted: '3 days ago',
            match: 88,
            logo: '🟠',
        },
        {
            id: 4,
            company: 'Microsoft',
            position: 'Cloud Engineer',
            location: 'Redmond, WA',
            salary: '$135k - $195k',
            type: 'Full-time',
            remote: true,
            posted: '5 days ago',
            match: 90,
            logo: '🟦',
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
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Job Search</h1>
                    <p className="text-gray-600">Find your next opportunity with AI-powered matching</p>
                </div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 mb-6"
                >
                    <div className="flex gap-4 mb-4">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search job title, skills, or company..."
                            className="flex-1 px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                        >
                            🔍 Search
                        </motion.button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Location"
                            value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                            className="px-4 py-2 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={filters.jobType}
                            onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                            className="px-4 py-2 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="full-time">Full-time</option>
                            <option value="part-time">Part-time</option>
                            <option value="contract">Contract</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Min Salary"
                            value={filters.salaryMin}
                            onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })}
                            className="px-4 py-2 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-200 cursor-pointer hover:bg-blue-50">
                            <input
                                type="checkbox"
                                checked={filters.remote}
                                onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
                            />
                            <span className="font-medium">Remote Only</span>
                        </label>
                    </div>
                </motion.div>

                {/* Job Listings */}
                <div className="space-y-4">
                    {jobs.map((job, i) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)' }}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-linear-to-r from-blue-500 to-blue-600 flex items-center justify-center text-3xl">
                                        {job.logo}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">{job.position}</h3>
                                        <p className="text-gray-600 font-medium mb-2">{job.company}</p>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                📍 {job.location}
                                            </span>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                💰 {job.salary}
                                            </span>
                                            {job.remote && (
                                                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                                    🏠 Remote
                                                </span>
                                            )}
                                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                                ⏰ {job.posted}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="mb-3">
                                        <div className="text-3xl font-bold text-green-600 mb-1">{job.match}%</div>
                                        <div className="text-xs text-gray-500">Match Score</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                                >
                                    Quick Apply
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100"
                                >
                                    💾 Save
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-semibold hover:bg-purple-100"
                                >
                                    ✨ Tailor CV
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Load More */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center mt-8"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50"
                    >
                        Load More Jobs
                    </motion.button>
                </motion.div>
            </motion.div>
        </DashboardLayout>
    );
}
