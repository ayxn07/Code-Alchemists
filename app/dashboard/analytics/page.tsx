'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '@/src/app/components/DashboardLayout';

export default function AnalyticsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

    const stats = {
        totalApplications: 47,
        responseRate: 68,
        interviewRate: 23,
        offerRate: 12,
    };

    const activityData = [
        { day: 'Mon', applications: 5, views: 12, responses: 3 },
        { day: 'Tue', applications: 8, views: 18, responses: 5 },
        { day: 'Wed', applications: 6, views: 15, responses: 4 },
        { day: 'Thu', applications: 10, views: 22, responses: 7 },
        { day: 'Fri', applications: 7, views: 16, responses: 4 },
        { day: 'Sat', applications: 3, views: 8, responses: 2 },
        { day: 'Sun', applications: 2, views: 5, responses: 1 },
    ];

    const salaryInsights = {
        yourRange: { min: 80000, max: 100000, currency: 'USD' },
        marketAverage: 95000,
        marketRange: { min: 70000, max: 120000 },
        percentile: 65,
        recommendations: [
            'Your expected range aligns with 65th percentile in the market',
            'Similar roles in your location pay 15% more on average',
            'Companies with 100-500 employees typically offer the best fit',
        ],
    };

    const marketTrends = [
        {
            skill: 'React',
            trend: 'up',
            growth: '+25%',
            demand: 'High',
            avgSalary: '$110k',
        },
        {
            skill: 'TypeScript',
            trend: 'up',
            growth: '+30%',
            demand: 'High',
            avgSalary: '$115k',
        },
        {
            skill: 'Python',
            trend: 'up',
            growth: '+18%',
            demand: 'Very High',
            avgSalary: '$120k',
        },
        {
            skill: 'Node.js',
            trend: 'stable',
            growth: '+5%',
            demand: 'Medium',
            avgSalary: '$105k',
        },
    ];

    const topCompanies = [
        { name: 'TechCorp', matches: 15, avgSalary: '$125k', culture: '4.5/5' },
        { name: 'DataSystems', matches: 12, avgSalary: '$118k', culture: '4.3/5' },
        { name: 'CloudWorks', matches: 10, avgSalary: '$130k', culture: '4.7/5' },
    ];

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Analytics & Insights</h1>
                        <p className="text-gray-600">Track your progress and market intelligence</p>
                    </div>
                    <div className="flex gap-2">
                        {(['week', 'month', 'year'] as const).map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-4 py-2 rounded-xl font-semibold capitalize transition ${selectedPeriod === period
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Applications', value: stats.totalApplications, icon: '📊', color: 'blue' },
                        { label: 'Response Rate', value: `${stats.responseRate}%`, icon: '📧', color: 'green' },
                        { label: 'Interview Rate', value: `${stats.interviewRate}%`, icon: '🎤', color: 'purple' },
                        { label: 'Offer Rate', value: `${stats.offerRate}%`, icon: '🎉', color: 'yellow' },
                    ].map((metric, i) => (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)' }}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
                        >
                            <div className="text-4xl mb-3">{metric.icon}</div>
                            <div className="text-3xl font-bold text-gray-800 mb-1">{metric.value}</div>
                            <div className="text-sm text-gray-600">{metric.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Activity Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 mb-8"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Weekly Activity</h2>
                    <div className="flex items-end gap-4 h-64">
                        {activityData.map((data, i) => (
                            <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex flex-col gap-1">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(data.applications / 10) * 100}%` }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        className="w-full bg-blue-500 rounded-t-lg"
                                        style={{ minHeight: '10px' }}
                                    />
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(data.views / 25) * 100}%` }}
                                        transition={{ delay: 0.6 + i * 0.1 }}
                                        className="w-full bg-green-500 rounded-t-lg"
                                        style={{ minHeight: '10px' }}
                                    />
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(data.responses / 7) * 100}%` }}
                                        transition={{ delay: 0.7 + i * 0.1 }}
                                        className="w-full bg-purple-500 rounded-t-lg"
                                        style={{ minHeight: '10px' }}
                                    />
                                </div>
                                <span className="text-sm font-semibold text-gray-600">{data.day}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center gap-6 mt-6">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded"></div>
                            <span className="text-sm text-gray-600">Applications</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span className="text-sm text-gray-600">Profile Views</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-purple-500 rounded"></div>
                            <span className="text-sm text-gray-600">Responses</span>
                        </div>
                    </div>
                </motion.div>

                {/* Salary Insights */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-linear-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-xl mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">💰 Salary Insights</h2>
                            <p className="text-green-100">Market analysis for your profile</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-white text-green-600 rounded-xl font-bold hover:bg-green-50"
                        >
                            📄 Get Negotiation Script
                        </motion.button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm">
                                <h3 className="font-bold text-lg mb-4">Your Expected Range</h3>
                                <div className="text-4xl font-bold mb-2">
                                    ${salaryInsights.yourRange.min.toLocaleString()} - $
                                    {salaryInsights.yourRange.max.toLocaleString()}
                                </div>
                                <div className="text-green-100">USD per year</div>
                            </div>
                        </div>
                        <div>
                            <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm">
                                <h3 className="font-bold text-lg mb-4">Market Average</h3>
                                <div className="text-4xl font-bold mb-2">
                                    ${salaryInsights.marketAverage.toLocaleString()}
                                </div>
                                <div className="text-green-100">You're at {salaryInsights.percentile}th percentile</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-2">
                        {salaryInsights.recommendations.map((rec, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                                className="bg-white/10 rounded-lg p-3 backdrop-blur-sm"
                            >
                                <span className="text-green-200">💡</span> {rec}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Market Trends */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 mb-8"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">🔥 Trending Skills in Your Domain</h2>
                    <div className="space-y-4">
                        {marketTrends.map((trend, i) => (
                            <motion.div
                                key={trend.skill}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                                className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                                        {trend.skill.slice(0, 2)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{trend.skill}</h3>
                                        <div className="flex gap-3 text-sm text-gray-600">
                                            <span
                                                className={`font-semibold ${trend.trend === 'up' ? 'text-green-600' : 'text-gray-600'
                                                    }`}
                                            >
                                                {trend.trend === 'up' ? '📈' : '➡️'} {trend.growth}
                                            </span>
                                            <span>Demand: {trend.demand}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-800">{trend.avgSalary}</div>
                                    <div className="text-sm text-gray-600">Avg. Salary</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Top Matching Companies */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">🏢 Top Companies for Your Profile</h2>
                    <div className="space-y-4">
                        {topCompanies.map((company, i) => (
                            <motion.div
                                key={company.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + i * 0.1 }}
                                whileHover={{ x: 5 }}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                                        {company.name.slice(0, 1)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">{company.name}</h3>
                                        <div className="flex gap-4 text-sm text-gray-600">
                                            <span>📊 {company.matches} matching jobs</span>
                                            <span>⭐ Culture: {company.culture}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-gray-800">{company.avgSalary}</div>
                                    <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                                        View Jobs
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </DashboardLayout>
    );
}
