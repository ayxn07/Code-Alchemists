import { NextResponse } from "next/server";

/**
 * Test endpoint to verify LinkedIn configuration
 * Visit: http://localhost:3000/api/test-linkedin
 */
export async function GET() {
    const config = {
        clientId: process.env.LINKEDIN_CLIENT_ID || 'NOT_SET',
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET ? '***SET***' : 'NOT_SET',
        redirectUri: process.env.LINKEDIN_REDIRECT_URI || 'NOT_SET',
        publicClientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || 'NOT_SET',
        publicRedirectUri: process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI || 'NOT_SET',
    };

    const instructions = {
        message: 'LinkedIn OAuth Configuration Test',
        status: 'Configuration loaded',
        config,
        nextSteps: [
            '1. Go to https://www.linkedin.com/developers/apps',
            '2. Select your app (or create new app)',
            '3. Click "Auth" tab',
            '4. Under "Authorized redirect URLs for your app", add EXACTLY this URL:',
            `   ${config.redirectUri}`,
            '5. Click "Update" to save',
            '6. Under "Products" tab, enable "Sign In with LinkedIn using OpenID Connect"',
            '7. Wait for approval (usually instant)',
            '8. Return to http://localhost:3000/login and test',
        ],
        testUrl: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${config.publicClientId}&redirect_uri=${encodeURIComponent(config.publicRedirectUri)}&scope=openid%20profile%20email&state=test123`,
        warning: 'If redirect_uri does not match error persists, the URL in LinkedIn console must EXACTLY match the redirectUri shown above (including http:// and port :3000)',
    };

    return NextResponse.json(instructions, { status: 200 });
}
