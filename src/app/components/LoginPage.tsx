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
    const [showLinkedInPrompt, setShowLinkedInPrompt] = useState(false);
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

            // After successful login/register, prompt for LinkedIn connection
            setShowLinkedInPrompt(true);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleLinkedInConnect = () => {
        const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
        const redirectUri = process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI;

        // Debug logging
        console.log('LinkedIn OAuth Configuration:');
        console.log('Client ID:', clientId);
        console.log('Redirect URI:', redirectUri);

        if (!clientId || !redirectUri) {
            setError('LinkedIn configuration is missing. Please check environment variables.');
            console.error('Missing LinkedIn configuration!');
            return;
        }

        // Use updated LinkedIn API scopes
        const scope = encodeURIComponent('openid profile email');
        const state = Math.random().toString(36).substring(7);

        const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;

        console.log('Redirecting to LinkedIn with URL:', linkedInAuthUrl);
        console.log('Encoded redirect_uri:', encodeURIComponent(redirectUri));

        window.location.href = linkedInAuthUrl;
    };

    const skipLinkedIn = () => {
        // Redirect to dashboard
        router.push('/dashboard');
    };

    if (showLinkedInPrompt) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50 px-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-blue-100"
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-6xl mb-6"
                    >
                        🔗
                    </motion.div>
                    <h2 className="text-3xl font-bold mb-4 text-gray-800">Connect Your LinkedIn</h2>
                    <p className="text-gray-600 mb-8">
                        To provide you with the best job matches and import your professional profile, please
                        connect your LinkedIn account.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLinkedInConnect}
                        className="w-full py-4 bg-blue-600 text-white rounded-full font-semibold text-lg hover:bg-blue-700 transition shadow-lg mb-4"
                    >
                        Connect LinkedIn Account
                    </motion.button>
                    <button
                        onClick={skipLinkedIn}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                        Skip for now
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50 px-6">
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
                        className="absolute rounded-full bg-blue-200/30"
                        style={{
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
                className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full relative z-10 border border-blue-100"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
                        RapidAI
                    </h1>
                    <p className="text-gray-600">Your AI Career Operating System</p>
                </motion.div>

                <div className="flex mb-8 bg-blue-50 rounded-full p-1">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2 rounded-full font-semibold transition ${isLogin ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600'
                            }`}
                    >
                        Login
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2 rounded-full font-semibold transition ${!isLogin ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600'
                            }`}
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
                                    className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
                            className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
                            className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            placeholder="••••••••"
                            required
                        />
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </motion.button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            {isLogin ? 'Register' : 'Login'}
                        </button>
                    </p>
                </div>

                <div className="mt-8 pt-6 border-t border-blue-100">
                    <p className="text-center text-gray-500 text-sm mb-4">Or continue with</p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLinkedInConnect}
                        className="w-full py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                        </svg>
                        Continue with LinkedIn
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
