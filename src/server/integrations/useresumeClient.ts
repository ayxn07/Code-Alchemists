import { env } from '@/src/config/env';

export interface UseResumeGenerateOptions {
    template?: 'harvard' | 'modern' | 'minimalist' | 'creative';
    templateInstructions?: string;
    rawText?: string; // The fully expanded plain text resume from Gemini
    // The following are only used for fallback formatting
    personalInfo?: {
        name: string;
        email?: string;
        phone?: string;
        location?: string;
        linkedin?: string;
        website?: string;
    };
    summary?: string;
    experience?: Array<{
        title: string;
        company: string;
        location?: string;
        startDate: string;
        endDate?: string;
        current?: boolean;
        description: string[];
    }>;
    education?: Array<{
        degree: string;
        institution: string;
        location?: string;
        graduationDate: string;
        gpa?: string;
        honors?: string[];
    }>;
    skills?: string[];
    projects?: Array<{
        name: string;
        description: string;
        technologies?: string[];
        link?: string;
    }>;
    certifications?: Array<{
        name: string;
        issuer: string;
        date: string;
    }>;
    awards?: string[];
}

export interface UseResumeResponse {
    success: boolean;
    content: string; // Always returns formatted text content
    pdfUrl?: string;
    htmlContent?: string;
    error?: string;
}

/**
 * UseResume.ai API Client
 * Generates professional resumes in various styles (Harvard, Modern, etc.)
 */
export async function generateResumeWithUseResume(
    options: UseResumeGenerateOptions
): Promise<UseResumeResponse> {
    const apiKey = env.useresume.apiKey;

    if (!apiKey) {
        throw new Error('USERESUME_API_KEY is not configured. Please add it to .env.local');
    }

    try {
        // UseResume.ai API endpoint (replace with actual endpoint when available)
        const endpoint = 'https://api.useresume.ai/v1/generate';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                template: options.template || 'harvard',
                rawText: options.rawText, // Pass the expanded plain text resume
                templateInstructions: options.templateInstructions,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `UseResume.ai API error: ${response.status} - ${JSON.stringify(errorData)}`
            );
        }

        const data = await response.json();

        // Prefer UseResume's formatted content, else fallback to Gemini's expanded text, else fallback to local formatting
        const content = data.textContent || data.htmlContent || options.rawText || formatResumeToText(options);

        return {
            success: true,
            content,
            pdfUrl: data.pdfUrl,
            htmlContent: data.htmlContent,
        };
    } catch (error) {
        console.error('UseResume.ai API error:', error);

        // Fallback: Use Gemini's expanded text if available, else local formatting
        const fallbackContent = options.rawText || formatResumeToText(options);

        return {
            success: false,
            content: fallbackContent,
            error: error instanceof Error ? error.message : 'Failed to generate resume',
        };
    }
}

/**
 * Format resume data to professional text (2-page length)
 * Applies proper Harvard, Modern, Minimalist, or Creative formatting
 */
