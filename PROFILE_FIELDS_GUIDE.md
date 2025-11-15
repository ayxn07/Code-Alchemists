# User Profile Fields Guide

## Overview

The user profile now supports comprehensive data to generate accurate, professional resumes without AI hallucination. All fields are optional unless specified.

## Profile Structure

### 1. Basic Information

```typescript
{
  headline: string           // e.g., "Senior Software Engineer | Full-Stack Developer"
  about: string             // Brief bio/introduction
  phone: string             // e.g., "+1 (555) 123-4567"
  location: string          // e.g., "San Francisco, CA"
  experienceYears: number   // e.g., 5
  experienceLevel: string   // 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  currentRole: string       // e.g., "Senior Software Engineer"
  targetRoles: string[]     // e.g., ["Tech Lead", "Engineering Manager"]
  professionalSummary: string  // 3-4 sentence career overview
  careerObjective: string      // Future career goals
}
```

### 2. Skills

```typescript
{
  skills: string[]  // e.g., ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker"]
}
```

**Tip**: Organize skills by category for better resumes:

- Technical: Programming languages, frameworks, tools
- Soft Skills: Leadership, communication, problem-solving
- Domain: Industry-specific knowledge

### 3. Work Experience (Detailed)

```typescript
{
  experience: [{
    title: string              // e.g., "Senior Software Engineer"
    company: string            // e.g., "Google"
    location: string           // e.g., "Mountain View, CA"
    startDate: string          // e.g., "Jan 2020" or "2020-01"
    endDate: string           // e.g., "Present" or "Dec 2023"
    current: boolean          // true if currently employed
    description: string[]     // Array of responsibility bullet points
    technologies: string[]    // e.g., ["React", "Node.js", "PostgreSQL"]
    achievements: string[]    // Quantifiable achievements with metrics
  }]
}
```

**Example**:

```json
{
  "title": "Senior Software Engineer",
  "company": "Tech Corp",
  "location": "San Francisco, CA",
  "startDate": "Jan 2020",
  "endDate": "Present",
  "current": true,
  "description": [
    "Led development of microservices architecture serving 10M+ users",
    "Architected and implemented RESTful APIs using Node.js and Express",
    "Mentored junior developers and conducted code reviews"
  ],
  "technologies": ["Node.js", "React", "PostgreSQL", "AWS", "Docker"],
  "achievements": [
    "Reduced API response time by 60% through optimization",
    "Increased test coverage from 40% to 95%",
    "Led migration to microservices, improving system scalability by 300%"
  ]
}
```

### 4. Education

```typescript
{
  education: [{
    degree: string              // e.g., "Bachelor of Science in Computer Science"
    institution: string         // e.g., "Stanford University"
    location: string           // e.g., "Stanford, CA"
    graduationDate: string     // e.g., "May 2019" or "2019"
    gpa: string               // e.g., "3.8/4.0"
    honors: string[]          // e.g., ["Dean's List", "Cum Laude", "Phi Beta Kappa"]
    relevantCoursework: string[]  // e.g., ["Data Structures", "Algorithms", "Machine Learning"]
    activities: string[]      // e.g., ["ACM President", "Robotics Club", "Google Developer Student Club"]
  }]
}
```

### 5. Projects

```typescript
{
  projects: [{
    name: string               // e.g., "E-commerce Platform"
    description: string        // Detailed project description
    role: string              // e.g., "Lead Developer"
    startDate: string         // e.g., "Jan 2023"
    endDate: string          // e.g., "Present" or "Jun 2023"
    technologies: string[]    // e.g., ["React", "Node.js", "MongoDB"]
    link: string             // Live project URL
    githubUrl: string        // GitHub repository URL
    achievements: string[]   // Project outcomes and metrics
  }]
}
```

**Example**:

```json
{
  "name": "AI-Powered Job Matching Platform",
  "description": "Full-stack application matching candidates with jobs using ML algorithms",
  "role": "Full-Stack Developer & ML Engineer",
  "startDate": "Jun 2023",
  "endDate": "Dec 2023",
  "technologies": ["Python", "TensorFlow", "React", "FastAPI", "PostgreSQL"],
  "link": "https://jobmatch.example.com",
  "githubUrl": "https://github.com/username/job-matcher",
  "achievements": [
    "Achieved 87% matching accuracy using collaborative filtering",
    "Processed 50K+ job applications with 99.9% uptime",
    "Reduced matching time from 2 hours to 5 seconds"
  ]
}
```

### 6. Certifications & Licenses

```typescript
{
  certifications: [{
    name: string              // e.g., "AWS Certified Solutions Architect"
    issuer: string           // e.g., "Amazon Web Services"
    date: string            // e.g., "Jan 2023"
    expiryDate: string      // e.g., "Jan 2026" (if applicable)
    credentialId: string    // e.g., "ABC123XYZ"
    credentialUrl: string   // Verification URL
  }]
}
```

