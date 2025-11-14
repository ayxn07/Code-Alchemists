export const env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    encryptionKey: process.env.ENCRYPTION_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL ?? "gemini-1.5-pro",
    llm: {
        apiKey: process.env.LLM_API_KEY,
        baseUrl: process.env.LLM_API_BASE_URL,
        modelName: process.env.LLM_MODEL_NAME,
    },
    jobApi: {
        rapidApiKey: process.env.RAPIDAPI_KEY,
        baseUrl: process.env.JOB_API_BASE_URL,
        provider1Url: process.env.JOB_API_PROVIDER_1_URL,
        provider1Key: process.env.JOB_API_PROVIDER_1_KEY,
    },
    elevenLabs: {
        apiKey: process.env.ELEVENLABS_API_KEY,
        voiceId: process.env.ELEVENLABS_VOICE_ID,
    },
    stt: {
        apiKey: process.env.STT_API_KEY,
        baseUrl: process.env.STT_API_BASE_URL,
    },
    linkedin: {
        clientId: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        redirectUri: process.env.LINKEDIN_REDIRECT_URI,
    },
    n8n: {
        jobAutomationWebhookUrl: process.env.N8N_JOB_AUTOMATION_WEBHOOK_URL,
        weeklyReportWebhookUrl: process.env.N8N_WEEKLY_REPORT_WEBHOOK_URL,
        apiKey: process.env.N8N_API_KEY,
    },
    email: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.EMAIL_FROM,
    },
};

export function ensureRequiredEnv() {
    if (!env.mongodbUri) {
        throw new Error("MONGODB_URI is required but not set");
    }
    if (!env.jwtSecret) {
        throw new Error("JWT_SECRET is required but not set");
    }
}
