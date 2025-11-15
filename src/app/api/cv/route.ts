import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { ResumeModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        const resumes = await ResumeModel.find({ userId: user.userId })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            resumes: resumes.map((resume: any) => ({
                _id: resume._id.toString(),
                title: resume.title,
                isPrimary: resume.isPrimary,
                createdAt: resume.createdAt,
                updatedAt: resume.updatedAt,
                tags: resume.tags || [],
                rawText: resume.rawText,
                atsScore: resume.atsScore,
                atsAnalysis: resume.atsAnalysis,
                versions: resume.versions || [],
                hasStructuredData: !!resume.structuredData,
            })),
            primaryResume: resumes.find((r: any) => r.isPrimary) || null,
        });
    } catch (error) {
        console.error('Get CVs error:', error);
        return NextResponse.json({ error: 'Failed to fetch CVs' }, { status: 500 });
    }
}
