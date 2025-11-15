import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { getUserFromToken } from '@/src/server/services/authService';
import { getUserProfile, updateUserProfile } from '@/src/server/services/profileService';
import { activityLogRepository } from '@/src/server/repositories/activityLogRepository';

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
                locations: p.locations,
                salaryExpectation: p.salaryExpectation,
                preferences: p.preferences,
                experienceLevel: p.experienceLevel,
                availability: p.availability,
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

        // Log profile update activity
        try {
            await activityLogRepository.logActivity(user.userId, 'login', {
                action: 'profile_updated',
                headline: body.headline,
                skillsCount: body.skills?.length || 0,
            });
        } catch (err) {
            console.error('Failed to log profile update activity:', err);
        }

        return NextResponse.json({
            success: true,
            profile: {
                id: p._id?.toString(),
                headline: p.headline,
                about: p.about,
                skills: p.skills,
                targetRoles: p.targetRoles,
                locations: p.locations,
                salaryExpectation: p.salaryExpectation,
                preferences: p.preferences,
                experienceLevel: p.experienceLevel,
                availability: p.availability,
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
