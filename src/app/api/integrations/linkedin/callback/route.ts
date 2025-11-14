import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/src/server/db/mongoClient";
import { UserModel } from "@/src/server/db/models";
import { env } from "@/src/config/env";

/**
 * LinkedIn OAuth Callback
 * This endpoint is called by LinkedIn after the user authorizes the app.
 * It receives the authorization code and either:
 * 1. If user is logged in: links the LinkedIn account to their profile
 * 2. If user is not logged in: creates a new account or logs them in
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const error_description = searchParams.get('error_description');
        const state = searchParams.get('state');

        console.log('LinkedIn Callback received:', {
            code: code ? 'Present' : 'Missing',
            error: error || 'None',
            error_description: error_description || 'None',
            state,
            fullUrl: request.url,
        });

        // Check for OAuth errors
        if (error) {
            console.error('LinkedIn OAuth error:', error, error_description);
            return NextResponse.redirect(
                new URL(`/login?error=${encodeURIComponent(error_description || 'LinkedIn authorization failed')}`, request.url)
            );
        }

        if (!code) {
            return NextResponse.redirect(
                new URL('/login?error=missing_code', request.url)
            );
        }

        // Exchange code for access token
        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                client_id: process.env.LINKEDIN_CLIENT_ID!,
                client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
                redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
            }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('LinkedIn token exchange failed:', errorData);
            return NextResponse.redirect(
                new URL(`/login?error=${encodeURIComponent('Failed to connect LinkedIn')}`, request.url)
            );
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Fetch user profile from LinkedIn
        const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!profileResponse.ok) {
            console.error('Failed to fetch LinkedIn profile');
            return NextResponse.redirect(
                new URL('/login?error=profile_fetch_failed', request.url)
            );
        }

        const profileData = await profileResponse.json();

        // Fetch email from LinkedIn
        const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        let email = '';
        if (emailResponse.ok) {
            const emailData = await emailResponse.json();
            email = emailData?.elements?.[0]?.['handle~']?.emailAddress || '';
        }

        const linkedinId = profileData.id as string;
        const name = `${profileData.localizedFirstName || ''} ${profileData.localizedLastName || ''}`.trim() || 'LinkedIn User';

        await connectToDatabase();

        // Try to find an existing user by LinkedIn ID or email
        let user = await UserModel.findOne({ linkedinId });
        if (!user && email) {
            user = await UserModel.findOne({ email });
        }

        if (user) {
            // Ensure LinkedIn linkage fields are set
            user.linkedinId = linkedinId;
            user.isLinkedinLinked = true;
            await user.save();
        } else {
            // Create a new user with a random password to satisfy schema
            const randomPassword = `${linkedinId}-${Date.now()}`;
            const passwordHash = await bcrypt.hash(randomPassword, 10);
            const safeEmail = email || `${linkedinId}@linkedin.local`;

            user = await UserModel.create({
                email: safeEmail,
                passwordHash,
                name,
                linkedinId,
                isLinkedinLinked: true,
            });
        }

        // Issue JWT and set as httpOnly cookie
        const token = jwt.sign(
            { userId: user._id.toString(), email: user.email, isLinkedinLinked: user.isLinkedinLinked },
            env.jwtSecret as string,
            { expiresIn: "7d" }
        );

        const res = NextResponse.redirect(new URL('/dashboard', request.url));
        res.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        return res;

    } catch (error) {
        console.error('LinkedIn callback error:', error);
        return NextResponse.redirect(
            new URL('/login?error=callback_failed', request.url)
        );
    }
}
