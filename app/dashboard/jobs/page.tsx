'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/src/app/components/DashboardLayout';

interface Job {
    id: string;
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
}

export default function JobsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        location: '',
        remote: false,
        salaryMin: '',
        jobType: 'all',
    });
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Load initial jobs on mount
    useEffect(() => {
        handleSearch();
    }, []);

    const handleSearch = async (loadMore = false) => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('auth_token');
            const currentPage = loadMore ? page : 1;

            console.log('Searching jobs with params:', {
                query: searchQuery || 'Data Engineer',
                location: filters.location,
                page: currentPage,
            });

            const response = await fetch('/api/jobs/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    query: searchQuery || 'Data Engineer',
                    location: filters.location,
                    remote: filters.remote,
                    employmentTypes: filters.jobType !== 'all' ? [filters.jobType.toUpperCase().replace('-', '_')] : undefined,
                    page: currentPage,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API error:', errorData);
                throw new Error('Failed to search jobs');
            }

            const data = await response.json();
            console.log('API response:', data);
            const newJobs = data.jobs || [];
            console.log('Received jobs:', newJobs.length);

            if (loadMore) {
                setJobs(prev => [...prev, ...newJobs]);
            } else {
                setJobs(newJobs);
                setPage(1);
            }

            setHasMore(newJobs.length > 0);
            if (loadMore) setPage(prev => prev + 1);
        } catch (err: any) {
            setError(err.message || 'Failed to search jobs');
            console.error('Job search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveJob = async (job: Job) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/jobs/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    jobId: job.id,
                    title: job.title,
                    company: job.organization,
                    location: job.locations_derived?.[0] || 'Not specified',
                    salary: job.salary_raw?.value
                        ? `${job.salary_raw.currency} ${job.salary_raw.value.minValue} - ${job.salary_raw.value.maxValue}`
                        : 'Not specified',
                    type: job.employment_type?.[0] || 'Full-time',
                    url: job.url,
                }),
            });

            if (response.ok) {
                alert('Job saved successfully! ✅');
            }
        } catch (err) {
            console.error('Failed to save job:', err);
            alert('Failed to save job');
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

    const formatLocation = (job: Job) => {
        if (job.remote_derived) return '🌍 Remote';
        if (job.locations_derived && job.locations_derived.length > 0) {
            return `📍 ${job.locations_derived[0]}`;
        }
        return '📍 Location not specified';
    };

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
                            onClick={() => handleSearch(false)}
                            disabled={loading}
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '⏳ Searching...' : '🔍 Search'}
                        </motion.button>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600"
                        >
                            {error}
                        </motion.div>
                    )}

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
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="text-6xl"
                        >
                            🔍
                        </motion.div>
                    </div>
                ) : jobs.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No jobs found</h3>
                        <p className="text-gray-600">Try adjusting your search criteria</p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job, i) => {
                            const jobId = job.id;
                            const title = job.title;
                            const company = job.organization;
                            const location = formatLocation(job);
                            const salary = job.salary_raw?.value
                                ? `💰 ${job.salary_raw.currency} ${Math.round(job.salary_raw.value.minValue / 1000)}k - ${Math.round(job.salary_raw.value.maxValue / 1000)}k`
                                : '💰 Not specified';
                            const remote = job.remote_derived;
                            const posted = formatPostedDate(job.date_posted);
                            const logo = job.organization_logo || '🏢';

                            return (
                                <motion.div
                                    key={jobId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)' }}
                                    className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 shrink-0 rounded-xl bg-linear-to-r from-blue-500 to-blue-600 flex items-center justify-center text-3xl overflow-hidden">
                                                {typeof logo === 'string' && logo.startsWith('http') ? (
                                                    <img src={logo} alt={company} className="w-full h-full object-cover" />
                                                ) : (
                                                    logo
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
                                                <p className="text-gray-600 font-medium mb-2">{company}</p>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                        {location}
                                                    </span>
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                        {salary}
                                                    </span>
                                                    {remote && (
                                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                                            🏠 Remote
                                                        </span>
                                                    )}
                                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                                        ⏰ {posted}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        {job.url ? (
                                            <motion.a
                                                href={job.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 text-center"
                                            >
                                                Apply Now
                                            </motion.a>
                                        ) : (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                                            >
                                                Quick Apply
                                            </motion.button>
                                        )}
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleSaveJob(job)}
                                            className="px-4 py-2 bg-[#65cae1] text-white rounded-xl font-semibold hover:bg-[#4db8d4]"
                                            style={{ boxShadow: '0 4px 12px rgba(101, 202, 225, 0.3)' }}
                                        >
                                            Save
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-4 py-2 bg-[#65cae1] text-white rounded-xl font-semibold hover:bg-[#4db8d4]"
                                            style={{ boxShadow: '0 4px 12px rgba(101, 202, 225, 0.3)' }}
                                        >
                                            Tailor CV
                                        </motion.button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Load More */}
                {jobs.length > 0 && hasMore && !loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex justify-center mt-8"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSearch(true)}
                            className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50"
                        >
                            Load More Jobs
                        </motion.button>
                    </motion.div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}
