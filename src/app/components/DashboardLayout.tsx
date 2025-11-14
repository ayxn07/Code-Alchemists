'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();

    const menuItems = [
        { icon: '📊', label: 'Overview', path: '/dashboard' },
        { icon: '👤', label: 'Profile', path: '/dashboard/profile' },
        { icon: '📄', label: 'CV Manager', path: '/dashboard/cv' },
        { icon: '🔍', label: 'Job Search', path: '/dashboard/jobs' },
        { icon: '📝', label: 'Applications', path: '/dashboard/applications' },
        { icon: '📈', label: 'Skills & Learning', path: '/dashboard/skills' },
        { icon: '🎤', label: 'Interview Coach', path: '/dashboard/interview' },
        { icon: '💰', label: 'Analytics', path: '/dashboard/analytics' },
        { icon: '🌟', label: 'Opportunities', path: '/dashboard/opportunities' },
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50">
            {/* Top Navigation */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/90 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50"
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/dashboard">
                        <motion.h1
                            whileHover={{ scale: 1.05 }}
                            className="text-2xl font-bold bg-linear-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent cursor-pointer"
                        >
                            RapidAI
                        </motion.h1>
                    </Link>
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

            <div className="flex">
                {/* Sidebar */}
                <motion.aside
                    initial={{ x: -300 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-64 min-h-screen bg-white border-r border-blue-100 p-4 hidden lg:block"
                >
                    <nav className="space-y-2">
                        {menuItems.map((item, i) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link key={item.path} href={item.path}>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ x: 5 }}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer ${isActive
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-gray-700 hover:bg-blue-50'
                                            }`}
                                    >
                                        <span className="text-2xl">{item.icon}</span>
                                        <span className="font-medium">{item.label}</span>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </nav>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 p-4 bg-linear-to-r from-blue-600 to-blue-400 rounded-xl text-white"
                    >
                        <p className="text-sm font-medium mb-2">🎯 Job Hunt Twin</p>
                        <p className="text-xs opacity-90 mb-3">Let AI apply to jobs for you</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full py-2 bg-white text-blue-600 rounded-lg font-semibold text-sm"
                        >
                            Activate Twin
                        </motion.button>
                    </motion.div>
                </motion.aside>

                {/* Main Content */}
                <main className="flex-1 p-8">{children}</main>
            </div>
        </div>
    );
}
