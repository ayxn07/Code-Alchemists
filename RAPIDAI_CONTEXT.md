# RapidAI – AI Career OS & Job-Hunt Twin

**Project Context & Copilot Instruction Set**

> Put this file in the repo as `RAPIDAI_CONTEXT.md` (or similar).  
> Treat this file as the **source of truth** for GitHub Copilot & all future code generation.

---

## 1. High-Level Product Summary

RapidAI is an **AI-powered Career OS** plus a **“digital twin” job-hunt agent**.

Core value:

- Helps users **find, apply to, and track jobs** automatically.
- Uses AI to:
  - Analyze CVs, LinkedIn profiles, and job descriptions.
  - Tailor resumes/cover letters per job (ATS friendly).
  - Coach users with **mock interviews (voice/video)**.
  - Build learning plans from **skill-gap analysis**.
  - Provide **career dashboard, trends, salary insights**.
- Integrates with:
  - **Job listing APIs** (via RapidAPI or equivalent).
  - **LLM APIs** (for text reasoning and generation).
  - **Speech-to-Text** & **Text-to-Speech (ElevenLabs)**.
  - **n8n** for background workflows (auto job apply, weekly reports).

Primary stack:

- **Frontend**: Next.js (App Router), Tailwind, Framer Motion, GSAP.
- **Backend**: Node.js (Next.js API routes), TypeScript.
- **Database**: MongoDB (Atlas).
- **Automation**: n8n (self-hosted or cloud).

**IMPORTANT PRIORITY:**  
First, build a **clean, well-structured backend + APIs + models + integrations**.  
Then, add the flashy UI and animations on top of this stable API layer.

---

## 2. Overall Architecture

Single full-stack Next.js app with:

- `src/app/` – Next.js App Router (pages, routes).
- `src/app/api/` – API routes (act as backend endpoints).
- `src/server/` – server-side logic:
  - `db/` – Mongo connection & models.
  - `services/` – business logic.
  - `integrations/` – external APIs (LLM, job APIs, STT, TTS, n8n).
- `src/types/` – shared TypeScript types.
- `src/config/` – config helpers (env parsing, constants).
- `src/utils/` – small utility functions.

Backend uses **JWT-based auth** (or NextAuth.js, but keep backend endpoints auth-aware).

---

## 3. Core Domain Features & API Responsibilities

Copilot should structure APIs around these feature modules:

1. **Auth & User Management**
2. **Profile & CV Management**
3. **Job Search & Job Applications**
4. **Skill-Gap Analysis & Learning Plan**
5. **JD → CV Tailoring & ATS Scoring**
6. **Interview Coach (Voice/Video)**
7. **Career Mentor Dashboard & Analytics**
8. **Salary & Market Trends**
9. **Opportunities Feed (jobs + hackathons + internships)**
10. **Integrations (LinkedIn, n8n, LLM, ElevenLabs, STT)**

Each module should have:

- A **service layer** (pure logic).
- An **API route** that:
  - Validates input (zod).
  - Calls the service.
  - Handles errors.

---

## 4. API Route Plan (Backend First)

> All API routes should be implemented under `src/app/api/**/route.ts` (Next.js App Router), using **TypeScript** and **`Request`/`Response`** handlers.

### 4.1 Auth & User

**Goal:** Basic JWT or session-based auth. Keep it simple but secure.

Routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET  /api/auth/me` – returns current user profile based on token.

Responsibilities:

- Hash passwords (bcrypt).
- Issue JWT with `JWT_SECRET`.
- Store users in `users` collection.

---

### 4.2 User Profile & CV

Routes:

- `GET  /api/profile` – fetch profile (skills, preferences, goals).
- `PUT  /api/profile` – update profile.
- `POST /api/cv/upload` – upload CV (file or text).
- `GET  /api/cv` – get user’s CVs (list + active CV).
- `POST /api/cv/generate` – generate CV from profile via LLM (Harvard-style, templates).
- `POST /api/cv/update-section` – AI-rewrite specific sections (summary, experience bullet, skills).

Responsibilities:

- Parse CV (using LLM or parser) → store as structured data.
- Support **multiple CV versions** with metadata.

---

### 4.3 Job Search & Applications

Routes:

- `POST /api/jobs/search`
  - Input: role, location, remote, salary range, etc.
  - Calls job APIs (RapidAPI) and returns normalized list.
- `POST /api/jobs/save` – save a job to user’s job list.
- `GET  /api/jobs/saved`
- `POST /api/applications/create`
  - Create an application entry (job + tailored CV + cover letter).
- `GET  /api/applications`
  - List with filters: status, company, date.
- `PUT  /api/applications/:id/status`
  - Update status (applied, viewed, interview, rejected, offer).

Responsibilities:

- Normalize job API responses into a consistent format.
- Store job & application data in MongoDB.

---

### 4.4 Skill-Gap Analysis & Learning Plan

Routes:

- `POST /api/skills/analyze`
  - Input: target role, CV/profile.
  - Output: missing skills, match %, outdated technologies.
- `POST /api/learning-plan/generate`
  - Input: skill-gap data.
  - Output: weekly learning roadmap with resources.
- `GET  /api/learning-plan` – get current active plan for user.

Responsibilities:

- Use LLM + job data to infer skills.
- Store learning plans in DB.

---

### 4.5 JD → CV Tailoring & ATS Scoring

Routes:

- `POST /api/ats/tailor`
  - Input: job description + selected CV.
  - Output: tailored CV content sections.
- `POST /api/ats/score`
  - Input: job description + CV text.
  - Output: ATS score + recommendations.

Responsibilities:

- LLM-based analysis and rewriting.
- Return structured sections (summary, skills, experience).

---

### 4.6 Interview Coach (Voice + Video)

Routes:

- `POST /api/interview/start`
  - Starts a session: role + mode (HR/technical/behavioral).
  - Output: first question (text + optional TTS URL).
- `POST /api/interview/next`
  - Input: sessionId + previous answer transcript.
  - Output: scores + feedback + next question.
- `POST /api/interview/upload-audio`
  - Input: audio file.
  - Process:
    - Send to STT.
    - Return transcript.
- `GET  /api/interview/sessions`
  - List history with aggregate scores.

Responsibilities:

- Orchestrate:
  - STT → LLM evaluation → TTS (ElevenLabs if needed).
- Save sessions in `interviewSessions` collection.

---

### 4.7 Career Mentor Dashboard & Analytics

Routes:

- `GET /api/dashboard/summary`
  - Applications stats, interviews, offers, learning progress.
- `GET /api/dashboard/tasks`
  - Daily/weekly tasks for user (generated from profile, gaps, goals).

Responsibilities:

- Aggregate data across:
  - applications, skills, learning plans, interviews.
- Generate human-friendly summaries via LLM.

---

### 4.8 Salary & Market Trends

Routes:

- `POST /api/market/trends`
  - Input: role, location, experience.
  - Output: trending skills, declining skills, demand sectors.
- `POST /api/salary/insights`
  - Input: role, location, experience.
  - Output: ranges + narrative explanation.
- `POST /api/salary/negotiation-script`
  - Input: offer details + user context.
  - Output: negotiation script, counter offer, pros/cons style analysis.

Responsibilities:

- Combine static data (if available) + LLM reasoning.

---

### 4.9 Opportunity Feed

Routes:

- `GET /api/opportunities/feed`
  - Returns:
    - jobs
    - internships
    - hackathons
    - scholarships
    - events
  - All filtered for user’s profile & preferences.

Responsibilities:

- Use a mix of API data and LLM curation (ranking).

---

### 4.10 Integrations: LinkedIn, n8n, LLM, ElevenLabs, STT

#### LinkedIn (Profile / Signup)

- `POST /api/integrations/linkedin/import`
  - Input: code (OAuth).
  - Output: user profile details.

#### n8n (Workflows)

- `POST /api/integrations/n8n/trigger-job-agent`
  - Triggers a background workflow in n8n with user’s search parameters.
- `POST /api/integrations/n8n/receive-update`
  - Webhook endpoint to receive updates from n8n (application status, etc.).

#### LLM (Text AI)

- `src/server/integrations/llmClient.ts`
  - Single helper to call any LLM provider.

#### ElevenLabs (TTS)

- `src/server/integrations/ttsClient.ts`
  - Single helper for generating voice audio URL.

#### STT Provider (Whisper/Deepgram/etc.)

- `src/server/integrations/sttClient.ts`
  - Accepts audio → returns transcript.

---

## 5. MongoDB Collections & Basic Schemas

Copilot should create Mongoose (or Mongo driver) models roughly like:

- `User`
  - \_id, email, passwordHash, name, role, createdAt…
- `UserProfile`
  - userId, headline, about, skills[], targetRoles[], locations[], salaryExpectation, etc.
- `Resume`
  - userId, title, rawText, structuredData (JSON), isPrimary, createdAt, updatedAt.
- `Job`
  - externalId, title, company, location, salaryRange, source, rawData, createdAt.
- `Application`
  - userId, jobId, status, tailoredResumeId, coverLetter, appliedAt, source, notes.
- `SkillGapAnalysis`
  - userId, targetRole, matchPercent, missingSkills[], outdatedSkills[], createdAt.
- `LearningPlan`
  - userId, items[{skill, resourceLink, status}], createdAt.
- `InterviewSession`
  - userId, mode, questions[], answers[], scores, startedAt, completedAt.
- `ActivityLog`
  - userId, type, meta, createdAt (for gamification, XP, streaks).

---

## 6. Environment Variables – What Must Go in `.env`

Copilot MUST always use `process.env.*` and never hard-code secrets.

Use these (names can be adjusted, but keep them consistent):

### Basic

- `NODE_ENV`
- `NEXT_PUBLIC_APP_URL` – e.g. `https://rapidai.example.com`

