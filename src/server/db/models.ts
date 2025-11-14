import mongoose, { Schema, model, models } from "mongoose";
import type {
    User,
    UserProfile,
    Resume,
    Job,
    Application,
    SkillGapAnalysis,
    LearningPlan,
    InterviewSession,
    ActivityLog,
} from "@/src/types/models";

const userSchema = new Schema<User>(
    {
        email: { type: String, required: true, unique: true, index: true },
        passwordHash: { type: String, required: true },
        name: { type: String, required: true },
        linkedinId: { type: String },
        linkedinProfileUrl: { type: String },
        isLinkedinLinked: { type: Boolean, default: false },
        role: { type: String, enum: ["user", "admin"], default: "user" },
    },
    { timestamps: true }
);

const userProfileSchema = new Schema<UserProfile>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        headline: String,
        about: String,
        skills: { type: [String], default: [] },
        targetRoles: { type: [String], default: [] },
        locations: { type: [String], default: [] },
        salaryExpectation: {
            currency: String,
            min: Number,
            max: Number,
        },
        preferences: {
            remote: Boolean,
            hybrid: Boolean,
            onsite: Boolean,
            industries: [String],
        },
    },
    { timestamps: true }
);

const resumeSchema = new Schema<Resume>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        title: { type: String, required: true },
        rawText: { type: String, required: true },
        structuredData: { type: Schema.Types.Mixed },
        isPrimary: { type: Boolean, default: false },
        tags: { type: [String], default: [] },
    },
    { timestamps: true }
);

const jobSchema = new Schema<Job>(
    {
        externalId: { type: String },
        provider: { type: String },
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: String,
        salaryRange: {
            currency: String,
            min: Number,
            max: Number,
        },
        url: String,
        source: String,
        rawData: { type: Schema.Types.Mixed },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

jobSchema.index({ externalId: 1, provider: 1 }, { unique: true, sparse: true });

const applicationSchema = new Schema<Application>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
        status: {
            type: String,
            enum: ["draft", "applied", "viewed", "interview", "rejected", "offer"],
            default: "draft",
            index: true,
        },
        tailoredResumeId: { type: Schema.Types.ObjectId, ref: "Resume" },
        coverLetter: String,
        appliedAt: Date,
        source: String,
        notes: String,
        lastStatusChangeAt: Date,
        viaN8n: { type: Boolean, default: false },
    },
    { timestamps: true }
);

applicationSchema.index({ userId: 1, status: 1 });

const skillGapAnalysisSchema = new Schema<SkillGapAnalysis>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        targetRole: { type: String, required: true },
        matchPercent: { type: Number, required: true },
        missingSkills: { type: [String], default: [] },
        outdatedSkills: { type: [String], default: [] },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const learningPlanSchema = new Schema<LearningPlan>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        items: [
            {
                skill: { type: String, required: true },
                description: String,
                resourceLink: String,
                estimatedHours: Number,
                status: {
                    type: String,
                    enum: ["not-started", "in-progress", "completed"],
                    default: "not-started",
                },
                weekNumber: Number,
            },
        ],
        overallStatus: {
            type: String,
            enum: ["not-started", "in-progress", "completed"],
            default: "not-started",
        },
    },
    { timestamps: true }
);

const interviewSessionSchema = new Schema<InterviewSession>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        role: String,
        mode: { type: String, enum: ["hr", "technical", "behavioral"], required: true },
        questions: [
            {
                question: { type: String, required: true },
                followUp: String,
            },
        ],
        answers: [
            {
                questionIndex: { type: Number, required: true },
                transcript: { type: String, required: true },
                score: Number,
                feedback: String,
            },
        ],
        overallScore: Number,
        startedAt: { type: Date, required: true },
        completedAt: Date,
        viaVoice: Boolean,
    },
    { timestamps: true }
);

const activityLogSchema = new Schema<ActivityLog>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        type: {
            type: String,
            enum: [
                "login",
                "signup",
                "application_created",
                "application_status_changed",
                "resume_uploaded",
                "interview_started",
                "interview_completed",
                "learning_plan_generated",
            ],
            required: true,
        },
        meta: { type: Schema.Types.Mixed },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const UserModel = models.User || model<User>("User", userSchema);
export const UserProfileModel =
    models.UserProfile || model<UserProfile>("UserProfile", userProfileSchema);
export const ResumeModel =
    models.Resume || model<Resume>("Resume", resumeSchema);
export const JobModel = models.Job || model<Job>("Job", jobSchema);
export const ApplicationModel =
    models.Application || model<Application>("Application", applicationSchema);
export const SkillGapAnalysisModel =
    models.SkillGapAnalysis ||
    model<SkillGapAnalysis>("SkillGapAnalysis", skillGapAnalysisSchema);
export const LearningPlanModel =
    models.LearningPlan || model<LearningPlan>("LearningPlan", learningPlanSchema);
export const InterviewSessionModel =
    models.InterviewSession ||
    model<InterviewSession>("InterviewSession", interviewSessionSchema);
export const ActivityLogModel =
    models.ActivityLog || model<ActivityLog>("ActivityLog", activityLogSchema);
