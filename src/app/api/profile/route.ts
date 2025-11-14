import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { getUserFromToken } from '@/src/server/services/authService';
import { getUserProfile, updateUserProfile } from '@/src/server/services/profileService';

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const profile = await getUserProfile(user.userId);

        if (!profile) {
            return NextResponse.json({
                success: true,
                profile: null,
                message: 'No profile found. Please create one.',
            });
        }

        const p = profile as any;
        return NextResponse.json({
            success: true,
            profile: {
                id: p._id?.toString(),
                headline: p.headline,
                about: p.about,
                skills: p.skills,
                targetRoles: p.targetRoles,
                preferredLocations: p.preferredLocations,
                salaryExpectation: p.salaryExpectation,
                experienceLevel: p.experienceLevel,
                availability: p.availability,
                remotePreference: p.remotePreference,
            },
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        await connectToDatabase();
        const profile = await updateUserProfile(user.userId, body);
        const p = profile as any;

        return NextResponse.json({
            success: true,
            profile: {
                id: p._id?.toString(),
                headline: p.headline,
                about: p.about,
                skills: p.skills,
                targetRoles: p.targetRoles,
                preferredLocations: p.preferredLocations,
                salaryExpectation: p.salaryExpectation,
                experienceLevel: p.experienceLevel,
                availability: p.availability,
                remotePreference: p.remotePreference,
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
