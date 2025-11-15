'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/src/app/components/DashboardLayout';

interface Opportunity {
    id: string;
    type: 'job' | 'hackathon' | 'internship';
    title: string;
    organization: string;
    organization_logo?: string;
    locations_derived?: string[];
    salary_raw?: {
        currency: string;
        value: {
            minValue: number;
            maxValue: number;
        };
    };
    employment_type?: string[];
    remote_derived?: boolean;
    date_posted?: string;
    url: string;
    description_text?: string;
    tags?: string[];
    match?: number;
    urgent?: boolean;
}

export default function OpportunitiesPage() {
    const [selectedTab, setSelectedTab] = useState<'all' | 'jobs' | 'hackathons' | 'internships'>(
        'all'
    );
    const [filters, setFilters] = useState({
        remote: false,
        partTime: false,
        fullTime: false,
    });
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Load opportunities on mount and when tab changes
    useEffect(() => {
        loadOpportunities();
    }, [selectedTab, filters.remote]);

    const loadOpportunities = async (loadMore = false) => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('auth_token');
            const currentPage = loadMore ? page : 1;

            // Determine query based on selected tab
            let query = 'Software Engineer';
            if (selectedTab === 'jobs') query = 'Software Engineer';
            else if (selectedTab === 'internships') query = 'Software Engineering Intern';
            else if (selectedTab === 'hackathons') query = 'Developer';

            const response = await fetch('/api/opportunities/feed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type: selectedTab,
                    query,
                    remote: filters.remote,
                    page: currentPage,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to load opportunities');
            }

            const data = await response.json();
            const newOpportunities = data.opportunities || [];

            if (loadMore) {
                setOpportunities(prev => [...prev, ...newOpportunities]);
            } else {
                setOpportunities(newOpportunities);
                setPage(1);
            }

            setHasMore(newOpportunities.length > 0);
            if (loadMore) setPage(prev => prev + 1);
        } catch (err: any) {
            setError(err.message || 'Failed to load opportunities');
            console.error('Opportunities load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatPostedDate = (dateString?: string) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    };

    const formatLocation = (opp: Opportunity) => {
        if (opp.remote_derived) return 'Remote';
        if (opp.locations_derived && opp.locations_derived.length > 0) {
            return opp.locations_derived[0];
        }
        return 'Location not specified';
    };

    const formatSalary = (opp: Opportunity) => {
        if (opp.salary_raw?.value) {
            return `${opp.salary_raw.currency} ${Math.round(opp.salary_raw.value.minValue / 1000)}k - ${Math.round(opp.salary_raw.value.maxValue / 1000)}k`;
        }
        return 'Salary not specified';
    };

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

    const stats = {
        total: opportunities.length,
        jobs: opportunities.filter(o => o.type === 'job').length,
        hackathons: opportunities.filter(o => o.type === 'hackathon').length,
        internships: opportunities.filter(o => o.type === 'internship').length,
    };

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
                            <div className="text-3xl font-bold">{stats.total}</div>
                            <div className="text-blue-100">Total Opportunities</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold">{stats.jobs}</div>
                            <div className="text-blue-100">Job Openings</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold">{stats.hackathons}</div>
                            <div className="text-blue-100">Active Hackathons</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold">{stats.internships}</div>
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
                                ? 'bg-[#65cae1] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            style={filters.remote ? { boxShadow: '0 4px 12px rgba(101, 202, 225, 0.3)' } : {}}
                        >
                            Remote Only
                        </button>
                        <button className="px-4 py-2 rounded-xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200">
                            More Filters
                        </button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Opportunities Grid */}
                {loading && opportunities.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="text-6xl"
                        >
                            🔍
                        </motion.div>
                    </div>
                ) : opportunities.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No opportunities found</h3>
                        <p className="text-gray-600">Try adjusting your filters or check back later</p>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {opportunities.map((opp, i) => (
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
                                                    {opp.remote_derived && (
                                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                            🏠 Remote
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-gray-600 mb-2">
                                                    {opp.organization} • {formatLocation(opp)}
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
                                            <span>💰 {formatSalary(opp)}</span>
                                            {opp.employment_type && <span>📋 {opp.employment_type[0]}</span>}
                                            <span>🕒 {formatPostedDate(opp.date_posted)}</span>
                                        </div>

                                        {/* Tags */}
                                        {opp.tags && opp.tags.length > 0 && (
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
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-3">
                                            {opp.url && (
                                                <motion.a
                                                    href={opp.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="px-6 py-2 rounded-xl font-semibold text-white bg-[#65cae1] hover:bg-[#4db8d4]"
                                                    style={{ boxShadow: '0 4px 12px rgba(101, 202, 225, 0.3)' }}
                                                >
                                                    {opp.type === 'job'
                                                        ? 'Quick Apply'
                                                        : opp.type === 'hackathon'
                                                            ? 'Register'
                                                            : 'Apply Now'}
                                                </motion.a>
                                            )}
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
                                            >
                                                Save
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
                )}

                {/* Load More */}
                {opportunities.length > 0 && hasMore && !loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center mt-8"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => loadOpportunities(true)}
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg"
                        >
                            Load More Opportunities
                        </motion.button>
                    </motion.div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}
