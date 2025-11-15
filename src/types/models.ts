import type { Types } from "mongoose";

export interface User {
    _id: Types.ObjectId;
    email: string;
    passwordHash: string;
    name: string;
    linkedinId?: string;
    linkedinProfileUrl?: string;
    isLinkedinLinked?: boolean;
    role?: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
}

export interface UserProfile {
    _id: Types.ObjectId;
    userId: Types.ObjectId;

    // Basic Info
    headline?: string;
    about?: string;
    phone?: string;
    location?: string;
    skills: string[];
    experienceYears?: number;
    experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
    currentRole?: string;
    targetRoles: string[];
    locations: string[];

    // Links
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    personalWebsite?: string;

    // Detailed Work Experience
    experience?: Array<{
        title: string;
        company: string;
        location?: string;
        startDate: string; // e.g., "Jan 2020" or "2020-01"
        endDate?: string; // e.g., "Present" or "Dec 2023"
        current?: boolean;
        description: string[]; // Array of bullet points
        technologies?: string[];
        achievements?: string[];
    }>;

    // Education
    education?: Array<{
        degree: string;
        institution: string;
        location?: string;
        graduationDate: string; // e.g., "May 2019" or "2019"
        gpa?: string;
        honors?: string[]; // Dean's List, Cum Laude, etc.
        relevantCoursework?: string[];
        activities?: string[]; // Clubs, organizations, etc.
    }>;

    // Projects
    projects?: Array<{
        name: string;
        description: string;
        role?: string;
        startDate?: string;
        endDate?: string;
        technologies?: string[];
        link?: string;
        githubUrl?: string;
        achievements?: string[];
    }>;

    // Certifications & Licenses
    certifications?: Array<{
        name: string;
        issuer: string;
        date: string;
        expiryDate?: string;
        credentialId?: string;
        credentialUrl?: string;
    }>;

    // Awards & Recognition
    awards?: Array<{
        title: string;
        issuer: string;
        date: string;
        description?: string;
    }>;

    // Publications
    publications?: Array<{
        title: string;
        publisher: string;
        date: string;
        url?: string;
        coAuthors?: string[];
    }>;

    // Languages
    languages?: Array<{
        name: string;
        proficiency: 'native' | 'fluent' | 'professional' | 'intermediate' | 'basic';
    }>;

    // Volunteer Work
    volunteer?: Array<{
        role: string;
        organization: string;
        startDate?: string;
        endDate?: string;
        description?: string;
    }>;

    // Professional Summary/Objective
    professionalSummary?: string;
    careerObjective?: string;

    salaryExpectation?: {
        currency: string;
        min?: number;
        max?: number;
    };
    preferences?: {
        remote?: boolean;
        hybrid?: boolean;
        onsite?: boolean;
        industries?: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface ResumeVersion {
    versionNumber: number;
    content: string;
    atsScore?: number;
    changes?: string;
    createdAt: Date;
}

export interface Resume {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    title: string;
    rawText: string;
    structuredData?: Record<string, unknown>;
    isPrimary: boolean;
    templateType?: string;
    atsScore?: number;
    atsAnalysis?: {
        score: number;
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
        keywordMatches?: string[];
    };
    versions?: ResumeVersion[];
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Job {
    _id: Types.ObjectId;
    externalId?: string;
    provider?: string;
    title: string;
    company: string;
    location?: string;
    remote?: boolean;
    postedAt?: Date;
    salaryRange?: {
        currency?: string;
        min?: number;
        max?: number;
    };
    url?: string;
    source?: string;
    rawData?: Record<string, unknown>;
    createdAt: Date;
}

export type ApplicationStatus =
    | "draft"
    | "applied"
    | "viewed"
    | "interview"
    | "rejected"
    | "offer";

export interface Application {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    jobId: Types.ObjectId;
    status: ApplicationStatus;
    tailoredResumeId?: Types.ObjectId;
    coverLetter?: string;
    appliedAt?: Date;
    source?: string;
    notes?: string;
    lastStatusChangeAt?: Date;
    viaN8n?: boolean;
}

export interface SkillGapAnalysis {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    targetRole: string;
    matchPercent: number;
    missingSkills: string[];
    outdatedSkills: string[];
    highDemandSkills?: string[];
    generatedFrom?: {
        resumeId?: Types.ObjectId;
        profileSnapshot?: Record<string, unknown>;
    };
    createdAt: Date;
}

export interface LearningPlanItem {
    skill: string;
    description?: string;
    resourceLink?: string;
    resourceTitle?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
    estimatedHours?: number;
    status: "not-started" | "in-progress" | "completed";
    weekNumber?: number;
}

export interface LearningPlan {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    items: LearningPlanItem[];
    overallStatus?: "not-started" | "in-progress" | "completed";
    createdAt: Date;
    updatedAt: Date;
}

export interface InterviewQuestion {
    question: string;
    followUp?: string;
}

export interface InterviewAnswer {
    questionIndex: number;
    transcript: string;
    score?: number;
    feedback?: string;
}

export interface InterviewSession {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    role?: string;
    mode: "hr" | "technical" | "behavioral";
    questions: InterviewQuestion[];
    answers: InterviewAnswer[];
    overallScore?: number;
    startedAt: Date;
    completedAt?: Date;
    viaVoice?: boolean;
}

export interface ActivityLog {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    type:
    | "login"
    | "signup"
    | "application_created"
    | "application_status_changed"
    | "resume_uploaded"
    | "interview_started"
    | "interview_completed"
    | "learning_plan_generated";
    meta?: Record<string, unknown>;
    createdAt: Date;
}

export interface IntegrationToken {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    provider: "linkedin" | "n8n" | "github" | string;
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