### Database

- `MONGODB_URI`

### Auth

- `JWT_SECRET`
- `ENCRYPTION_KEY` (optional)
- `NEXTAUTH_SECRET` (if using NextAuth)
- `NEXTAUTH_URL` (if using NextAuth + OAuth)

### LLM Provider (Example: OpenAI-like)

- `LLM_API_KEY`
- `LLM_API_BASE_URL` (if using custom provider)
- `LLM_MODEL_NAME` (e.g. `gpt-4.1` or similar)

### Job APIs (via RapidAPI or similar)

For each integrated job API via RapidAPI:

- `RAPIDAPI_KEY`
- `JOB_API_BASE_URL` (e.g. the root of the job listing service).
- Optional separate keys:
  - `JOB_API_PROVIDER_1_URL`
  - `JOB_API_PROVIDER_1_KEY`

### ElevenLabs (Text-to-Speech)

- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID` (default voice for interviewer)

### STT Provider (Speech-to-Text)

- `STT_API_KEY`
- `STT_API_BASE_URL`

### LinkedIn Integration

- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `LINKEDIN_REDIRECT_URI`

### n8n Integration

- `N8N_JOB_AUTOMATION_WEBHOOK_URL`  
  (To trigger job-search + auto-apply workflow)
- `N8N_WEEKLY_REPORT_WEBHOOK_URL`  
  (To trigger weekly report generation)
- If n8n needs auth:
  - `N8N_API_KEY`

### E-mail (optional)

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`

---

## 7. Coding Conventions – What GitHub Copilot Must Follow

**Language & Style**

- Use **TypeScript everywhere** (no plain JS).
- Use **ES modules**.
- Use `async/await` (no `.then` chains).
- Use `zod` for request validation where possible.
- Use `camelCase` for variables/functions, `PascalCase` for types/classes.

**Backend Code Organization**

- API route files should be **thin controllers**:
  - Parse & validate input.
  - Call service layer.
  - Handle success/error response.
- Business logic should live in `src/server/services/**`.
- External HTTP calls live in `src/server/integrations/**`.
- Database operations live in `src/server/db/**` or in model-specific helpers.

**Error Handling**

- Always handle errors with `try/catch` in API handlers.
- Return JSON like:
  ```ts
  return NextResponse.json({ error: "Message" }, { status: 400 });
  ```