### 7. Awards & Recognition

```typescript
{
  awards: [{
    title: string            // e.g., "Employee of the Year"
    issuer: string          // e.g., "Tech Corp"
    date: string           // e.g., "Dec 2023"
    description: string    // Additional context
  }]
}
```

### 8. Publications

```typescript
{
  publications: [{
    title: string            // e.g., "Scalable Microservices Architecture Patterns"
    publisher: string        // e.g., "IEEE"
    date: string            // e.g., "Mar 2023"
    url: string             // Publication URL
    coAuthors: string[]     // e.g., ["John Doe", "Jane Smith"]
  }]
}
```

### 9. Languages

```typescript
{
  languages: [{
    name: string             // e.g., "Spanish"
    proficiency: string      // 'native' | 'fluent' | 'professional' | 'intermediate' | 'basic'
  }]
}
```

### 10. Volunteer Experience

```typescript
{
  volunteer: [{
    role: string              // e.g., "Coding Instructor"
    organization: string      // e.g., "Code.org"
    startDate: string        // e.g., "Jan 2022"
    endDate: string         // e.g., "Present"
    description: string     // What you did
  }]
}
```

### 11. Links & Social Media

```typescript
{
  linkedinUrl: string; // e.g., "https://linkedin.com/in/username"
  githubUrl: string; // e.g., "https://github.com/username"
  portfolioUrl: string; // e.g., "https://myportfolio.com"
  personalWebsite: string; // e.g., "https://johndoe.dev"
}
```

### 12. Preferences

```typescript
{
  salaryExpectation: {
    currency: string         // e.g., "USD"
    min: number             // e.g., 120000
    max: number             // e.g., 180000
  },
  preferences: {
    remote: boolean         // Open to remote work
    hybrid: boolean         // Open to hybrid work
    onsite: boolean        // Open to onsite work
    industries: string[]   // e.g., ["Technology", "Finance", "Healthcare"]
  }
}
```

## Best Practices for Resume Generation

### 1. Use Quantifiable Achievements

❌ Bad: "Improved system performance"
✅ Good: "Improved system performance by 60%, reducing page load time from 5s to 2s"

### 2. Use Action Verbs

Start bullet points with: Led, Developed, Implemented, Achieved, Increased, Reduced, Architected, Designed, Managed, Mentored

### 3. Include Technologies

Always list specific technologies, frameworks, and tools used in each role/project

### 4. Be Specific with Dates

Use consistent format: "Jan 2020 - Present" or "2020-01 - Present"

### 5. Focus on Impact

Every bullet point should show business impact, technical achievement, or learning outcome

## API Endpoint to Update Profile

```bash
POST /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "headline": "Senior Software Engineer",
  "phone": "+1 (555) 123-4567",
  "location": "San Francisco, CA",
  "experienceLevel": "senior",
  "experienceYears": 8,
  "skills": ["JavaScript", "React", "Node.js", "Python", "AWS"],
  "experience": [{
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    "location": "San Francisco, CA",
    "startDate": "Jan 2020",
    "endDate": "Present",
    "current": true,
    "description": [
      "Led development of microservices architecture",
      "Mentored 5 junior developers"
    ],
    "technologies": ["Node.js", "React", "AWS"],
    "achievements": [
      "Reduced API latency by 60%",
      "Increased test coverage to 95%"
    ]
  }],
  "education": [{
    "degree": "Bachelor of Science in Computer Science",
    "institution": "Stanford University",
    "location": "Stanford, CA",
    "graduationDate": "2016",
    "gpa": "3.8/4.0",
    "honors": ["Dean's List", "Cum Laude"]
  }],
  "projects": [{
    "name": "AI Job Matcher",
    "description": "ML-powered job matching platform",
    "technologies": ["Python", "TensorFlow", "React"],
    "link": "https://project.com"
  }],
  "certifications": [{
    "name": "AWS Certified Solutions Architect",
    "issuer": "Amazon Web Services",
    "date": "2023-01",
    "credentialId": "ABC123"
  }]
}
```

## Migration Notes

For existing users with minimal profile data:

1. The system will still work with basic fields (backward compatible)
2. AI will expand content, but it's better to provide real data
3. Gradually fill in detailed fields for more accurate resumes
4. The more details provided, the less AI "hallucination"

## Resume Generation Flow

1. **User fills comprehensive profile** → Real data
2. **Gemini AI expands** → Adds professional formatting, expands bullet points with action verbs
3. **UseResume.ai formats** → Applies Harvard/Modern/Minimalist/Creative template styling
4. **Result** → Accurate, detailed 2-page resume based on YOUR actual experience

**Key Benefit**: With detailed profile fields, Gemini focuses on formatting and enhancement rather than inventing content!
