'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const errorParam = searchParams?.get('error');
        if (errorParam) {
            setError(decodeURIComponent(errorParam));
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            // Store token in localStorage
            if (data.token) {
                localStorage.setItem('auth_token', data.token);
            }

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-cyan-50 via-white to-blue-50 px-6">
            {/* Background Animated Circles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, 20, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 5 + i * 2,
                            repeat: Infinity,
                            delay: i * 0.5,
                        }}
                        className="absolute rounded-full"
                        style={{
                            background: 'rgba(101, 202, 225, 0.15)',
                            width: `${100 + i * 50}px`,
                            height: `${100 + i * 50}px`,
                            left: `${i * 20}%`,
                            top: `${i * 15}%`,
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-3xl p-10 max-w-md w-full relative z-10 border-2"
                style={{ borderColor: 'rgba(101, 202, 225, 0.3)', boxShadow: '0 20px 60px rgba(101, 202, 225, 0.2)' }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent mb-2"
                        style={{ backgroundImage: 'linear-gradient(to right, #65cae1, #4db8d4)' }}>
                        CareerPilot
                    </h1>
                    <p className="text-gray-600">Your AI Career Operating System</p>
                </motion.div>

                <div className="flex mb-8 rounded-full p-1" style={{ background: 'rgba(101, 202, 225, 0.1)' }}>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsLogin(true)}
                        className="flex-1 py-2 rounded-full font-semibold transition text-white"
                        style={isLogin ? { backgroundImage: 'linear-gradient(to right, #65cae1, #4db8d4)', boxShadow: '0 4px 12px rgba(101, 202, 225, 0.3)' } : { color: '#6b7280', background: 'transparent' }}
                    >
                        Login
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsLogin(false)}
                        className="flex-1 py-2 rounded-full font-semibold transition text-white"
                        style={!isLogin ? { backgroundImage: 'linear-gradient(to right, #65cae1, #4db8d4)', boxShadow: '0 4px 12px rgba(101, 202, 225, 0.3)' } : { color: '#6b7280', background: 'transparent' }}
                    >
                        Register
                    </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {!isLogin && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(101, 202, 225, 0.3)', '--tw-ring-color': '#65cae1' } as any}
                                    placeholder="John Doe"
                                    required={!isLogin}
                                />
                            </div>
                        )}
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition"
                            style={{ borderColor: 'rgba(101, 202, 225, 0.3)', '--tw-ring-color': '#65cae1' } as any}
                            placeholder="you@example.com"
                            required
                        />
                    </motion.div>

                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition"
                            style={{ borderColor: 'rgba(101, 202, 225, 0.3)', '--tw-ring-color': '#65cae1' } as any}
                            placeholder="••••••••"
                            required
                        />
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 15px 35px rgba(101, 202, 225, 0.4)' }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 text-white rounded-xl font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundImage: 'linear-gradient(to right, #65cae1, #4db8d4)', boxShadow: '0 8px 20px rgba(101, 202, 225, 0.3)' }}
                    >
                        {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </motion.button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-semibold hover:underline"
                            style={{ color: '#65cae1' }}
                        >
                            {isLogin ? 'Register' : 'Login'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
