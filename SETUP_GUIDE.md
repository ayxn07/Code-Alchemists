# RapidAI - Setup Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key
- RapidAPI account (for job search)
- LinkedIn Developer App (optional, for LinkedIn integration)

---

## 📋 Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.local` and fill in the required values:

#### **Required** (Must have these to run):

**MONGODB_URI**

- Get from: [MongoDB Atlas](https://cloud.mongodb.com/)
- Steps:
  1. Create account at MongoDB Atlas
  2. Create a new cluster (free tier available)
  3. Click "Connect" → "Connect your application"
  4. Copy the connection string
  5. Replace `<password>` with your database password
- Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rapidai`

**JWT_SECRET**

- Generate a strong random string
- Options:
  - Use: `openssl rand -hex 32` (Mac/Linux)
  - Use: PowerShell: `[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))`
  - Or use any password generator
- Example: `a8f5e2d9c1b6a3f4e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0`

**GEMINI_API_KEY**

- Get from: [Google AI Studio](https://aistudio.google.com/app/apikey)
- Steps:
  1. Go to https://aistudio.google.com/app/apikey
  2. Sign in with your Google account
  3. Click "Get API key" or "Create API key"
  4. Copy the API key (starts with `AIzaSy...`)
  5. Paste it in `.env.local`
- **Free tier includes:**
  - 60 requests per minute
  - 1,500 requests per day
- Example: `AIzaSyABC123XYZ456def789ghi012jkl345mno678`

**RAPIDAPI_KEY**

- Get from: [RapidAPI](https://rapidapi.com/)
- Steps:
  1. Create account at RapidAPI.com
  2. Subscribe to [JSearch API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) (free tier available)
  3. Go to "Endpoints" and you'll see your API key
  4. Copy the `X-RapidAPI-Key` value
- **Free tier includes:** 100-500 requests/month depending on plan
- Example: `022bb5f506msh9604a376c16d6ccp131a13jsn347f98a81a37`

#### **Optional** (Can add later):

**LinkedIn Integration**

- Get from: [LinkedIn Developers](https://www.linkedin.com/developers/)
- Steps:
  1. Create a LinkedIn Developer account
  2. Create a new app
  3. Add redirect URL: `http://localhost:3000/api/integrations/linkedin/callback`
  4. Copy Client ID and Client Secret
- Required for LinkedIn profile import feature

**ElevenLabs (Text-to-Speech)**

- Get from: [ElevenLabs](https://elevenlabs.io/)
- Steps:
  1. Create account at ElevenLabs
  2. Go to Profile → API Keys
  3. Copy your API key
- Required for interview voice features
- Free tier: 10,000 characters/month

**Speech-to-Text Provider**

- Options: Deepgram, AssemblyAI, or OpenAI Whisper
- Required for voice interview features
- Configure based on chosen provider

**n8n Automation**

- Self-host or use n8n Cloud
- Required for automated job applications
- Configure webhook URLs in n8n workflows

---

## 🔧 Configuration File

Your `.env.local` should look like this:

```env
# ===== REQUIRED =====
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rapidai

# Auth
JWT_SECRET=your_secure_random_string_here

# Google Gemini LLM
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GEMINI_MODEL=gemini-1.5-pro

# Job Search
RAPIDAPI_KEY=your_rapidapi_key_here

# ===== OPTIONAL =====
# LinkedIn (for profile import)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/integrations/linkedin/callback

# ElevenLabs TTS (for interview voice)
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Speech-to-Text (for interview voice)
STT_API_KEY=your_stt_provider_key
STT_API_BASE_URL=https://api.your-stt-provider.com

# n8n Automation (for job agent)
N8N_JOB_AUTOMATION_WEBHOOK_URL=https://your-n8n-instance.com/webhook/job-automation
N8N_WEEKLY_REPORT_WEBHOOK_URL=https://your-n8n-instance.com/webhook/weekly-report
N8N_API_KEY=your_n8n_api_key

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@rapidai.com
```

---

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

Visit: http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

---

## 📚 API Key Resources

### Google Gemini API

- **Dashboard:** https://aistudio.google.com/app/apikey
- **Documentation:** https://ai.google.dev/docs
- **Pricing:** Free tier + paid plans
- **Models Available:**
  - `gemini-1.5-pro` (recommended, most capable)
  - `gemini-1.5-flash` (faster, cheaper)
  - `gemini-pro` (legacy)

### RapidAPI (Job Search)

- **Dashboard:** https://rapidapi.com/hub
- **JSearch API:** https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
- **Documentation:** Available in RapidAPI dashboard
- **Free Tier:** 100-500 requests/month
- **Alternative APIs:**
  - LinkedIn Jobs API
  - Indeed Job Search API
  - Glassdoor API

### MongoDB Atlas

- **Dashboard:** https://cloud.mongodb.com/
- **Documentation:** https://docs.atlas.mongodb.com/
- **Free Tier:** 512MB storage, shared cluster
- **Connection String Format:**
  ```
  mongodb+srv://username:password@cluster.mongodb.net/database
  ```

### LinkedIn Developer

- **Dashboard:** https://www.linkedin.com/developers/apps
- **API Documentation:** https://learn.microsoft.com/en-us/linkedin/
- **OAuth Guide:** https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication

### ElevenLabs

- **Dashboard:** https://elevenlabs.io/app
- **API Docs:** https://elevenlabs.io/docs/api-reference
- **Voice Library:** https://elevenlabs.io/voice-library
- **Free Tier:** 10,000 characters/month

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Check if your IP is whitelisted in MongoDB Atlas
- Verify connection string format
- Ensure password doesn't contain special characters (or URL encode them)

### Gemini API Errors

- Verify API key is correct (starts with `AIzaSy`)
- Check quota limits in Google AI Studio
- Ensure you're using supported model names

### RapidAPI Job Search Fails

- Verify you're subscribed to the JSearch API
- Check your API quota/limits
- Ensure API key is correct

### App Won't Start

```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Check for TypeScript errors
npm run build
```

### "GEMINI_API_KEY is not configured"

- Make sure `.env.local` exists in project root
- Restart dev server after adding env variables
- Check for typos in variable names

---

## 📖 Features & Endpoints

### Implemented APIs

- ✅ Authentication (register, login, JWT)
- ✅ Profile management
- ✅ CV upload, parsing, generation
- ✅ Job search (RapidAPI integration)
- ✅ Application tracking
- ✅ Skill gap analysis
- ✅ Learning plan generation
- ✅ ATS scoring & CV tailoring
- ✅ Interview coach (mock interviews)
- ✅ Dashboard analytics
- ✅ Market trends & salary insights
- ✅ Opportunities feed

### Frontend Pages

- ✅ Landing page
- ✅ Login/Register
- ✅ Dashboard overview
- ✅ Profile management
- ✅ CV manager
- ✅ Job search
- ✅ Applications tracker
- ✅ Skills & learning plan
- ✅ Interview coach
- ✅ Analytics & insights
- ✅ Opportunities feed

---

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Keep API keys secure and rotate them regularly
- Use strong JWT secrets (32+ characters)
- Enable MongoDB Atlas IP whitelisting
- Use HTTPS in production
- Implement rate limiting for production APIs

---

## 🤝 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review API provider documentation
3. Check console logs for detailed error messages
4. Verify all required environment variables are set

---

## 📝 License

This project is for educational/portfolio purposes.

---

**Happy coding! 🎉**
