'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ChatBot = dynamic(() => import('./ChatBot'), { ssr: false });

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    // Removed settings dropdown state
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    // Helper to close other dropdowns when one is opened
    const handleDropdown = (type: 'notifications' | 'user') => {
        if (type === 'notifications') {
            setShowNotifications((prev) => {
                if (!prev) {
                    setShowUserDropdown(false);
                }
                return !prev;
            });
        } else if (type === 'user') {
            setShowUserDropdown((prev) => {
                if (!prev) {
                    setShowNotifications(false);
                }
                return !prev;
            });
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ email: payload.email, userId: payload.userId });
            } catch (e) {
                console.error('Failed to decode token');
            }
        }
    }, []);

    const menuItems = [
        { label: 'Overview', path: '/dashboard' },
        { label: 'Profile', path: '/dashboard/profile' },
        { label: 'CV Manager', path: '/dashboard/cv' },
        { label: 'Job Search', path: '/dashboard/jobs' },
        { label: 'Skills & Learning', path: '/dashboard/skills' },
        { label: 'Interview Coach', path: '/dashboard/interview' },
        { label: 'Opportunities', path: '/dashboard/opportunities' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/login');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 24
            }
        }
    };

    // Example: fetch notifications dynamically (replace with real API call)
    const [notifications, setNotifications] = useState<any[]>([]);
    useEffect(() => {
        // Simulate async fetch
        setTimeout(() => {
            setNotifications([
                { id: 1, icon: '✅', title: 'Application Submitted', desc: 'Your application for Senior Developer was submitted', time: '2 hours ago', color: 'green' },
                { id: 2, icon: '🎯', title: 'New Job Match', desc: '5 new jobs match your profile', time: '5 hours ago', color: 'blue' },
                { id: 3, icon: '📊', title: 'ATS Score Updated', desc: 'Your resume score improved to 85%', time: '1 day ago', color: 'purple' },
            ]);
        }, 500);
    }, []);

    return (
        <>
            <div className="flex min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-x-hidden">
                {/* Animated Background Orbs */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        style={{ background: 'rgba(101, 202, 225, 0.15)' }}
                        className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, -90, 0],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                        style={{ background: 'rgba(77, 184, 212, 0.15)' }}
                        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            x: [0, 100, 0],
                            y: [0, -100, 0],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ background: 'rgba(101, 202, 225, 0.2)' }}
                        className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full blur-3xl"
                    />
                </div>

                {/* Mobile Menu Button */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="fixed top-4 left-4 z-60 lg:hidden p-3 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-blue-100"
                >
                    <motion.div
                        animate={mobileMenuOpen ? { rotate: 90 } : { rotate: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {mobileMenuOpen ? (
                            <span className="text-2xl">✕</span>
                        ) : (
                            <span className="text-2xl">☰</span>
                        )}
                    </motion.div>
                </motion.button>

                {/* Sidebar */}
                <AnimatePresence>
                    <motion.aside
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={{ borderColor: 'rgba(101, 202, 225, 0.2)' }}
                        className={`fixed left-0 top-0 h-screen w-80 bg-white/90 backdrop-blur-2xl border-r shadow-2xl z-50 flex flex-col overflow-y-auto ${mobileMenuOpen ? 'block' : 'hidden lg:flex'
                            }`}
                    >
                        {/* Logo */}
                        <motion.div
                            className="p-6 border-b border-gradient-to-r from-blue-100/30 to-purple-100/30"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                        >
                            <Link href="/dashboard">
                                <motion.div
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    className="flex items-center gap-3 cursor-pointer"
                                >
                                    <motion.div
                                        className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-lg overflow-hidden"
                                        whileHover={{
                                            boxShadow: '0 10px 40px rgba(59, 130, 246, 0.5)',
                                            rotate: [0, -3, 3, 0]
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <img
                                            src="/Logo.png"
                                            alt="CareerPilot Logo"
                                            className="w-full h-full object-contain"
                                        />
                                    </motion.div>
                                    <div>
                                        <h1 className="text-xl font-black bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #65cae1, #4db8d4)' }}>
                                            CareerPilot
                                        </h1>
                                        <p className="text-xs text-gray-500 font-medium">AI-Powered Platform</p>
                                    </div>
                                </motion.div>
                            </Link>
                        </motion.div> {/* User Profile Card - Compact */}
                        <motion.div
                            className="px-4 py-3"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.02, y: -2, boxShadow: '0 8px 25px rgba(101, 202, 225, 0.4)' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                style={{ backgroundImage: 'linear-gradient(135deg, #65cae1 0%, #4db8d4 50%, #3ba5c0 100%)' }}
                                className="rounded-xl p-3 text-white cursor-pointer shadow-md relative overflow-hidden"
                            >
                                <motion.div
                                    animate={{
                                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                                    }}
                                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-0 bg-linear-to-r from-white/5 via-white/10 to-white/5"
                                    style={{ backgroundSize: '200% 200%' }}
                                />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-lg font-bold border-2 border-white/40 shrink-0 shadow-lg"
                                            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                                            transition={{ type: 'spring', stiffness: 300 }}
                                        >
                                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                                        </motion.div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate text-sm">{user?.email?.split('@')[0] || 'User'}</p>
                                            <p className="text-xs text-white/70 truncate">{user?.email || 'user@example.com'}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Navigation - Takes most of the space */}
                        <motion.nav
                            className="flex-1 px-4 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent min-h-0"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="space-y-2">
                                {menuItems.map((item, i) => {
                                    const isActive = pathname === item.path;

                                    return (
                                        <Link key={item.path + item.label} href={item.path}>
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.04, type: 'spring', stiffness: 200 }}
                                                whileHover={{ x: 6, scale: 1.02, boxShadow: isActive ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.15)' }}
                                                whileTap={{ scale: 0.98 }}
                                                style={isActive ? { backgroundImage: 'linear-gradient(to right, #65cae1, #4db8d4)', boxShadow: '0 4px 12px rgba(101, 202, 225, 0.3)' } : {}}
                                                className={`flex items-center gap-3 px-5 py-4 rounded-xl transition-all cursor-pointer group ${isActive
                                                    ? 'text-white shadow-lg'
                                                    : 'text-gray-700 hover:bg-linear-to-r hover:from-cyan-50 hover:to-blue-50'
                                                    }`}
                                            >
                                                <span className={`font-bold text-base ${isActive ? 'text-white' : 'text-gray-700'}`}>
                                                    {item.label}
                                                </span>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeIndicator"
                                                        className="ml-auto w-2 h-2 bg-white rounded-full"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                    />
                                                )}
                                            </motion.div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.nav>

                        {/* Logout Button - Compact */}
                        <div className="px-4 py-2 border-t shrink-0" style={{ borderColor: 'rgba(101, 202, 225, 0.2)' }}>
                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-base transition"
                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '2px solid rgba(239, 68, 68, 0.3)' }}
                            >
                                <span className="font-bold">Logout</span>
                            </motion.button>
                        </div>
                    </motion.aside>
                </AnimatePresence>

                {/* Mobile Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        />
                    )}
                </AnimatePresence>

                {/* Main Content Area - Responsive margin */}
                <div className="flex-1 lg:ml-80 transition-all duration-300">
                    {/* Top Bar */}
                    <motion.div
                        initial={{ y: -100 }}
                        animate={{ y: 0 }}
                        style={{ borderBottomColor: 'rgba(101, 202, 225, 0.2)' }}
                        className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40 px-6 py-4"
                    >
                        <div className="flex items-center justify-between">
                            <motion.div
                                className="flex items-center gap-4"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">
                                        {menuItems.find(item => item.path === pathname)?.label || 'Dashboard'}
                                    </h2>
                                    <p className="text-xs text-gray-500">Welcome back, {user?.email || 'User'}!</p>
                                </div>
                            </motion.div>
                            <div className="flex items-center gap-3">
                                {/* Notifications */}
                                <div className="relative">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleDropdown('notifications')}
                                        className="relative p-2 text-gray-600 rounded-lg transition"
                                        style={{ '--hover-color': '#65cae1', '--hover-bg': 'rgba(101, 202, 225, 0.1)' } as any}
                                    >
                                        <span className="text-2xl">🔔</span>
                                        {notifications.length > 0 && (
                                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                        )}
                                    </motion.button>
                                    <AnimatePresence>
                                        {showNotifications && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-50"
                                            >
                                                <div className="p-4 text-white" style={{ backgroundImage: 'linear-gradient(to right, #65cae1, #4db8d4)' }}>
                                                    <h3 className="font-bold text-lg">Notifications</h3>
                                                    <p className="text-sm opacity-90">You have {notifications.length} new notification{notifications.length !== 1 ? 's' : ''}</p>
                                                </div>
                                                <div className="max-h-96 overflow-y-auto">
                                                    {notifications.length === 0 ? (
                                                        <div className="p-4 text-center text-gray-400">No new notifications</div>
                                                    ) : notifications.map((notif, i) => (
                                                        <motion.div
                                                            key={notif.id}
                                                            whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                                            className="p-4 border-b border-gray-100 cursor-pointer"
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0`} style={{ backgroundColor: `var(--tw-bg-opacity, 1)`, background: notif.color ? `var(--tw-gradient-from, #${notif.color})` : undefined }}>
                                                                    {notif.icon}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-semibold text-gray-800 text-sm">{notif.title}</p>
                                                                    <p className="text-xs text-gray-600 mt-1">{notif.desc}</p>
                                                                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                                <div className="p-3 bg-gray-50 text-center">
                                                    <button className="text-blue-600 font-semibold text-sm hover:text-blue-700">View All Notifications</button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>



                                {/* User Profile Dropdown */}
                                <div className="relative">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleDropdown('user')}
                                        className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-xl transition"
                                    >
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-md" style={{ backgroundImage: 'linear-gradient(135deg, #65cae1, #4db8d4)' }}>
                                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <motion.span
                                            animate={{ rotate: showUserDropdown ? 180 : 0 }}
                                            className="text-gray-600"
                                        >
                                            ▼
                                        </motion.span>
                                    </motion.button>
                                    <AnimatePresence>
                                        {showUserDropdown && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-50"
                                            >
                                                <div className="p-4 text-white" style={{ backgroundImage: 'linear-gradient(135deg, #65cae1 0%, #4db8d4 50%, #3ba5c0 100%)' }}>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold border-2 border-white/40 shadow-lg">
                                                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-lg">{user?.email?.split('@')[0] || 'User'}</p>
                                                            <p className="text-xs text-white/70">{user?.email || 'user@example.com'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-2">
                                                    <Link href="/dashboard/profile">
                                                        <motion.button
                                                            whileHover={{ x: 4, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                                            onClick={() => setShowUserDropdown(false)}
                                                            className="w-full flex items-center gap-3 p-3 rounded-xl text-left"
                                                        >
                                                            <span className="text-xl">👤</span>
                                                            <div>
                                                                <p className="font-semibold text-gray-800">Edit Profile</p>
                                                                <p className="text-xs text-gray-500">Update your information</p>
                                                            </div>
                                                        </motion.button>
                                                    </Link>
                                                    <div className="my-2 border-t border-gray-200"></div>
                                                    <motion.button
                                                        whileHover={{ x: 4, backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
                                                        onClick={() => {
                                                            setShowUserDropdown(false);
                                                            handleLogout();
                                                        }}
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-red-600"
                                                    >
                                                        <span className="text-xl">🚪</span>
                                                        <div>
                                                            <p className="font-semibold">Logout</p>
                                                            <p className="text-xs text-red-500">Sign out of your account</p>
                                                        </div>
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Page Content */}
                    <motion.main
                        className="p-4 sm:p-6 lg:p-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {children}
                    </motion.main>
                </div>
            </div>

            {/* ChatBot Widget (visible on all pages) */}
            <ChatBot />
        </>
    );
}
