'use client';

import { useEffect, useState } from 'react';

export default function DiagnosticPage() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/test-linkedin')
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load config:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading configuration...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">LinkedIn OAuth Diagnostic</h1>
                    <p className="text-gray-600 mb-6">Use this page to verify your LinkedIn configuration</p>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <div className="flex">
                            <div className="shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    <strong>Action Required:</strong> You must add the redirect URI below to your LinkedIn Developer Console
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Configuration</h2>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div>
                                    <span className="font-medium text-gray-700">Client ID:</span>
                                    <code className="ml-2 bg-white px-2 py-1 rounded text-sm">{config?.config?.clientId}</code>
                                    <span className={`ml-2 ${config?.config?.clientId !== 'NOT_SET' ? 'text-green-600' : 'text-red-600'}`}>
                                        {config?.config?.clientId !== 'NOT_SET' ? '✓ Set' : '✗ Not Set'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Client Secret:</span>
                                    <code className="ml-2 bg-white px-2 py-1 rounded text-sm">{config?.config?.clientSecret}</code>
                                    <span className={`ml-2 ${config?.config?.clientSecret === '***SET***' ? 'text-green-600' : 'text-red-600'}`}>
                                        {config?.config?.clientSecret === '***SET***' ? '✓ Set' : '✗ Not Set'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Redirect URI (Server):</span>
                                    <code className="ml-2 bg-white px-2 py-1 rounded text-sm">{config?.config?.redirectUri}</code>
                                    <span className={`ml-2 ${config?.config?.redirectUri !== 'NOT_SET' ? 'text-green-600' : 'text-red-600'}`}>
                                        {config?.config?.redirectUri !== 'NOT_SET' ? '✓ Set' : '✗ Not Set'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Redirect URI (Client):</span>
                                    <code className="ml-2 bg-white px-2 py-1 rounded text-sm">{config?.config?.publicRedirectUri}</code>
                                    <span className={`ml-2 ${config?.config?.publicRedirectUri !== 'NOT_SET' ? 'text-green-600' : 'text-red-600'}`}>
                                        {config?.config?.publicRedirectUri !== 'NOT_SET' ? '✓ Set' : '✗ Not Set'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Add This URL to LinkedIn</h2>
                            <p className="text-gray-700 mb-4">Copy this exact URL and add it to your LinkedIn Developer Console:</p>
                            <div className="bg-white border-2 border-blue-400 rounded p-4 mb-4">
                                <code className="text-lg font-mono text-blue-700 break-all">{config?.config?.redirectUri}</code>
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(config?.config?.redirectUri);
                                    alert('Copied to clipboard!');
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                            >
                                📋 Copy to Clipboard
                            </button>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">📝 Step-by-Step Instructions</h2>
                            <ol className="space-y-3 text-gray-700">
                                {config?.nextSteps?.map((step: string, index: number) => (
                                    <li key={index} className="flex">
                                        <span className="shrink-0 w-6 font-semibold text-blue-600">{index + 1}.</span>
                                        <span className="flex-1">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">🧪 Test Authorization</h2>
                            <p className="text-gray-700 mb-4">After adding the redirect URI to LinkedIn, test the OAuth flow:</p>
                            <div className="space-y-3">
                                <a
                                    href={config?.testUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition"
                                >
                                    🔗 Test LinkedIn OAuth (Opens LinkedIn)
                                </a>
                                <p className="text-sm text-gray-600">
                                    Or go to <a href="/login" className="text-blue-600 hover:underline">/login</a> and click "Continue with LinkedIn"
                                </p>
                            </div>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">⚠️ Common Issues</h2>
                            <ul className="space-y-2 text-gray-700">
                                <li>• Make sure the URL matches EXACTLY (including http:// and :3000)</li>
                                <li>• No trailing slash at the end</li>
                                <li>• Use "http" not "https" for localhost</li>
                                <li>• Click "Update" in LinkedIn console after adding URL</li>
                                <li>• Restart your browser if error persists</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
