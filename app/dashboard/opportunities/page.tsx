'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '@/src/app/components/DashboardLayout';

export default function OpportunitiesPage() {
    const [selectedTab, setSelectedTab] = useState<'all' | 'jobs' | 'hackathons' | 'internships'>(
        'all'
    );
    const [filters, setFilters] = useState({
        remote: false,
        partTime: false,
        fullTime: false,
    });

    const opportunities = [
        {
            id: 1,
            type: 'job',
            title: 'Senior Full Stack Developer',
            company: 'TechCorp',
            location: 'San Francisco, CA',
            salary: '$120k - $160k',
            remote: true,
            tags: ['React', 'Node.js', 'TypeScript'],
            posted: '2 days ago',
            match: 92,
            urgent: false,
        },
        {
            id: 2,
            type: 'hackathon',
            title: 'AI Innovation Challenge 2024',
            organizer: 'MLH',
            location: 'Virtual',
            prize: '$50,000',
            remote: true,
            tags: ['AI', 'Machine Learning', 'Python'],
            posted: '1 week ago',
            deadline: '2024-02-15',
            participants: 500,
        },
        {
            id: 3,
            type: 'internship',
            title: 'Summer Software Engineering Intern',
            company: 'DataWorks',
            location: 'New York, NY',
            salary: '$30/hour',
            remote: false,
            tags: ['Python', 'Data Science', 'React'],
            posted: '3 days ago',
            duration: '12 weeks',
            match: 85,
        },
        {
            id: 4,
            type: 'job',
            title: 'Lead Frontend Engineer',
            company: 'DesignHub',
            location: 'Remote',
            salary: '$140k - $180k',
            remote: true,
            tags: ['React', 'Vue', 'CSS', 'Design Systems'],
            posted: '5 hours ago',
            match: 88,
            urgent: true,
        },
        {
            id: 5,
            type: 'hackathon',
            title: 'Blockchain Builders Summit',
            organizer: 'CryptoConf',
            location: 'Austin, TX',
            prize: '$100,000',
            remote: false,
            tags: ['Blockchain', 'Web3', 'Smart Contracts'],
            posted: '4 days ago',
            deadline: '2024-03-01',
            participants: 300,
        },
        {
            id: 6,
            type: 'internship',
            title: 'Fall Backend Engineering Intern',
            company: 'CloudScale',
            location: 'Seattle, WA',
            salary: '$35/hour',
            remote: true,
            tags: ['Go', 'Kubernetes', 'AWS'],
            posted: '1 day ago',
            duration: '16 weeks',
            match: 78,
        },
    ];

    const typeIcons = {
        job: '💼',
        hackathon: '🏆',
        internship: '🎓',
    };

    const typeColors = {
        job: 'blue',
        hackathon: 'purple',
        internship: 'green',
    };

    const filteredOpportunities = opportunities.filter((opp) => {
        if (selectedTab !== 'all' && opp.type !== selectedTab.slice(0, -1)) return false;
        if (filters.remote && !opp.remote) return false;
        return true;
    });

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Opportunities Feed</h1>
                    <p className="text-gray-600">Discover jobs, hackathons, and internships tailored for you</p>
                </div>

                {/* Stats Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl mb-8"
                >
                    <div className="grid md:grid-cols-4 gap-4">
                        <div>
                            <div className="text-3xl font-bold">{opportunities.length}</div>
                            <div className="text-blue-100">Total Opportunities</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold">
                                {opportunities.filter((o) => o.type === 'job').length}
                            </div>
                            <div className="text-blue-100">Job Openings</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold">
                                {opportunities.filter((o) => o.type === 'hackathon').length}
                            </div>
                            <div className="text-blue-100">Active Hackathons</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold">
                                {opportunities.filter((o) => o.type === 'internship').length}
                            </div>
                            <div className="text-blue-100">Internships</div>
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    {/* Type Tabs */}
                    <div className="flex gap-2">
                        {(['all', 'jobs', 'hackathons', 'internships'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedTab(tab)}
                                className={`px-4 py-2 rounded-xl font-semibold capitalize transition ${selectedTab === tab
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-2 ml-auto">
                        <button
                            onClick={() => setFilters({ ...filters, remote: !filters.remote })}
                            className={`px-4 py-2 rounded-xl font-semibold transition ${filters.remote
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            🏠 Remote Only
                        </button>
                        <button className="px-4 py-2 rounded-xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200">
                            🔍 More Filters
                        </button>
                    </div>
                </div>

                {/* Opportunities Grid */}
                <div className="space-y-6">
                    {filteredOpportunities.map((opp, i) => (
                        <motion.div
                            key={opp.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)' }}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 relative overflow-hidden"
                        >
                            {/* Urgent Badge */}
                            {'urgent' in opp && opp.urgent && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 rounded-bl-xl font-bold text-sm">
                                    🔥 URGENT
                                </div>
                            )}

                            <div className="flex gap-6">
                                {/* Icon */}
                                <div
                                    className={`w-16 h-16 bg-linear-to-r ${typeColors[opp.type as keyof typeof typeColors] === 'blue'
                                        ? 'from-blue-500 to-blue-600'
                                        : typeColors[opp.type as keyof typeof typeColors] === 'purple'
                                            ? 'from-purple-500 to-purple-600'
                                            : 'from-green-500 to-green-600'
                                        } rounded-xl flex items-center justify-center text-3xl shrink-0`}
                                >
                                    {typeIcons[opp.type as keyof typeof typeIcons]}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-800">{opp.title}</h3>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${typeColors[opp.type as keyof typeof typeColors] === 'blue'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : typeColors[opp.type as keyof typeof typeColors] === 'purple'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-green-100 text-green-700'
                                                        }`}
                                                >
                                                    {opp.type}
                                                </span>
                                                {opp.remote && (
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                        🏠 Remote
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-gray-600 mb-2">
                                                {'company' in opp ? opp.company : opp.organizer} • {opp.location}
                                            </div>
                                        </div>
                                        {'match' in opp && (
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-blue-600">{opp.match}%</div>
                                                <div className="text-xs text-gray-600">Match</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                                        {'salary' in opp && <span>💰 {opp.salary}</span>}
                                        {'prize' in opp && <span>🏆 Prize: {opp.prize}</span>}
                                        {'duration' in opp && <span>⏱️ {opp.duration}</span>}
                                        {'deadline' in opp && <span>📅 Deadline: {opp.deadline}</span>}
                                        {'participants' in opp && <span>👥 {opp.participants} participants</span>}
                                        <span>🕒 {opp.posted}</span>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {opp.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`px-6 py-2 rounded-xl font-semibold text-white ${typeColors[opp.type as keyof typeof typeColors] === 'blue'
                                                ? 'bg-blue-600 hover:bg-blue-700'
                                                : typeColors[opp.type as keyof typeof typeColors] === 'purple'
                                                    ? 'bg-purple-600 hover:bg-purple-700'
                                                    : 'bg-green-600 hover:bg-green-700'
                                                }`}
                                        >
                                            {opp.type === 'job'
                                                ? '📤 Quick Apply'
                                                : opp.type === 'hackathon'
                                                    ? '🚀 Register'
                                                    : '📋 Apply Now'}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
                                        >
                                            💾 Save
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
                                        >
                                            📄 Details
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Load More */}
                {filteredOpportunities.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center mt-8"
                    >
                        <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg">
                            Load More Opportunities
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}