function formatResumeToText(options: UseResumeGenerateOptions): string {
    const sections: string[] = [];
    const template = options.template || 'harvard';

    console.log(`[UseResume Fallback] Formatting resume in ${template} style...`);

    // HEADER - Template-specific formatting
    if (options.personalInfo) {
        if (template === 'harvard') {
            // Harvard: Centered, conservative
            sections.push(options.personalInfo.name.toUpperCase());
            const contactInfo = [
                options.personalInfo.location,
                options.personalInfo.phone && `P: ${options.personalInfo.phone}`,
                options.personalInfo.email,
                options.personalInfo.linkedin,
            ].filter(Boolean).join(' | ');
            sections.push(contactInfo);
            sections.push('');
        } else if (template === 'modern') {
            // Modern: Bold name, left-aligned, email prominent
            sections.push(options.personalInfo.name.toUpperCase());
            sections.push(options.personalInfo.email || '');
            const contactInfo = [
                options.personalInfo.phone,
                options.personalInfo.location,
                options.personalInfo.linkedin,
                options.personalInfo.website,
            ].filter(Boolean).join(' • ');
            sections.push(contactInfo);
            sections.push('');
        } else if (template === 'minimalist') {
            // Minimalist: Clean, essential info only
            sections.push(options.personalInfo.name.toUpperCase());
            sections.push([options.personalInfo.email, options.personalInfo.phone, options.personalInfo.location].filter(Boolean).join(' • '));
            sections.push('');
        } else {
            // Creative: Unique presentation
            sections.push(`${options.personalInfo.name.toUpperCase()}`);
            sections.push(`${options.personalInfo.email || ''} | ${options.personalInfo.phone || ''}`);
            if (options.personalInfo.linkedin) sections.push(options.personalInfo.linkedin);
            sections.push('');
        }
    }

    // SUMMARY - Template-specific section headers
    if (options.summary) {
        const summaryHeaders = {
            harvard: 'SUMMARY',
            modern: 'PROFESSIONAL SUMMARY',
            minimalist: 'SUMMARY',
            creative: 'PROFESSIONAL PROFILE'
        };
        sections.push(summaryHeaders[template as keyof typeof summaryHeaders] || 'SUMMARY');
        sections.push(options.summary);
        sections.push('');
    }

    // EXPERIENCE - Detailed with template-specific formatting
    if (options.experience && options.experience.length > 0) {
        const expHeaders = {
            harvard: 'EXPERIENCE',
            modern: 'PROFESSIONAL EXPERIENCE',
            minimalist: 'EXPERIENCE',
            creative: 'CAREER JOURNEY'
        };
        sections.push(expHeaders[template as keyof typeof expHeaders] || 'EXPERIENCE');

        options.experience.forEach((exp, idx) => {
            if (idx > 0) sections.push(''); // Spacing between entries

            if (template === 'harvard') {
                // Harvard: Company uppercase, dates right-aligned (simulated with spaces)
                sections.push(`${exp.company.toUpperCase()}                    ${exp.location || ''}`);
                sections.push(`${exp.title}                    ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`);
            } else if (template === 'modern') {
                // Modern: Job title prominent
                sections.push(`${exp.title} | ${exp.company}`);
                sections.push(`${exp.location || ''} • ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`);
            } else if (template === 'minimalist') {
                // Minimalist: Concise
                sections.push(`${exp.company} – ${exp.title}`);
                sections.push(`${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`);
            } else {
                // Creative: Unique layout
                sections.push(`${exp.company.toUpperCase()} | ${exp.title}`);
                sections.push(`${exp.location || ''} | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`);
            }

            exp.description.forEach(desc => {
                sections.push(`• ${desc}`);
            });
        });
        sections.push('');
    }

    // EDUCATION - Template-specific formatting
    if (options.education && options.education.length > 0) {
        sections.push('EDUCATION');
        options.education.forEach(edu => {
            if (template === 'harvard') {
                sections.push(`${edu.institution.toUpperCase()}                    ${edu.location || ''}`);
                sections.push(`${edu.degree}                    ${edu.graduationDate}`);
                if (edu.gpa) sections.push(`GPA: ${edu.gpa}`);
            } else if (template === 'modern') {
                sections.push(`${edu.degree} | ${edu.institution}`);
                sections.push(`${edu.location || ''} • Graduated: ${edu.graduationDate}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}`);
            } else {
                sections.push(`${edu.institution} – ${edu.degree}`);
                sections.push(`${edu.graduationDate}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`);
            }

            if (edu.honors && edu.honors.length > 0) {
                edu.honors.forEach(honor => sections.push(`• ${honor}`));
            }
            sections.push('');
        });
    }

    // SKILLS - Template-specific organization
    if (options.skills && options.skills.length > 0) {
        const skillHeaders = {
            harvard: 'SKILLS',
            modern: 'TECHNICAL SKILLS & COMPETENCIES',
            minimalist: 'SKILLS',
            creative: 'EXPERTISE & CAPABILITIES'
        };
        sections.push(skillHeaders[template as keyof typeof skillHeaders] || 'SKILLS');

        // Group skills by line for better formatting
        const skillsPerLine = template === 'minimalist' ? 12 : template === 'harvard' ? 8 : 10;
        for (let i = 0; i < options.skills.length; i += skillsPerLine) {
            const skillGroup = options.skills.slice(i, i + skillsPerLine);
            const separator = template === 'modern' ? ' • ' : ' • ';
            sections.push(skillGroup.join(separator));
        }
        sections.push('');
    }

    // PROJECTS - Template-specific presentation
    if (options.projects && options.projects.length > 0) {
        const projectHeaders = {
            harvard: 'PROJECTS',
            modern: 'KEY PROJECTS',
            minimalist: 'PROJECTS',
            creative: 'KEY PROJECTS & INITIATIVES'
        };
        sections.push(projectHeaders[template as keyof typeof projectHeaders] || 'PROJECTS');

        options.projects.forEach(proj => {
            if (template === 'harvard') {
                sections.push(`${proj.name}                    ${proj.link || ''}`);
                sections.push(`${proj.description}`);
            } else if (template === 'modern') {
                sections.push(`${proj.name}${proj.link ? ` | ${proj.link}` : ''}`);
                sections.push(`${proj.description}`);
            } else {
                sections.push(`${proj.name}`);
                sections.push(`${proj.description}${proj.link ? ` (${proj.link})` : ''}`);
            }

            if (proj.technologies && proj.technologies.length > 0) {
                sections.push(`Technologies: ${proj.technologies.join(', ')}`);
            }
            sections.push('');
        });
    }

    // CERTIFICATIONS - Professional credentials
    if (options.certifications && options.certifications.length > 0) {
        const certHeaders = {
            harvard: 'CERTIFICATIONS & LICENSES',
            modern: 'CERTIFICATIONS',
            minimalist: 'CERTIFICATIONS',
            creative: 'PROFESSIONAL CERTIFICATIONS'
        };
        sections.push(certHeaders[template as keyof typeof certHeaders] || 'CERTIFICATIONS');

        options.certifications.forEach(cert => {
            sections.push(`• ${cert.name} - ${cert.issuer} (${cert.date})`);
        });
        sections.push('');
    }

    // AWARDS & RECOGNITION
    if (options.awards && options.awards.length > 0) {
        const awardHeaders = {
            harvard: 'AWARDS',
            modern: 'HONORS & AWARDS',
            minimalist: 'AWARDS',
            creative: 'RECOGNITION & AWARDS'
        };
        sections.push(awardHeaders[template as keyof typeof awardHeaders] || 'AWARDS');

        options.awards.forEach(award => {
            sections.push(`• ${award}`);
        });
        sections.push('');
    }

    const formattedText = sections.join('\n');
    const estimatedPages = Math.ceil(formattedText.length / 3000);
    const wordCount = formattedText.split(/\\s+/).length;

    console.log(`[UseResume Fallback] Generated ${template} style resume:`);
    console.log(`  - ${formattedText.length} characters`);
    console.log(`  - ~${wordCount} words`);
    console.log(`  - ~${estimatedPages} pages`);

    return formattedText;
}

/**
 * Helper function to convert profile data to UseResume format
 */
export function convertProfileToUseResumeFormat(params: {
    user: any;
    profile: any;
    targetRole?: string;
}): UseResumeGenerateOptions {
    const { user, profile, targetRole } = params;

    return {
        template: 'harvard',
        personalInfo: {
            name: user.name || 'Your Name',
            email: user.email || '',
            phone: profile.phone || '',
            location: profile.locations?.[0] || profile.location || '',
            linkedin: profile.linkedinUrl || '',
            website: profile.portfolioUrl || profile.githubUrl || '',
        },
        summary: profile.about || profile.headline || `${profile.experienceLevel || 'Experienced'} professional seeking ${targetRole || 'opportunities'}`,
        experience: profile.experience || [],
        education: profile.education || [],
        skills: profile.skills || [],
        projects: profile.projects || [],
        certifications: profile.certifications || [],
        awards: profile.awards || [],
    };
}
