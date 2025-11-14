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
    headline?: string;
    about?: string;
    skills: string[];
    targetRoles: string[];
    locations: string[];
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

export interface Resume {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    title: string;
    rawText: string;
    structuredData?: Record<string, unknown>;
    isPrimary: boolean;
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
    createdAt: Date;
}

export interface LearningPlanItem {
    skill: string;
    description?: string;
    resourceLink?: string;
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
