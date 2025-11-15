import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/src/server/db/mongoClient';
import { ResumeModel } from '@/src/server/db/models';
import { getUserFromToken } from '@/src/server/services/authService';
import { getUserProfile } from '@/src/server/services/profileService';
import { generateResumeWithUseResume, convertProfileToUseResumeFormat } from '@/src/server/integrations/useresumeClient';
import { generateText } from '@/src/server/integrations/geminiClient';

const generateSchema = z.object({
    template: z.enum(['harvard', 'modern', 'minimalist', 'creative']),
    targetRole: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { template, targetRole } = generateSchema.parse(body);

        await connectToDatabase();

        // Get user profile
        const profile = await getUserProfile(user.userId);
        if (!profile) {
            return NextResponse.json({ error: 'Please complete your profile first' }, { status: 400 });
        }

        // Step 1: Use Gemini to expand profile into detailed 2-page resume content
        console.log('[CV Generation] Step 1: Expanding profile with Gemini AI...');

        const p = profile as any;
        const profileSummary = `
Name: ${user.name}
Email: ${user.email}
Phone: ${p.phone || 'Not provided'}
Location: ${p.location || p.locations?.[0] || 'Not provided'}

Professional Summary: ${p.professionalSummary || p.about || 'Not provided'}
Headline: ${p.headline || 'Not provided'}
Career Objective: ${p.careerObjective || 'Not provided'}

Experience Level: ${p.experienceLevel || 'Not provided'}
Years of Experience: ${p.experienceYears || 'Not provided'}
Current Role: ${p.currentRole || 'Not provided'}
Target Roles: ${p.targetRoles?.join(', ') || targetRole || 'Not provided'}

Skills: ${p.skills?.join(', ') || 'Not provided'}

Work Experience:
${p.experience?.map((exp: any, idx: number) => `
${idx + 1}. ${exp.title} at ${exp.company}
   Location: ${exp.location || 'Not specified'}
   Duration: ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'Not specified'}
   Responsibilities/Achievements:
   ${exp.description?.map((d: string) => `   - ${d}`).join('\\n') || '   - Not provided'}
   ${exp.achievements?.length ? `   Key Achievements:\\n   ${exp.achievements.map((a: string) => `   - ${a}`).join('\\n')}` : ''}
   ${exp.technologies?.length ? `   Technologies: ${exp.technologies.join(', ')}` : ''}
`).join('\\n') || 'Not provided'}

Education:
${p.education?.map((edu: any, idx: number) => `
${idx + 1}. ${edu.degree} from ${edu.institution}
   Location: ${edu.location || 'Not specified'}
   Graduation: ${edu.graduationDate}
   ${edu.gpa ? `GPA: ${edu.gpa}` : ''}
   ${edu.honors?.length ? `Honors: ${edu.honors.join(', ')}` : ''}
   ${edu.relevantCoursework?.length ? `Relevant Coursework: ${edu.relevantCoursework.join(', ')}` : ''}
   ${edu.activities?.length ? `Activities: ${edu.activities.join(', ')}` : ''}
`).join('\\n') || 'Not provided'}

Projects:
${p.projects?.map((proj: any, idx: number) => `
${idx + 1}. ${proj.name}
   Role: ${proj.role || 'Not specified'}
   Duration: ${proj.startDate ? `${proj.startDate} - ${proj.endDate || 'Present'}` : 'Not specified'}
   Description: ${proj.description}
   ${proj.technologies?.length ? `Technologies: ${proj.technologies.join(', ')}` : ''}
   ${proj.achievements?.length ? `Achievements:\\n   ${proj.achievements.map((a: string) => `- ${a}`).join('\\n   ')}` : ''}
   ${proj.link ? `Link: ${proj.link}` : ''}
   ${proj.githubUrl ? `GitHub: ${proj.githubUrl}` : ''}
`).join('\\n') || 'Not provided'}

Certifications:
${p.certifications?.map((cert: any, idx: number) => `
${idx + 1}. ${cert.name} - ${cert.issuer}
   Date: ${cert.date}
   ${cert.expiryDate ? `Expires: ${cert.expiryDate}` : ''}
   ${cert.credentialId ? `Credential ID: ${cert.credentialId}` : ''}
   ${cert.credentialUrl ? `URL: ${cert.credentialUrl}` : ''}
`).join('\\n') || 'Not provided'}

Awards & Recognition:
${p.awards?.map((award: any) => `- ${award.title} - ${award.issuer} (${award.date})${award.description ? ': ' + award.description : ''}`).join('\\n') || 'Not provided'}

Publications:
${p.publications?.map((pub: any) => `- ${pub.title} - ${pub.publisher} (${pub.date})${pub.url ? ' - ' + pub.url : ''}${pub.coAuthors?.length ? ' (Co-authors: ' + pub.coAuthors.join(', ') + ')' : ''}`).join('\\n') || 'Not provided'}

Languages:
${p.languages?.map((lang: any) => `- ${lang.name}: ${lang.proficiency}`).join('\\n') || 'Not provided'}

Volunteer Experience:
${p.volunteer?.map((vol: any) => `- ${vol.role} at ${vol.organization}${vol.startDate ? ` (${vol.startDate} - ${vol.endDate || 'Present'})` : ''}${vol.description ? ': ' + vol.description : ''}`).join('\\n') || 'Not provided'}

Links:
- LinkedIn: ${p.linkedinUrl || 'Not provided'}
- GitHub: ${p.githubUrl || 'Not provided'}
- Portfolio: ${p.portfolioUrl || 'Not provided'}
- Personal Website: ${p.personalWebsite || 'Not provided'}
`.trim();

        const templateInstructions = {
            harvard: 'Harvard Business School style: conservative, achievement-focused, quantified results, traditional formatting',
            modern: 'Modern style: clean design, visual hierarchy, contemporary language, skills-forward approach',
            minimalist: 'Minimalist style: clean lines, ample white space, concise language, essential information only',
            creative: 'Creative style: unique layout, personality-driven, innovative presentation, storytelling approach'
        };

        let expandedResumeText;
        try {
            const geminiPrompt = `Write a comprehensive, detailed, fully-formatted ${template.toUpperCase()}-style professional resume using this profile data. The resume must be EXACTLY 2 pages long (minimum 800 words, target 1000-1200 words).\n\nProfile Data:\n${profileSummary}\n\nTarget Role: ${targetRole || 'General professional role'}\n\nWrite the complete resume now in plain text format:`;

            const geminiInstructions = `You are an expert resume writer specializing in ${template.toUpperCase()}-style resumes. ${templateInstructions[template]}\n\nCREATE A COMPREHENSIVE 2-PAGE RESUME (1000-1200 words minimum):\n\n1. HEADER: Name (uppercase), contact info (email, phone, location, LinkedIn)\n\n2. PROFESSIONAL SUMMARY (60-80 words): Write a compelling 4-5 sentence summary highlighting key achievements, expertise, and career objectives. Include specific metrics and accomplishments.\n\n3. EXPERIENCE (500-700 words): For EACH role, write:\n   - Company name (uppercase for Harvard), Job Title, Location, Dates\n   - 6-8 detailed bullet points with:\n     * Action verbs (Led, Developed, Achieved, Implemented, Increased)\n     * Quantifiable results ("Increased revenue by 40%", "Managed team of 15")\n     * Technologies, methodologies, and impact\n     * Business outcomes and achievements\n   - Make each bullet 15-25 words long with specific details\n\n4. EDUCATION (100-150 words): For EACH degree:\n   - Institution (uppercase for Harvard), Degree, Location, Graduation Date\n   - GPA if 3.5+\n   - 4-6 bullet points: Relevant coursework, honors, academic projects, leadership roles, clubs\n\n5. SKILLS (100-120 words): Organize 25-35 skills by categories:\n   - Technical Skills: (list 12-15 specific technologies/tools)\n   - Leadership & Management: (list 5-7 competencies)\n   - Languages: (list with proficiency levels)\n   - Tools & Platforms: (list 8-10 tools)\n\n6. PROJECTS (150-200 words): Include 3-4 detailed projects:\n   - Project name, duration, role\n   - 3-4 bullet points describing scope, technologies, outcomes, metrics\n   - Include links if applicable\n\n7. CERTIFICATIONS (50-80 words): List 3-5 certifications with:\n   - Full certification name, Issuing organization, Date obtained\n   - Credential ID or license number if applicable\n\n8. ADDITIONAL SECTIONS if space allows (50-100 words):\n   - Publications, Speaking engagements, Volunteer work, Professional affiliations, Awards\n\nFORMATTING RULES:\n- Use clear section headers (all caps for Harvard style)\n- Use bullet points (•) for lists\n- Right-align dates for Harvard style using spaces\n- Each section should be substantial and detailed\n- NO explanations, NO markdown formatting, NO JSON\n- Output ONLY the formatted resume text\n- MINIMUM 800 words, TARGET 1000-1200 words\n\nWrite the complete, detailed resume now:`;

            expandedResumeText = await generateText(geminiPrompt, geminiInstructions);

            const wordCount = expandedResumeText.split(/\s+/).length;
            const charCount = expandedResumeText.length;

            console.log('[CV Generation] Gemini expanded resume:', {
                wordCount,
                charCount,
                estimatedPages: Math.ceil(wordCount / 500),
                firstLine: expandedResumeText.split('\n')[0],
                previewStart: expandedResumeText.substring(0, 200) + '...',
            });

            // Validate minimum length
            if (wordCount < 400) {
                console.warn('[CV Generation] Resume too short, word count:', wordCount);
                throw new Error(`Resume is too short (${wordCount} words). Minimum 800 words required.`);
            }

            console.log('[CV Generation] ✓ Gemini expanded plain text resume successfully');
        } catch (geminiError) {
            console.error('[CV Generation] Gemini expansion failed:', geminiError);
            // Fallback to basic conversion
            const fallbackData = convertProfileToUseResumeFormat({
                user,
                profile: profile as any,
                targetRole,
            });
            // Format fallback data as text
            expandedResumeText = JSON.stringify(fallbackData, null, 2);
            console.warn('[CV Generation] Using fallback content');
        }

        // Pass the expanded plain text to UseResume.ai for final formatting
        const useResumeData = {
            rawText: expandedResumeText,
            template,
            templateInstructions: templateInstructions[template],
        };

        // Logging for debugging
        console.log('[CV Generation] Step 2: Passing expanded data to UseResume.ai...');
        console.log('[UseResume CV Generation] Request:', {
            userId: user.userId,
            template,
            targetRole,
            rawTextLength: useResumeData.rawText?.length || 0,
            rawTextWordCount: useResumeData.rawText?.split(/\s+/).length || 0,
            rawTextPreview: useResumeData.rawText?.substring(0, 150) + '...',
        });

        let cvContent;
        let apiWarning = '';

        try {
            // Generate professional CV with UseResume.ai API
            const result = await generateResumeWithUseResume(useResumeData);
            cvContent = result.content;

            // If API call failed but we got fallback content
            if (!result.success) {
                apiWarning = result.error || 'Used fallback resume generation';
                console.warn('[UseResume CV Generation] Using fallback:', apiWarning);
            }
        } catch (apiError: any) {
            console.error('[UseResume CV Generation] API error:', apiError);
            // Surface API error to frontend
            return NextResponse.json({
                error: 'UseResume API error',
                details: apiError?.message || apiError,
            }, { status: 502 });
        }

        // Save generated CV
        const resume = await ResumeModel.create({
            userId: user.userId,
            title: `Generated CV - ${template} (${new Date().toLocaleDateString()})`,
            rawText: cvContent,
            structuredData: {
                template,
                generatedAt: new Date(),
                targetRole,
            },
            isPrimary: false,
        });

        console.log('[UseResume CV Generation] Success:', {
            resumeId: resume._id.toString(),
            title: resume.title,
            finalContentLength: cvContent.length,
            finalWordCount: cvContent.split(/\s+/).length,
            contentPreview: cvContent.substring(0, 200) + '...',
        });

        return NextResponse.json({
            success: true,
            resume: {
                id: resume._id.toString(),
                title: resume.title,
                content: cvContent,
                createdAt: resume.createdAt,
            },
            ...(apiWarning && { warning: apiWarning }),
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }

        console.error('[UseResume CV Generation] Route error:', error);
        return NextResponse.json({ error: 'Failed to generate CV', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
