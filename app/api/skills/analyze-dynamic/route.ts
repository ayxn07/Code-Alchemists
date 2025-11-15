import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/src/server/services/authService';
import { profileRepository } from '@/src/server/repositories/profileRepository';
import { resumeRepository } from '@/src/server/repositories/resumeRepository';
import { applicationRepository } from '@/src/server/repositories/applicationRepository';
import { skillsRepository } from '@/src/server/repositories/skillsRepository';
import { generateJSON } from '@/src/server/integrations/geminiClient';
import { connectToDatabase } from '@/src/server/db/mongoClient';

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { targetRole, forceRefresh = false } = body;

        // Check for existing analysis in database (cache)
        if (!forceRefresh) {
            const existingAnalysis = await skillsRepository.getLatestAnalysis(user.userId, targetRole);
            if (existingAnalysis) {
                // Return cached analysis if it's less than 7 days old
                const daysSinceAnalysis = (Date.now() - new Date(existingAnalysis.createdAt as Date).getTime()) / (1000 * 60 * 60 * 24);
                if (daysSinceAnalysis < 7) {
                    console.log('[Skills Analyze Dynamic] Returning cached analysis from', daysSinceAnalysis.toFixed(1), 'days ago');
                    return NextResponse.json({
                        success: true,
                        data: existingAnalysis,
                        cached: true,
                        cachedDate: existingAnalysis.createdAt,
                    });
                }
            }
        }

        // Fetch user profile and resumes
        const profile = await profileRepository.getProfileByUserId(user.userId);
        const resumes = await resumeRepository.getUserResumes(user.userId);
        const applications = await applicationRepository.getApplicationsByUser(user.userId, { limit: 10 });

        // If no profile exists, return a helpful message
        if (!profile) {
            return NextResponse.json({
                error: 'Profile not found',
                message: 'Please complete your profile first to get skill analysis',
            }, { status: 404 });
        }

        // Build context for Gemini
        const primaryResume = resumes.find((r) => r.isPrimary) || resumes[0];
        const recentApplications = applications.slice(0, 5);

        const userSkills = profile.skills || [];
        const userTargetRole = targetRole || profile.currentRole || profile.targetRoles?.[0] || 'Software Engineer';

        const context = {
            profile: {
                headline: profile.headline || 'Not specified',
                about: profile.about || 'Not specified',
                currentRole: profile.currentRole || 'Not specified',
                targetRoles: profile.targetRoles || [],
                locations: profile.locations || [],
                skills: userSkills,
                experienceYears: profile.experienceYears || 0,
            },
            resume: primaryResume
                ? {
                    title: primaryResume.title,
                    rawText: primaryResume.rawText,
                    structuredData: primaryResume.structuredData,
                }
                : null,
            recentApplications: recentApplications.map((app: any) => ({
                jobTitle: app.jobId?.title || 'Unknown',
                company: app.jobId?.company || 'Unknown',
                status: app.status,
            })),
            targetRole: userTargetRole,
        };

        console.log('[Skills Analyze Dynamic] Analyzing skills for user:', user.userId);
        console.log('[Skills Analyze Dynamic] User has', userSkills.length, 'skills listed');

        // Prompt Gemini to analyze skills
        const prompt = `Analyze this candidate's profile and provide a skill gap analysis for the target role.

USER PROFILE:
Skills: ${context.profile.skills.join(', ') || 'None listed'}
Current Role: ${context.profile.currentRole || 'Not specified'}
Experience Years: ${context.profile.experienceYears || 'Not specified'}
Target Roles: ${context.profile.targetRoles.join(', ') || context.targetRole}

RESUME SUMMARY:
${context.resume?.rawText?.substring(0, 1000) || 'No resume available'}

RECENT APPLICATIONS:
${context.recentApplications.map(app => `- ${app.jobTitle} at ${app.company} (${app.status})`).join('\n')}

TARGET ROLE: ${context.targetRole}

Provide a comprehensive skill gap analysis as a JSON object with these fields:
- targetRole (string): The target role being analyzed
- matchPercent (number 0-100): Overall match score
- strongSkills (array of 5-10 strings): Skills the candidate has that match the target role
- missingSkills (array of 3-8 strings): Important skills needed for the target role that the candidate lacks
- outdatedSkills (array of 0-4 strings): Skills that are becoming obsolete
- marketDemand (object with high/medium/low arrays): Skill demand categorization
- recommendations (object with priority/timeline/certifications): Actionable advice
- insights (string): 3-4 sentence overall assessment

Base your analysis on current 2025 tech industry trends.`;

        let skillAnalysis;
        try {
            skillAnalysis = await generateJSON(prompt);
            console.log('[Skills Analyze Dynamic] Gemini response received');
        } catch (geminiError) {
            console.error('[Skills Analyze Dynamic] Gemini API error:', geminiError);
            // Return a fallback analysis if Gemini fails
            skillAnalysis = {
                targetRole: context.targetRole,
                matchPercent: 65,
                strongSkills: userSkills.slice(0, 5),
                missingSkills: ['Communication', 'Leadership', 'Project Management'],
                outdatedSkills: [],
                marketDemand: {
                    high: userSkills.slice(0, 3),
                    medium: userSkills.slice(3, 5),
                    low: []
                },
                recommendations: {
                    priority: ['Focus on missing skills', 'Update your resume'],
                    timeline: '3-6 months',
                    certifications: ['Relevant certifications for ' + context.targetRole]
                },
                insights: 'Your profile shows potential for the target role. Focus on developing the missing skills to improve your match score.'
            };
        }

        // Save analysis to database for future caching
        try {
            await skillsRepository.saveAnalysis({
                userId: user.userId,
                targetRole: skillAnalysis.targetRole || context.targetRole,
                matchPercent: skillAnalysis.matchPercent || 0,
                missingSkills: skillAnalysis.missingSkills || [],
                outdatedSkills: skillAnalysis.outdatedSkills || [],
                highDemandSkills: skillAnalysis.marketDemand?.high || [],
                generatedFrom: {
                    resumeId: primaryResume?._id,
                    profileSnapshot: {
                        skills: userSkills,
                        currentRole: profile.currentRole,
                        experienceYears: profile.experienceYears,
                    },
                },
            });
            console.log('[Skills Analyze Dynamic] Analysis saved to database');
        } catch (saveError) {
            console.error('[Skills Analyze Dynamic] Failed to save analysis:', saveError);
            // Continue even if save fails
        }

        return NextResponse.json({
            success: true,
            data: skillAnalysis,
            cached: false,
        });
    } catch (error: unknown) {
        console.error('[Skills Analyze Dynamic] Error:', error);
        const message = error instanceof Error ? error.message : 'Failed to analyze skills';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
