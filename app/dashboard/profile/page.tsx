'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '@/src/app/components/DashboardLayout';

export default function ProfilePage() {
    const [formData, setFormData] = useState({
        headline: 'Senior Software Engineer',
        about: 'Passionate developer with 5+ years of experience...',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
        targetRoles: ['Senior Software Engineer', 'Tech Lead', 'Engineering Manager'],
        locations: ['Remote', 'San Francisco', 'New York'],
        salaryMin: 120000,
        salaryMax: 180000,
        currency: 'USD',
        remote: true,
        hybrid: false,
        onsite: false,
        industries: ['Technology', 'FinTech', 'Healthcare'],
    });

    const [newSkill, setNewSkill] = useState('');
    const [newRole, setNewRole] = useState('');
    const [newLocation, setNewLocation] = useState('');

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

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Profile Settings</h1>
                    <p className="text-gray-600">Manage your professional information and preferences</p>
                </div>

                <div className="grid gap-6">
                    {/* Basic Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Professional Headline
                                </label>
                                <input
                                    type="text"
                                    value={formData.headline}
                                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">About Me</label>
                                <textarea
                                    value={formData.about}
                                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Skills */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Skills</h2>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                placeholder="Add a skill"
                                className="flex-1 px-4 py-2 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={addSkill}
                                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                            >
                                Add
                            </motion.button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.skills.map((skill) => (
                                <motion.span
                                    key={skill}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    whileHover={{ scale: 1.05 }}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium cursor-pointer flex items-center gap-2"
                                    onClick={() => removeSkill(skill)}
                                >
                                    {skill}
                                    <span className="text-xs">✕</span>
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Target Roles */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Target Roles</h2>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addTargetRole()}
                                placeholder="Add a target role"
                                className="flex-1 px-4 py-2 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={addTargetRole}
                                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                            >
                                Add
                            </motion.button>
                        </div>
                        <div className="space-y-2">
                            {formData.targetRoles.map((role) => (
                                <motion.div
                                    key={role}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="flex items-center justify-between p-3 bg-blue-50 rounded-xl"
                                >
                                    <span className="font-medium text-gray-800">{role}</span>
                                    <button
                                        onClick={() => removeRole(role)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ✕
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Locations & Preferences */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Location Preferences</h2>
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Salary Expectations</h2>
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

                    {/* Save Button */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex justify-end gap-4"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300"
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg"
                        >
                            Save Profile
                        </motion.button>
                    </motion.div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
