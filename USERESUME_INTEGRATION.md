# UseResume.ai Integration Guide

## Overview

Your CV generation uses a **two-step AI pipeline**:

1. **Gemini AI** expands your profile into detailed, comprehensive 2-page content (500-700 words)
2. **UseResume.ai API** formats it professionally with automatic fallback support

This ensures every resume is approximately **2 pages** with rich, quantified achievements and detailed content.

## Configuration

### 1. Environment Setup

Add to `.env.local`:

```env
USERESUME_API_KEY=your_api_key_here
```

### 2. API Endpoint

Default endpoint (update in `useresumeClient.ts` when available):

```
https://api.useresume.ai/v1/generate
```

## Features

### ✅ Implemented

1. **AI-Powered Content Expansion (Gemini)**

   - Automatically expands basic profile data into 2-page detailed content
   - Adds 4-6 bullet points per experience with metrics and achievements
   - Creates compelling 3-4 sentence professional summaries
   - Organizes skills by category (Technical, Leadership, Languages)
   - Expands education with coursework, honors, and activities
   - Generates detailed project descriptions with outcomes

2. **Professional Resume Generation (UseResume.ai)**

   - Harvard, Modern, Minimalist, Creative templates
   - Template-specific formatting and language
   - Structured data formatting from expanded content
   - Bearer token authentication

3. **Intelligent Fallback System**

   - If UseResume API fails, generates formatted text locally
   - If Gemini fails, uses basic profile data
   - Ensures CV generation always works
   - Returns warning message when using fallback

4. **Enhanced Section Parsing**

   - Detects common resume sections (EDUCATION, EXPERIENCE, SKILLS, etc.)
   - Handles unstructured content gracefully
   - Creates PROFESSIONAL SUMMARY section for content without headers

5. **Harvard-Style PDF Export**
   - Times New Roman font
   - Professional formatting with section headers
   - Bullet points, dates, organization headers
   - Multi-page support with page overflow handling

## File Structure

```
src/server/integrations/useresumeClient.ts
├── generateResumeWithUseResume() - Main API call
├── convertProfileToUseResumeFormat() - Data transformation
└── formatResumeToText() - Fallback text formatter

app/api/cv/generate/route.ts
└── POST handler with UseResume.ai integration

app/dashboard/cv/page.tsx
└── handleDownloadHarvardCV() - Enhanced PDF generation
```

## API Request Format

```typescript
{
  template: 'harvard' | 'modern' | 'minimalist' | 'creative',
  data: {
    personalInfo: {
      name: string,
      email?: string,
      phone?: string,
      location?: string,
      linkedin?: string,
      website?: string
    },
    summary?: string,
    experience?: Array<{
      title: string,
      company: string,
      location?: string,
      startDate: string,
      endDate?: string,
      current?: boolean,
      description: string[]
    }>,
    education?: Array<{...}>,
    skills?: string[],
    projects?: Array<{...}>,
    certifications?: Array<{...}>,
    awards?: string[]
  }
}
```

## Expected API Response

```typescript
{
  pdfUrl?: string,
  htmlContent?: string,
  textContent?: string
}
```

## Usage

### Generate CV from Dashboard

1. Navigate to `/dashboard/cv`
2. Click "Generate New CV"
3. Select template (Harvard recommended)
4. Optional: specify target role
5. Click "Generate"

### Download Harvard-Style PDF

1. View generated CV in dashboard
2. Click "Harvard PDF" button
3. PDF downloads with professional formatting

## Fallback Behavior

When UseResume.ai API is unavailable:

1. System generates formatted text locally
2. Uses profile data (experience, education, skills)
3. Returns warning in API response
4. CV is still saved and usable

## Testing Checklist

- [ ] Add API key to `.env.local`
- [ ] Test CV generation with valid API key
- [ ] Test fallback without API key
- [ ] Verify section detection with various content formats
- [ ] Download Harvard PDF and check formatting
- [ ] Test multi-page CV generation
- [ ] Verify contact info parsing (email, phone, LinkedIn)

## Common Sections Detected

The system automatically detects these section headers:

- EDUCATION / WORK EXPERIENCE / EXPERIENCE
- PROFESSIONAL EXPERIENCE / SKILLS
- SUMMARY / OBJECTIVE / PROJECTS
- CERTIFICATIONS / AWARDS / PUBLICATIONS
- LANGUAGES / ACTIVITIES / LEADERSHIP
- VOLUNTEER / INTERESTS

## Troubleshooting

### CV shows minimal text

**Cause**: Content lacks section headers or is empty
**Solution**: Enhanced parser now creates PROFESSIONAL SUMMARY for unstructured content

### API returns 401/403

**Cause**: Invalid or missing API key
**Solution**: Check `.env.local` and restart dev server

### PDF formatting issues

**Cause**: Long text or special characters
**Solution**: Text is automatically wrapped; special bullets are normalized

### Section not detected

**Cause**: Non-standard section name
**Solution**: Add to `commonSections` array in `page.tsx`

## Next Steps

1. **Get API Key**: Sign up at useresume.ai and add key to `.env.local`
2. **Update Endpoint**: Replace placeholder URL with actual API endpoint
3. **Test Integration**: Generate CVs and verify output
4. **Monitor Logs**: Check console for API responses and fallback usage

## Support

For UseResume.ai API documentation and support:

- Documentation: https://docs.useresume.ai (when available)
- API Keys: https://useresume.ai/dashboard
- Issues: Check console logs for detailed error messages
