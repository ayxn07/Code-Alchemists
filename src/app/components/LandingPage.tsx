'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50">
            {/* Navigation */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-blue-100"
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-2xl font-bold bg-linear-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"
                    >
                        RapidAI
                    </motion.div>
                    <div className="flex items-center gap-6">
                        <Link href="#features" className="text-gray-700 hover:text-blue-600 transition">
                            Features
                        </Link>
                        <Link href="#about" className="text-gray-700 hover:text-blue-600 transition">
                            About
                        </Link>
                        <Link href="/login">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                            >
                                Get Started
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <motion.h1
                            className="text-6xl md:text-7xl font-bold mb-6 bg-linear-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            Your AI Career OS
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
                        >
                            Find, apply, and track jobs automatically with AI-powered resume tailoring,
                            interview coaching, and career insights.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                            className="flex gap-4 justify-center"
                        >
                            <Link href="/register">
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition shadow-lg"
                                >
                                    Start Free Trial
                                </motion.button>
                            </Link>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-white text-blue-600 rounded-full text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition"
                            >
                                Watch Demo
                            </motion.button>
                        </motion.div>
                    </motion.div>

                    {/* Floating Cards Animation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="mt-20 relative h-96"
                    >
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    y: [0, -20, 0],
                                    rotate: [0, 5, 0],
                                }}
                                transition={{
                                    duration: 3 + i,
                                    repeat: Infinity,
                                    delay: i * 0.3,
                                }}
                                className="absolute left-1/2 transform -translate-x-1/2 w-80 h-48 bg-white rounded-2xl shadow-xl p-6 border border-blue-100"
                                style={{
                                    top: `${i * 60}px`,
                                    left: `calc(50% + ${(i - 1) * 150}px)`,
                                    zIndex: 3 - i,
                                }}
                            >
                                <div className="h-full flex flex-col justify-between">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">{['🎯', '📝', '🚀'][i]}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-2">
                                            {['Smart Job Matching', 'AI Resume Tailoring', 'Interview Coach'][i]}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {[
                                                'Find perfect opportunities',
                                                'ATS-optimized resumes',
                                                'Practice with AI mentor',
                                            ][i]}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6 bg-white/50">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl font-bold mb-4 text-gray-800">Powerful Features</h2>
                        <p className="text-xl text-gray-600">Everything you need to accelerate your career</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '🤖',
                                title: 'AI Job Hunt Twin',
                                desc: 'Your digital assistant applies to jobs automatically while you sleep',
                            },
                            {
                                icon: '📊',
                                title: 'Career Dashboard',
                                desc: 'Track applications, interviews, and progress in one beautiful interface',
                            },
                            {
                                icon: '🎤',
                                title: 'Mock Interviews',
                                desc: 'Practice with AI voice coaching for HR, technical, and behavioral rounds',
                            },
                            {
                                icon: '📈',
                                title: 'Skill Gap Analysis',
                                desc: 'Know exactly what to learn for your dream role',
                            },
                            {
                                icon: '💰',
                                title: 'Salary Insights',
                                desc: 'Get market data and negotiation scripts powered by AI',
                            },
                            {
                                icon: '🔗',
                                title: 'LinkedIn Integration',
                                desc: 'Import profile and sync opportunities seamlessly',
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)' }}
                                className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 cursor-pointer"
                            >
                                <div className="text-5xl mb-4">{feature.icon}</div>
                                <h3 className="text-2xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto bg-linear-to-r from-blue-600 to-blue-400 rounded-3xl p-12 text-center text-white shadow-2xl"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Career?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Join thousands of professionals accelerating their job search with AI
                    </p>
                    <Link href="/register">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-10 py-4 bg-white text-blue-600 rounded-full text-lg font-bold hover:bg-gray-50 transition shadow-lg"
                        >
                            Get Started Free
                        </motion.button>
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 bg-white border-t border-blue-100">
                <div className="max-w-7xl mx-auto text-center text-gray-600">
                    <p>&copy; 2025 RapidAI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
