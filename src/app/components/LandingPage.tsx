'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
    const heroRef = useRef(null);
    const timelineRef = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        // GSAP Timeline Animations
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.timeline-item',
                { opacity: 0, x: -100 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    stagger: 0.2,
                    scrollTrigger: {
                        trigger: timelineRef.current,
                        start: 'top center+=100',
                        end: 'bottom center',
                        toggleActions: 'play none none reverse',
                    },
                }
            );
        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            {/* Animated Cursor Glow */}
            <motion.div
                className="fixed w-96 h-96 rounded-full pointer-events-none z-0 blur-3xl"
                style={{
                    background: 'radial-gradient(circle, rgba(101, 202, 225, 0.15), transparent)',
                    left: mousePosition.x - 192,
                    top: mousePosition.y - 192,
                }}
                animate={{
                    left: mousePosition.x - 192,
                    top: mousePosition.y - 192,
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            />

            {/* Navigation */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-lg border-b shadow-sm"
                style={{ borderColor: 'rgba(77, 184, 212, 0.2)' }}
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-20 h-20 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                            <img src="/Logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-2xl font-black bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #4db8d4, #3ba5c0)' }}>
                            CareerPilot
                        </span>
                    </motion.div>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-gray-700 hover:text-[#4db8d4] transition font-medium">
                            Features
                        </Link>
                        <Link href="#timeline" className="text-gray-700 hover:text-[#4db8d4] transition font-medium">
                            How It Works
                        </Link>
                        <Link href="#benefits" className="text-gray-700 hover:text-[#4db8d4] transition font-medium">
                            Benefits
                        </Link>
                        <Link href="/login">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(77, 184, 212, 0.4)' }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-2.5 text-white rounded-full font-semibold transition shadow-lg"
                                style={{ backgroundImage: 'linear-gradient(to right, #4db8d4, #3ba5c0)' }}
                            >
                                Get Started
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <motion.section
                ref={heroRef}
                style={{ opacity, scale }}
                className="relative pt-32 pb-24 px-6 min-h-screen flex items-center justify-center overflow-hidden"
            >
                {/* Animated Background Gradients */}
                <div className="absolute inset-0 z-0">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-3xl opacity-20"
                        style={{ background: 'radial-gradient(circle, #4db8d4, transparent)' }}
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [360, 180, 0],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                        className="absolute -bottom-40 -left-40 w-[700px] h-[700px] rounded-full blur-3xl opacity-20"
                        style={{ background: 'radial-gradient(circle, #3ba5c0, transparent)' }}
                    />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Text Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -100 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="inline-block px-4 py-2 rounded-full mb-6 text-sm font-semibold"
                                style={{ background: 'rgba(101, 202, 225, 0.1)', color: '#4db8d4' }}
                            >
                                🚀 AI-Powered Career Platform
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-6xl lg:text-7xl font-black mb-6 leading-tight"
                            >
                                <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #4db8d4 0%, #3ba5c0 50%, #2a93a8 100%)' }}>
                                    Land Your Dream Job
                                </span>
                                <br />
                                <span className="text-gray-800">With AI</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg"
                            >
                                Transform your career with <span className="font-bold text-[#4db8d4]">AI-powered tools</span> that optimize your resume,
                                coach you for interviews, and connect you with perfect opportunities—all in one intelligent platform.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex flex-wrap gap-4"
                            >
                                <Link href="/register">
                                    <motion.button
                                        whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(77, 184, 212, 0.5)' }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-8 py-4 text-white rounded-2xl text-lg font-bold transition shadow-lg"
                                        style={{ backgroundImage: 'linear-gradient(135deg, #4db8d4, #3ba5c0)', boxShadow: '0 10px 30px rgba(77, 184, 212, 0.3)' }}
                                    >
                                        Start Free Today →
                                    </motion.button>
                                </Link>
                                <motion.button
                                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(101, 202, 225, 0.05)' }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-white text-gray-800 rounded-2xl text-lg font-bold border-2 transition"
                                    style={{ borderColor: '#4db8d4' }}
                                >
                                    📹 Watch Demo
                                </motion.button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="flex items-center gap-8 mt-8 pt-8 border-t border-gray-200"
                            >
                                <div>
                                    <div className="text-3xl font-black text-[#4db8d4]">10K+</div>
                                    <div className="text-sm text-gray-600">Active Users</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-[#4db8d4]">95%</div>
                                    <div className="text-sm text-gray-600">Success Rate</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-[#4db8d4]">24/7</div>
                                    <div className="text-sm text-gray-600">AI Support</div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Right: Animated Visual */}
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="relative"
                        >
                            <motion.div
                                animate={{
                                    y: [0, -20, 0],
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="relative z-10"
                            >
                                <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-xl border-2"
                                    style={{ borderColor: 'rgba(101, 202, 225, 0.3)' }}>
                                    <div className="space-y-4">
                                        {/* Animated Cards */}
                                        {[
                                            { icon: '📄', title: 'AI Resume Builder', desc: 'Tailored for every job', color: '#4db8d4' },
                                            { icon: '🎤', title: 'Interview Coach', desc: 'Practice with AI feedback', color: '#3ba5c0' },
                                            { icon: '🔍', title: 'Smart Job Matching', desc: 'Find perfect opportunities', color: '#2a93a8' },
                                        ].map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.6 + i * 0.1 }}
                                                whileHover={{ x: 10, boxShadow: `0 10px 30px ${item.color}40` }}
                                                className="flex items-center gap-4 p-4 rounded-xl border-2 bg-white cursor-pointer transition-all"
                                                style={{ borderColor: `${item.color}30` }}
                                            >
                                                <div className="text-4xl">{item.icon}</div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-gray-800">{item.title}</div>
                                                    <div className="text-sm text-gray-500">{item.desc}</div>
                                                </div>
                                                <motion.div
                                                    animate={{ x: [0, 5, 0] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                    className="text-2xl"
                                                    style={{ color: item.color }}
                                                >
                                                    →
                                                </motion.div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Elements */}
                            <motion.div
                                animate={{
                                    y: [0, 15, 0],
                                    rotate: [0, 5, 0],
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute -top-8 -right-8 w-24 h-24 rounded-2xl shadow-xl flex items-center justify-center text-4xl"
                                style={{ background: 'linear-gradient(135deg, #4db8d4, #3ba5c0)' }}
                            >
                                ✨
                            </motion.div>
                            <motion.div
                                animate={{
                                    y: [0, -15, 0],
                                    rotate: [0, -5, 0],
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                                className="absolute -bottom-8 -left-8 w-20 h-20 rounded-2xl shadow-xl flex items-center justify-center text-3xl"
                                style={{ background: 'linear-gradient(135deg, #3ba5c0, #2a93a8)' }}
                            >
                                🎯
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Timeline Section - How It Works */}
            <section id="timeline" ref={timelineRef} className="py-24 px-6 bg-linear-to-br from-gray-50 to-white relative overflow-hidden">
                <div className="max-w-6xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-5xl lg:text-6xl font-black mb-4 bg-clip-text text-transparent"
                            style={{ backgroundImage: 'linear-gradient(to right, #4db8d4, #3ba5c0)' }}>
                            How CareerPilot Works
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Your journey from job search to dream offer, powered by AI at every step
                        </p>
                    </motion.div>

                    <div className="relative">
                        {/* Vertical Timeline Line */}
                        <div className="absolute left-8 top-0 bottom-0 w-1 rounded-full" style={{ background: 'linear-gradient(to bottom, #4db8d4, #3ba5c0, #2a93a8)' }} />

                        <div className="space-y-12">
                            {[
                                {
                                    step: '01',
                                    title: 'Build Your Profile',
                                    desc: 'Upload your resume and let our AI analyze your skills, experience, and career goals. Connect LinkedIn for instant sync.',
                                    icon: '👤',
                                    color: '#4db8d4',
                                },
                                {
                                    step: '02',
                                    title: 'AI Resume Optimization',
                                    desc: 'Our AI tailors your resume for each job application, optimizing ATS scores and highlighting relevant experience.',
                                    icon: '📄',
                                    color: '#3ba5c0',
                                },
                                {
                                    step: '03',
                                    title: 'Smart Job Matching',
                                    desc: 'Get personalized job recommendations based on your profile, preferences, and market trends. Apply with one click.',
                                    icon: '🔍',
                                    color: '#2a93a8',
                                },
                                {
                                    step: '04',
                                    title: 'Interview Preparation',
                                    desc: 'Practice with AI-powered mock interviews. Get real-time feedback on your answers, tone, and body language.',
                                    icon: '🎤',
                                    color: '#4db8d4',
                                },
                                {
                                    step: '05',
                                    title: 'Track & Negotiate',
                                    desc: 'Monitor all applications in one dashboard. Use AI-generated insights for salary negotiation and offer evaluation.',
                                    icon: '💰',
                                    color: '#3ba5c0',
                                },
                                {
                                    step: '06',
                                    title: 'Land Your Dream Job',
                                    desc: 'Celebrate your success! Continue using our platform for career growth, skill development, and networking.',
                                    icon: '🎯',
                                    color: '#2a93a8',
                                },
                            ].map((item, i) => (
                                <div key={i} className="timeline-item flex gap-6 relative">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 360 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-xl relative z-10 shrink-0"
                                        style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)` }}
                                    >
                                        {item.icon}
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ x: 10 }}
                                        className="flex-1 bg-white rounded-2xl p-8 shadow-lg border-2 transition-all cursor-pointer"
                                        style={{ borderColor: `${item.color}20` }}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="text-sm font-bold mb-2" style={{ color: item.color }}>
                                                    STEP {item.step}
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-800 mb-2">{item.title}</h3>
                                            </div>
                                            <motion.div
                                                animate={{ rotate: [0, 10, 0] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="text-3xl"
                                            >
                                                ✨
                                            </motion.div>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section with Animated Stats */}
            <section id="benefits" className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl lg:text-6xl font-black mb-4 text-gray-800">
                            Why Choose <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #4db8d4, #3ba5c0)' }}>CareerPilot</span>
                        </h2>
                        <p className="text-xl text-gray-600">Transform your job search with AI-powered advantages</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '🚀',
                                title: '10x Faster Applications',
                                desc: 'Apply to hundreds of jobs in minutes with AI-optimized resumes',
                                stat: '90%',
                                label: 'Time Saved',
                            },
                            {
                                icon: '🎯',
                                title: 'Higher Interview Rate',
                                desc: 'ATS-optimized resumes get 3x more callbacks',
                                stat: '3x',
                                label: 'More Interviews',
                            },
                            {
                                icon: '💪',
                                title: 'Confident Interviews',
                                desc: 'Practice with AI until you\'re interview-ready',
                                stat: '95%',
                                label: 'Confidence Boost',
                            },
                            {
                                icon: '💼',
                                title: 'Perfect Job Matches',
                                desc: 'AI finds opportunities aligned with your goals',
                                stat: '85%',
                                label: 'Match Accuracy',
                            },
                            {
                                icon: '📊',
                                title: 'Data-Driven Insights',
                                desc: 'Make informed decisions with market analytics',
                                stat: '100%',
                                label: 'Transparency',
                            },
                            {
                                icon: '🌟',
                                title: '24/7 AI Support',
                                desc: 'Get help anytime with our intelligent assistant',
                                stat: '24/7',
                                label: 'Availability',
                            },
                        ].map((benefit, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(77, 184, 212, 0.25)' }}
                                className="bg-linear-to-br from-white to-gray-50 p-8 rounded-3xl border-2 cursor-pointer transition-all"
                                style={{ borderColor: 'rgba(77, 184, 212, 0.25)' }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                    className="text-5xl mb-4"
                                >
                                    {benefit.icon}
                                </motion.div>
                                <div className="text-4xl font-black mb-2" style={{ color: '#4db8d4' }}>
                                    {benefit.stat}
                                </div>
                                <div className="text-sm font-semibold mb-3" style={{ color: '#3ba5c0' }}>
                                    {benefit.label}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-800">{benefit.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{benefit.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 bg-linear-to-br from-gray-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl font-black mb-4 text-gray-800">Powerful Features</h2>
                        <p className="text-xl text-gray-600">Everything you need to accelerate your career</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '📄',
                                title: 'AI Resume Builder',
                                desc: 'Create ATS-optimized resumes tailored for each job application',
                            },
                            {
                                icon: '🎤',
                                title: 'Interview Coach',
                                desc: 'Practice with AI for HR, technical, and behavioral interviews',
                            },
                            {
                                icon: '🔍',
                                title: 'Smart Job Search',
                                desc: 'Find and apply to relevant jobs with intelligent matching',
                            },
                            {
                                icon: '📈',
                                title: 'Skill Gap Analysis',
                                desc: 'Identify skills to learn for your target role',
                            },
                            {
                                icon: '💰',
                                title: 'Salary Insights',
                                desc: 'Get market data and negotiation strategies',
                            },
                            {
                                icon: '🔗',
                                title: 'LinkedIn Sync',
                                desc: 'Import profile and sync opportunities seamlessly',
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -8, borderColor: '#4db8d4' }}
                                className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100 cursor-pointer transition-all"
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
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 8, repeat: Infinity }}
                        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl"
                        style={{ background: '#4db8d4' }}
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl"
                        style={{ background: '#3ba5c0' }}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="max-w-5xl mx-auto relative z-10"
                >
                    <div className="rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl backdrop-blur-xl border-2"
                        style={{
                            backgroundImage: 'linear-gradient(135deg, #4db8d4 0%, #3ba5c0 50%, #2a93a8 100%)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        }}>
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            className="inline-block text-6xl mb-6"
                        >
                            🚀
                        </motion.div>
                        <h2 className="text-4xl md:text-6xl font-black mb-6">
                            Ready to Transform Your Career?
                        </h2>
                        <p className="text-xl md:text-2xl mb-10 opacity-95 max-w-3xl mx-auto">
                            Join <span className="font-bold">10,000+ professionals</span> who've accelerated their job search with AI.
                            Get started free today—no credit card required.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link href="/register">
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-10 py-5 bg-white text-[#4db8d4] rounded-2xl text-lg font-black transition shadow-xl"
                                >
                                    Start Free Today →
                                </motion.button>
                            </Link>
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                whileTap={{ scale: 0.95 }}
                                className="px-10 py-5 text-white rounded-2xl text-lg font-bold border-2 border-white transition"
                            >
                                📞 Book a Demo
                            </motion.button>
                        </div>
                        <div className="mt-8 flex items-center justify-center gap-6 text-sm opacity-90">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">✓</span>
                                <span>Free Forever Plan</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">✓</span>
                                <span>No Credit Card</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">✓</span>
                                <span>Cancel Anytime</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-16 px-6 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                                    <img src="/Logo.png" alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <span className="text-xl font-black bg-clip-text text-transparent"
                                    style={{ backgroundImage: 'linear-gradient(to right, #4db8d4, #3ba5c0)' }}>
                                    CareerPilot
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                AI-powered platform to accelerate your career and land your dream job.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="#features" className="hover:text-[#4db8d4] transition">Features</Link></li>
                                <li><Link href="#timeline" className="hover:text-[#4db8d4] transition">How It Works</Link></li>
                                <li><Link href="#benefits" className="hover:text-[#4db8d4] transition">Benefits</Link></li>
                                <li><Link href="/register" className="hover:text-[#4db8d4] transition">Pricing</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-[#4db8d4] transition">About Us</a></li>
                                <li><a href="#" className="hover:text-[#4db8d4] transition">Careers</a></li>
                                <li><a href="#" className="hover:text-[#4db8d4] transition">Blog</a></li>
                                <li><a href="#" className="hover:text-[#4db8d4] transition">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-[#4db8d4] transition">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-[#4db8d4] transition">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-[#4db8d4] transition">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm">&copy; 2025 CareerPilot. All rights reserved.</p>
                        <div className="flex gap-4">
                            <motion.a whileHover={{ scale: 1.2, color: '#4db8d4' }} href="#" className="text-gray-400 text-2xl">
                                📧
                            </motion.a>
                            <motion.a whileHover={{ scale: 1.2, color: '#4db8d4' }} href="#" className="text-gray-400 text-2xl">
                                🔗
                            </motion.a>
                            <motion.a whileHover={{ scale: 1.2, color: '#4db8d4' }} href="#" className="text-gray-400 text-2xl">
                                🐦
                            </motion.a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
