'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/src/app/components/DashboardLayout';

export default function ProfilePage() {
    const [formData, setFormData] = useState({
        headline: '',
        about: '',
        skills: [] as string[],
        targetRoles: [] as string[],
        locations: [] as string[],
        salaryMin: 0,
        salaryMax: 0,
        currency: 'USD',
        remote: true,
        hybrid: false,
        onsite: false,
        industries: [] as string[],
    });

    const [newSkill, setNewSkill] = useState('');
    const [newRole, setNewRole] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.profile) {
                    setFormData({
                        headline: data.profile.headline || '',
                        about: data.profile.about || '',
                        skills: data.profile.skills || [],
                        targetRoles: data.profile.targetRoles || [],
                        locations: data.profile.locations || [],
                        salaryMin: data.profile.salaryExpectation?.min || 0,
                        salaryMax: data.profile.salaryExpectation?.max || 0,
                        currency: data.profile.salaryExpectation?.currency || 'USD',
                        remote: data.profile.preferences?.remote ?? true,
                        hybrid: data.profile.preferences?.hybrid ?? false,
                        onsite: data.profile.preferences?.onsite ?? false,
                        industries: data.profile.preferences?.industries || [],
                    });
                }
            }
        } catch (err: any) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const saveProfile = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    headline: formData.headline,
                    about: formData.about,
                    skills: formData.skills,
                    targetRoles: formData.targetRoles,
                    locations: formData.locations,
                    salaryExpectation: {
                        min: formData.salaryMin,
                        max: formData.salaryMax,
                        currency: formData.currency,
                    },
                    preferences: {
                        remote: formData.remote,
                        hybrid: formData.hybrid,
                        onsite: formData.onsite,
                        industries: formData.industries,
                    },
                }),
            });

            if (response.ok) {
                setSuccess('Profile saved successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to save profile');
            }
        } catch (err: any) {
            setError('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const addSkill = () => {
        if (newSkill && !formData.skills.includes(newSkill)) {
            setFormData({ ...formData, skills: [...formData.skills, newSkill] });
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
    };

    const addTargetRole = () => {
        if (newRole && !formData.targetRoles.includes(newRole)) {
            setFormData({ ...formData, targetRoles: [...formData.targetRoles, newRole] });
            setNewRole('');
        }
    };

    const removeRole = (role: string) => {
        setFormData({ ...formData, targetRoles: formData.targetRoles.filter((r) => r !== role) });
    };

    const addLocation = () => {
        if (newLocation && !formData.locations.includes(newLocation)) {
            setFormData({ ...formData, locations: [...formData.locations, newLocation] });
            setNewLocation('');
        }
    };

    const removeLocation = (location: string) => {
        setFormData({ ...formData, locations: formData.locations.filter((l) => l !== location) });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 15
            }
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                    />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants} className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                        <span className="text-4xl">👤</span>
                        Profile Settings
                    </h1>
                    <p className="text-gray-600">Manage your professional information and preferences</p>
                </motion.div>

                <div className="grid gap-6">
                    {/* Basic Info */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)' }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 transition-shadow"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="text-2xl">💼</span>
                            Basic Information
                        </h2>
                        <div className="space-y-5">
                            <motion.div whileFocus={{ scale: 1.01 }} className="relative">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Professional Headline
                                </label>
                                <motion.input
                                    whileFocus={{ boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                                    type="text"
                                    value={formData.headline}
                                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                                    placeholder="e.g., Full Stack Developer | React & Node.js Expert"
                                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all text-gray-800 bg-gray-50 hover:bg-white"
                                />
                            </motion.div>
                            <motion.div whileFocus={{ scale: 1.01 }}>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">About Me</label>
                                <motion.textarea
                                    whileFocus={{ boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                                    value={formData.about}
                                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                                    rows={5}
                                    placeholder="Tell us about your experience, passion, and what makes you unique..."
                                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all text-gray-800 bg-gray-50 hover:bg-white resize-none"
                                />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Skills */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)' }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 transition-shadow"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="text-2xl">⚡</span>
                            Skills
                        </h2>
                        <div className="flex gap-2 mb-4">
                            <motion.input
                                whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                placeholder="Add a skill (e.g., React, Python, AWS)"
                                className="flex-1 px-5 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all bg-gray-50 hover:bg-white"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={addSkill}
                                className="px-8 py-3 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-blue-600"
                            >
                                Add
                            </motion.button>
                        </div>
                        <AnimatePresence mode="popLayout">
                            <div className="flex flex-wrap gap-2">
                                {formData.skills.map((skill) => (
                                    <motion.span
                                        key={skill}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-5 py-2.5 bg-linear-to-r from-blue-100 to-blue-50 text-blue-700 rounded-full font-semibold cursor-pointer flex items-center gap-2 shadow-md border border-blue-200 hover:shadow-lg transition-all"
                                        onClick={() => removeSkill(skill)}
                                    >
                                        {skill}
                                        <motion.span whileHover={{ rotate: 90 }} className="text-sm font-bold">✕</motion.span>
                                    </motion.span>
                                ))}
                            </div>
                        </AnimatePresence>
                    </motion.div>

                    {/* Target Roles */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)' }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 transition-shadow"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="text-2xl">🎯</span>
                            Target Roles
                        </h2>
                        <div className="flex gap-2 mb-4">
                            <motion.input
                                whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }}
                                type="text"
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addTargetRole()}
                                placeholder="Add a target role (e.g., Senior Frontend Developer)"
                                className="flex-1 px-5 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all bg-gray-50 hover:bg-white"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={addTargetRole}
                                className="px-8 py-3 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-blue-600"
                            >
                                Add
                            </motion.button>
                        </div>
                        <AnimatePresence mode="popLayout">
                            <div className="space-y-3">
                                {formData.targetRoles.map((role) => (
                                    <motion.div
                                        key={role}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: 20, opacity: 0 }}
                                        whileHover={{ x: 5, boxShadow: '0 8px 20px rgba(59, 130, 246, 0.15)' }}
                                        className="flex items-center justify-between p-4 bg-linear-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 transition-all"
                                    >
                                        <span className="font-semibold text-gray-800 flex items-center gap-2">
                                            <span className="text-lg">🎯</span>
                                            {role}
                                        </span>
                                        <motion.button
                                            whileHover={{ scale: 1.2, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => removeRole(role)}
                                            className="text-red-500 hover:text-red-700 font-bold text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50"
                                        >
                                            ✕
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </div>
                        </AnimatePresence>
                    </motion.div>

                    {/* Locations & Preferences */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)' }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 transition-shadow"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="text-2xl">📍</span>
                            Location Preferences
                        </h2>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newLocation}
                                onChange={(e) => setNewLocation(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                                placeholder="Add a location"
                                className="flex-1 px-4 py-2 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={addLocation}
                                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                            >
                                Add
                            </motion.button>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {formData.locations.map((location) => (
                                <motion.span
                                    key={location}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium cursor-pointer flex items-center gap-2"
                                    onClick={() => removeLocation(location)}
                                >
                                    📍 {location}
                                    <span className="text-xs">✕</span>
                                </motion.span>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {['remote', 'hybrid', 'onsite'].map((type) => (
                                <motion.label
                                    key={type}
                                    whileHover={{ scale: 1.02 }}
                                    className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition ${formData[type as keyof typeof formData]
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData[type as keyof typeof formData] as boolean}
                                        onChange={(e) => setFormData({ ...formData, [type]: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="font-medium capitalize">{type}</span>
                                </motion.label>
                            ))}
                        </div>
                    </motion.div>

                    {/* Salary Expectations */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)' }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 transition-shadow"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="text-2xl">💰</span>
                            Salary Expectations
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                <select
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option>USD</option>
                                    <option>EUR</option>
                                    <option>GBP</option>
                                    <option>INR</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum</label>
                                <input
                                    type="number"
                                    value={formData.salaryMin}
                                    onChange={(e) => setFormData({ ...formData, salaryMin: Number(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum</label>
                                <input
                                    type="number"
                                    value={formData.salaryMax}
                                    onChange={(e) => setFormData({ ...formData, salaryMax: Number(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Messages */}
                    <AnimatePresence>
                        {(error || success) && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                className={`p-5 rounded-xl font-semibold flex items-center gap-3 ${error ? 'bg-red-50 text-red-700 border-2 border-red-200' : 'bg-green-50 text-green-700 border-2 border-green-200'
                                    }`}
                            >
                                <span className="text-2xl">{error ? '❌' : '✅'}</span>
                                {error || success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Save Button */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row justify-end gap-4 pt-4"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(107, 114, 128, 0.3)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => loadProfile()}
                            disabled={loading || saving}
                            className="px-8 py-4 bg-linear-to-r from-gray-200 to-gray-300 text-gray-700 rounded-xl font-bold hover:from-gray-300 hover:to-gray-400 disabled:opacity-50 shadow-lg transition-all"
                        >
                            🔄 Reset
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={saveProfile}
                            disabled={loading || saving}
                            className="px-8 py-4 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                    />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    💾 Save Profile
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
