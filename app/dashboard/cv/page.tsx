'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/src/app/components/DashboardLayout';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Resume {
    _id: string;
    title: string;
    isPrimary: boolean;
    updatedAt: string;
    tags: string[];
    rawText?: string;
    atsScore?: number;
    atsAnalysis?: {
        score: number;
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
        keywordMatches?: string[];
    };
    versions?: Array<{
        versionNumber: number;
        content: string;
        atsScore?: number;
        changes?: string;
        createdAt: Date;
    }>;
}

export default function CVPage() {
    const [resumes, setResumes] = useState<Resume[]>([]);
    // State for controlling which menu is open (by resume id)
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showATSModal, setShowATSModal] = useState(false);
    const [showRewriteModal, setShowRewriteModal] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadContent, setUploadContent] = useState('');
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    const [generateTemplate, setGenerateTemplate] = useState('harvard');
    const [generateRole, setGenerateRole] = useState('');

    const [jobDescription, setJobDescription] = useState('');
    const [atsResult, setATSResult] = useState<any>(null);

    const [rewriteSection, setRewriteSection] = useState('');
    const [rewriteContent, setRewriteContent] = useState('');
    const [rewriteTarget, setRewriteTarget] = useState('');
    const [rewriteResult, setRewriteResult] = useState<any>(null);

    const [compareVersion1, setCompareVersion1] = useState<number>(0);
    const [compareVersion2, setCompareVersion2] = useState<number>(0);
    const [compareResult, setCompareResult] = useState<any>(null);

    const [uploading, setUploading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [rewriting, setRewriting] = useState(false);
    const [comparing, setComparing] = useState(false);
    const [error, setError] = useState('');




    // ...existing code...


    // ...existing code...


    // ...existing code...

    // Place this just before the return statement, after all hooks and functions

    const handleDeleteResume = async (resumeId: string) => {
        if (!window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) return;
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/cv', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ resumeId }),
            });
            if (response.ok) {
                await loadResumes();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to delete resume');
            }
        } catch (err) {
            setError('Failed to delete resume');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadResumes();
    }, []);

    const loadResumes = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/cv', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setResumes(data.resumes || []);
            }
        } catch (err) {
            console.error('Failed to load resumes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate PDF by MIME or extension
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            setError('Please upload a PDF file');
            return;
        }

        setUploadFile(file);
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
        setError('');
        setUploadContent('');

        try {
            // Dynamically import pdfjs-dist only on client
            const pdfjsLib: any = await import('pdfjs-dist');
            // Use the ESM worker path for v4
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const typedarray = new Uint8Array(event.target?.result as ArrayBuffer);
                    const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                    let text = '';

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        const pageText = content.items
                            .map((item: any) => item.str)
                            .join(' ')
                            .trim();
                        text += pageText + '\n\n';
                    }

                    if (text.trim().length === 0) {
                        setError('Could not extract text from PDF. The file might be image-based or empty.');
                        setUploadFile(null);
                        return;
                    }

                    setUploadContent(text.trim());
                } catch (pdfError) {
                    console.error('PDF extraction error (client):', pdfError);
                    setError('Failed to extract text from PDF. Please ensure it\'s a valid text-based PDF.');
                    setUploadFile(null);
                }
            };

            reader.onerror = () => {
                setError('Failed to read PDF file.');
                setUploadFile(null);
            };

            reader.readAsArrayBuffer(file);
        } catch (err) {
            console.error('File upload error (client):', err);
            setError('Failed to process PDF file.');
            setUploadFile(null);
        }
    };

    const handleUpload = async () => {
        if (!uploadTitle) {
            setError('Please provide resume title');
            return;
        }

        if (!uploadFile) {
            setError('Please upload a PDF file');
            return;
        }

        // Ensure we have extracted text content from PDF
        if (!uploadContent) {
            setError('Please wait for PDF processing to complete');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const token = localStorage.getItem('auth_token');

            // Prepare request body with extracted text
            const requestBody = {
                title: uploadTitle,
                content: uploadContent,
                isPrimary: resumes.length === 0,
            };

            console.log('Uploading resume with content length:', uploadContent.length);

            const response = await fetch('/api/cv/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Upload successful:', data);
                await loadResumes();
                setShowUploadModal(false);
                setUploadTitle('');
                setUploadContent('');
                setUploadFile(null);
                setError(''); // Clear any previous errors
            } else {
                console.error('Upload failed:', data);
                setError(data.error || 'Failed to upload CV');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload CV. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleGenerate = async () => {
        if (!generateRole) {
            setError('Please enter a target role');
            return;
        }

        setGenerating(true);
        setError('');

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/cv/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    template: generateTemplate,
                    targetRole: generateRole,
                }),
            });

            if (response.ok) {
                await loadResumes();
                setShowGenerateModal(false);
                setGenerateRole('');
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to generate CV');
            }
        } catch (err) {
            setError('Failed to generate CV');
        } finally {
            setGenerating(false);
        }
    };

    const handleATSScore = async () => {
        if (!selectedResume) return;

        setAnalyzing(true);
        setError('');

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/cv/ats-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    resumeId: selectedResume._id,
                    jobDescription,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setATSResult(data.analysis);
                await loadResumes();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to analyze resume');
            }
        } catch (err) {
            setError('Failed to analyze resume');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleRewrite = async () => {
        if (!selectedResume || !rewriteSection || !rewriteContent) {
            setError('Please fill in all fields');
            return;
        }

        setRewriting(true);
        setError('');

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/cv/rewrite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    resumeId: selectedResume._id,
                    section: rewriteSection,
                    sectionContent: rewriteContent,
                    targetRole: rewriteTarget,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setRewriteResult(data);
                await loadResumes();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to rewrite section');
            }
        } catch (err) {
            setError('Failed to rewrite section');
        } finally {
            setRewriting(false);
        }
    };

    const handleCompare = async () => {
        if (!selectedResume) return;

        setComparing(true);
        setError('');

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/cv/compare', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    resumeId: selectedResume._id,
                    version1: compareVersion1 || undefined,
                    version2: compareVersion2 || undefined,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setCompareResult(data.comparison);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to compare versions');
            }
        } catch (err) {
            setError('Failed to compare versions');
        } finally {
            setComparing(false);
        }
    };

    const handleViewResume = async (resume: Resume) => {
        try {
            const content = resume.rawText || 'No content available';

            if (!content || content === 'No content available') {
                alert('No resume content available to view');
                return;
            }

            // Split content into lines
            const lines = content.split('\n').map(line => line.trim()).filter(line => line);

            // Extract name (first non-empty line or title)
            const name = lines[0] || resume.title;

            // Extract contact information
            const emailMatch = content.match(/[\w\.-]+@[\w\.-]+\.\w+/);
            const phoneMatch = content.match(/[\+]?[\d\s\(\)\-\.]+/);
            const linkedinMatch = content.match(/linkedin\.com\/in\/[\w\-]+/i);
            const githubMatch = content.match(/github\.com\/[\w\-]+/i);
            const websiteMatch = content.match(/(?:https?:\/\/)?(?:www\.)?[\w\-]+\.(?:com|dev|pages\.dev|io)/i);

            // Common section headers
            const sectionHeaders = [
                'PROFILE', 'SUMMARY', 'OBJECTIVE', 'ABOUT', 'CONTACT',
                'EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT', 'EMPLOYMENT HISTORY',
                'EDUCATION', 'ACADEMIC', 'QUALIFICATIONS',
                'SKILLS', 'TECHNICAL SKILLS', 'TOP SKILLS', 'CERTIFICATIONS',
                'PROJECTS', 'PROJECT', 'PORTFOLIO',
                'ACHIEVEMENTS', 'AWARDS', 'HONORS',
                'LANGUAGES', 'INTERESTS', 'HOBBIES'
            ];

            // Parse content into sections
            interface Section {
                title: string;
                content: string[];
            }

            const sections: Section[] = [];
            let currentSection: Section | null = null;
            let headerProcessed = false;

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                const upperLine = line.toUpperCase();

                // Check if this is a section header
                const isHeader = sectionHeaders.some(header => {
                    return upperLine === header ||
                        upperLine.startsWith(header + ' ') ||
                        upperLine.startsWith(header + ':');
                });

                if (isHeader) {
                    // Save previous section
                    if (currentSection && currentSection.content.length > 0) {
                        sections.push(currentSection);
                    }
                    // Start new section
                    currentSection = {
                        title: line.replace(/[:\(\)]/g, '').trim(),
                        content: []
                    };
                    headerProcessed = true;
                } else if (currentSection) {
                    // Add to current section
                    currentSection.content.push(line);
                } else if (!headerProcessed) {
                    // This is contact info or summary before first section
                    if (!currentSection) {
                        currentSection = { title: 'CONTACT & SUMMARY', content: [] };
                    }
                    currentSection.content.push(line);
                }
            }

            // Don't forget the last section
            if (currentSection && currentSection.content.length > 0) {
                sections.push(currentSection);
            }

            // Build contact line
            const contactParts: string[] = [];
            if (emailMatch) contactParts.push(emailMatch[0]);
            if (phoneMatch) contactParts.push(phoneMatch[0].trim());
            if (linkedinMatch) contactParts.push(linkedinMatch[0]);
            if (githubMatch) contactParts.push(githubMatch[0]);
            if (websiteMatch && websiteMatch[0] !== emailMatch?.[0]) contactParts.push(websiteMatch[0]);

            // Build sections HTML with better formatting
            const sectionsHTML = sections.map(section => {
                const contentHTML = section.content.map(line => {
                    // Detect bullet points
                    if (line.match(/^[\•\-\*\→]/)) {
                        return `<li style="margin-left: 25px; margin-bottom: 6px; line-height: 1.5;">${line.replace(/^[\•\-\*\→]\s*/, '')}</li>`;
                    }

                    // Detect dates (e.g., "January 2023 - Present")
                    if (line.match(/\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)) {
                        return `<p style="margin: 2px 0; color: #555; font-style: italic; font-size: 9.5pt;">${line}</p>`;
                    }

                    // Detect role/position titles (usually followed by dates or company)
                    if (line.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+\||\/)?/)) {
                        return `<p style="margin: 10px 0 2px 0; font-weight: bold; font-size: 10.5pt;">${line}</p>`;
                    }

                    // Regular content
                    return `<p style="margin: 4px 0; line-height: 1.5;">${line}</p>`;
                }).join('');

                return `
                    <div style="margin-bottom: 22px; page-break-inside: avoid;">
                        <h2 style="
                            font-size: 11.5pt; 
                            font-weight: bold; 
                            text-transform: uppercase;
                            color: #000;
                            border-bottom: 2px solid #65cae1; 
                            padding-bottom: 4px; 
                            margin-bottom: 10px;
                            letter-spacing: 0.5px;
                        ">${section.title}</h2>
                        ${contentHTML}
                    </div>
                `;
            }).join('');

            const newWindow = window.open('', '_blank', 'width=900,height=700');
            if (newWindow) {
                newWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <meta charset="UTF-8">
                            <title>${name} - Resume</title>
                            <style>
                                * {
                                    margin: 0;
                                    padding: 0;
                                    box-sizing: border-box;
                                }
                                body { 
                                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                    padding: 50px 70px;
                                    max-width: 900px;
                                    margin: 0 auto;
                                    background: #ffffff;
                                    color: #2d3748;
                                    line-height: 1.6;
                                    font-size: 10pt;
                                }
                                h1 {
                                    text-align: center;
                                    font-size: 26pt;
                                    font-weight: 700;
                                    margin: 0 0 8px 0;
                                    color: #1a202c;
                                    letter-spacing: 1px;
                                }
                                .contact {
                                    text-align: center;
                                    font-size: 9.5pt;
                                    margin-bottom: 30px;
                                    color: #4a5568;
                                    padding-bottom: 20px;
                                    border-bottom: 3px solid #65cae1;
                                }
                                .contact a {
                                    color: #4299e1;
                                    text-decoration: none;
                                }
                                h2 {
                                    font-size: 11.5pt;
                                    font-weight: bold;
                                    text-transform: uppercase;
                                    color: #1a202c;
                                    border-bottom: 2px solid #65cae1;
                                    padding-bottom: 4px;
                                    margin: 20px 0 10px 0;
                                    letter-spacing: 0.5px;
                                }
                                p { 
                                    margin: 4px 0; 
                                    line-height: 1.6;
                                    color: #2d3748;
                                }
                                li { 
                                    margin-left: 25px; 
                                    margin-bottom: 6px;
                                    line-height: 1.6;
                                    color: #2d3748;
                                }
                                ul {
                                    margin: 8px 0;
                                }
                                .section {
                                    margin-bottom: 22px;
                                    page-break-inside: avoid;
                                }
                                @media print {
                                    body { 
                                        padding: 30px 50px; 
                                        font-size: 9.5pt;
                                    }
                                    h1 { 
                                        font-size: 20pt; 
                                    }
                                    h2 {
                                        font-size: 11pt;
                                    }
                                    .section {
                                        page-break-inside: avoid;
                                    }
                                }
                                @page {
                                    margin: 0.5in;
                                }
                            </style>
                        </head>
                        <body>
                            <h1>${name}</h1>
                            <div class="contact">${contactParts.join(' | ')}</div>
                            ${sectionsHTML}
                            <div style="margin-top: 40px; text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 8pt; color: #a0aec0;">
                                Generated via CareerPilot AI | ${new Date().toLocaleDateString()}
                            </div>
                        </body>
                    </html>
                `);
                newWindow.document.close();
            }
        } catch (err) {
            console.error('Failed to view resume:', err);
            setError('Failed to view resume. Please try again.');
        }
    };

    const handleDownloadHarvardCV = async (resume: Resume) => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const leftMargin = 20;
            const rightMargin = 20;
            const contentWidth = pageWidth - leftMargin - rightMargin;
            let yPos = 20;

            // Helper to check page overflow
            const checkPageOverflow = (neededSpace: number = 10) => {
                if (yPos + neededSpace > pageHeight - 20) {
                    doc.addPage();
                    yPos = 20;
                    return true;
                }
                return false;
            };

            // Parse resume content
            const content = resume.rawText || 'No content available';

            if (!content || content === 'No content available') {
                setError('No resume content to display');
                return;
            }

            // Extract name - try multiple patterns
            let name = resume.title;
            const firstLine = content.split('\n')[0]?.trim();
            if (firstLine && firstLine.length > 2 && firstLine.length < 50) {
                name = firstLine;
            }

            // Extract contact info (email, phone, location, linkedin)
            const emailMatch = content.match(/[\w\.-]+@[\w\.-]+\.\w+/);
            const phoneMatch = content.match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
            const locationMatch = content.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})/);
            const linkedinMatch = content.match(/(linkedin\.com\/in\/[\w-]+)/i);

            // HEADER - Name (centered, bold, larger font)
            doc.setFont('times', 'bold');
            doc.setFontSize(14);
            const nameWidth = doc.getTextWidth(name.toUpperCase());
            doc.text(name.toUpperCase(), (pageWidth - nameWidth) / 2, yPos);
            yPos += 5;

            // Contact info (centered, smaller font)
            doc.setFont('times', 'normal');
            doc.setFontSize(10);
            const contactParts = [];
            if (locationMatch) contactParts.push(locationMatch[1]);
            if (phoneMatch) contactParts.push(`P: ${phoneMatch[0]}`);
            if (emailMatch) contactParts.push(emailMatch[0]);
            if (linkedinMatch) contactParts.push(linkedinMatch[1]);

            const contactLine = contactParts.join(' | ');
            const contactWidth = doc.getTextWidth(contactLine);
            doc.text(contactLine, (pageWidth - contactWidth) / 2, yPos);
            yPos += 8;

            // Parse sections with better detection
            const commonSections = [
                'EDUCATION', 'EXPERIENCE', 'WORK EXPERIENCE', 'SKILLS',
                'PROFESSIONAL EXPERIENCE', 'SUMMARY', 'OBJECTIVE', 'PROJECTS',
                'CERTIFICATIONS', 'AWARDS', 'PUBLICATIONS', 'LANGUAGES',
                'ACTIVITIES', 'LEADERSHIP', 'VOLUNTEER', 'INTERESTS'
            ];

            const sections: Array<{ title: string, content: string }> = [];
            const lines = content.split('\n');
            let currentSection = { title: '', content: '' };

            // If no sections detected, treat entire content as one section
            const hasAnySections = lines.some(line => {
                const trimmed = line.trim().toUpperCase();
                return commonSections.some(sec => trimmed === sec || trimmed.includes(sec));
            });

            if (!hasAnySections) {
                // No sections found - create a single "PROFESSIONAL SUMMARY" section
                sections.push({
                    title: 'PROFESSIONAL SUMMARY',
                    content: lines.filter(l => l.trim()).join('\n')
                });
            } else {
                lines.forEach(line => {
                    const trimmed = line.trim();
                    const upperTrimmed = trimmed.toUpperCase();

                    // Check if this line is a section header
                    const isSection = commonSections.some(sec =>
                        upperTrimmed === sec || (upperTrimmed.includes(sec) && trimmed.length < 40)
                    );

                    if (isSection && trimmed.length < 40) {
                        if (currentSection.title || currentSection.content.trim()) {
                            sections.push(currentSection);
                        }
                        currentSection = { title: upperTrimmed, content: '' };
                    } else if (trimmed) {
                        currentSection.content += line + '\n';
                    }
                });

                if (currentSection.title || currentSection.content.trim()) {
                    sections.push(currentSection);
                }
            }

            console.log('Parsed sections:', sections.map(s => ({ title: s.title, contentLength: s.content.length })));

            // Render each section
            sections.forEach(section => {
                checkPageOverflow(15);

                // Section header with underline
                doc.setFont('times', 'bold');
                doc.setFontSize(10);
                doc.text(section.title, leftMargin, yPos);

                // Underline
                const headerWidth = doc.getTextWidth(section.title);
                doc.setDrawColor(0);
                doc.setLineWidth(0.5);
                doc.line(leftMargin, yPos + 1, pageWidth - rightMargin, yPos + 1);
                yPos += 6;

                // Section content
                doc.setFont('times', 'normal');
                doc.setFontSize(10);

                const contentLines = section.content.split('\n').filter(l => l.trim());

                contentLines.forEach((line, idx) => {
                    checkPageOverflow(6);

                    const trimmed = line.trim();
                    if (!trimmed) return;

                    // Check if it's a job/organization header (bold)
                    const isOrgHeader = /^[A-Z\s&]+$/.test(trimmed) && trimmed.length < 60;
                    const isJobTitle = /^[A-Z][a-zA-Z\s,\-\/]+$/.test(trimmed) && !isOrgHeader && trimmed.length < 80;

                    // Check for dates on the right
                    const dateMatch = line.match(/\s{2,}(.+\d{4})$/);
                    let mainText = line;
                    let dateText = '';

                    if (dateMatch) {
                        dateText = dateMatch[1].trim();
                        mainText = line.substring(0, dateMatch.index).trim();
                    }

                    // Bullet points
                    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.match(/^[\u2022\u2023\u25E6\u2043\u2219]/)) {
                        const bulletText = trimmed.replace(/^[•\-\*\u2022\u2023\u25E6\u2043\u2219]\s*/, '').trim();
                        doc.setFont('times', 'normal');
                        doc.text('•', leftMargin + 3, yPos);
                        const wrapped = doc.splitTextToSize(bulletText, contentWidth - 8);
                        wrapped.forEach((wLine: string, wIdx: number) => {
                            if (wIdx > 0) {
                                checkPageOverflow(5);
                            }
                            doc.text(wLine, leftMargin + 8, yPos);
                            yPos += 4;
                        });
                    }
                    // Organization/Job headers
                    else if (isOrgHeader || isJobTitle) {
                        doc.setFont('times', isOrgHeader ? 'bold' : 'italic');
                        doc.text(mainText, leftMargin, yPos);
                        if (dateText) {
                            doc.setFont('times', 'italic');
                            const dateWidth = doc.getTextWidth(dateText);
                            doc.text(dateText, pageWidth - rightMargin - dateWidth, yPos);
                        }
                        yPos += 5;
                    }
                    // Regular content
                    else {
                        doc.setFont('times', 'normal');
                        const wrapped = doc.splitTextToSize(mainText, dateText ? contentWidth - 40 : contentWidth);
                        wrapped.forEach((wLine: string, wIdx: number) => {
                            if (wIdx > 0) checkPageOverflow(5);
                            doc.text(wLine, leftMargin, yPos);
                            if (wIdx === 0 && dateText) {
                                doc.setFont('times', 'italic');
                                const dateWidth = doc.getTextWidth(dateText);
                                doc.text(dateText, pageWidth - rightMargin - dateWidth, yPos);
                                doc.setFont('times', 'normal');
                            }
                            yPos += 4;
                        });
                    }
                });

                yPos += 3;
            });

            // Save
            doc.save(`${name.replace(/\s+/g, '_')}_Harvard_Style.pdf`);
        } catch (err) {
            console.error('Failed to generate Harvard CV:', err);
            setError('Failed to download Harvard-style CV');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    };

    const getScoreColor = (score?: number) => {
        if (!score) return 'gray';
        if (score >= 80) return 'green';
        if (score >= 60) return 'yellow';
        return 'red';
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                    />
                </div>
            </DashboardLayout>
        );
    }


    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 flex items-center gap-4">
                            <span className="text-5xl">📄</span>
                            CV Manager
                        </h1>
                        <p className="text-lg text-gray-600">Manage, analyze, and optimize your resumes with AI-powered tools</p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2, boxShadow: '0 12px 35px rgba(101, 202, 225, 0.35)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowUploadModal(true)}
                            className="px-7 py-3.5 bg-white border-2 border-[#65cae1] text-[#4db8d4] rounded-xl font-semibold hover:bg-[#e0f7fc] shadow-lg transition-all"
                        >
                            📤 Upload CV
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2, boxShadow: '0 15px 40px rgba(101, 202, 225, 0.5)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowGenerateModal(true)}
                            className="px-7 py-3.5 text-white rounded-xl font-semibold shadow-lg"
                            style={{ backgroundImage: 'linear-gradient(135deg, #65cae1, #4db8d4)', boxShadow: '0 10px 30px rgba(101, 202, 225, 0.4)' }}
                        >
                            ✨ Generate with AI
                        </motion.button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                    {[
                        {
                            icon: '🎯',
                            title: 'ATS Score Check',
                            desc: 'Get your resume scored instantly',
                            color: 'from-[#65cae1] to-[#4db8d4]',
                            onClick: () => {
                                if (resumes.length > 0) {
                                    setSelectedResume(resumes[0]);
                                    setShowATSModal(true);
                                } else {
                                    setError('Upload a resume first');
                                }
                            },
                        },
                        {
                            icon: '✍️',
                            title: 'AI Rewrite Section',
                            desc: 'Improve any section',
                            color: 'from-[#65cae1] to-[#4db8d4]',
                            onClick: () => {
                                if (resumes.length > 0) {
                                    setSelectedResume(resumes[0]);
                                    setShowRewriteModal(true);
                                } else {
                                    setError('Upload a resume first');
                                }
                            },
                        },
                        {
                            icon: '📊',
                            title: 'Compare Versions',
                            desc: 'See what changed',
                            color: 'from-[#65cae1] to-[#4db8d4]',
                            onClick: () => {
                                if (resumes.length > 0) {
                                    setSelectedResume(resumes[0]);
                                    setShowCompareModal(true);
                                } else {
                                    setError('Upload a resume first');
                                }
                            },
                        },
                    ].map((action, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.12, type: 'spring', stiffness: 100 }}
                            whileHover={{ y: -8, scale: 1.03, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={action.onClick}
                            className="bg-[#65cae1] rounded-2xl p-7 text-white cursor-pointer shadow-xl transition-all"
                            style={{ boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
                        >
                            <div className="text-5xl mb-4">{action.icon}</div>
                            <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                            <p className="text-sm opacity-95">{action.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-center gap-3"
                        >
                            <span className="text-2xl">⚠️</span>
                            <span className="font-semibold">{error}</span>
                            <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700 font-bold">
                                ✕
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Resumes List */}
                <div className="space-y-4">
                    {resumes.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 100 }}
                            className="text-center py-20 bg-white rounded-3xl border-2 border-dashed shadow-inner"
                            style={{ borderColor: 'rgba(101, 202, 225, 0.4)' }}
                        >
                            <div className="text-7xl mb-6">📄</div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-3">No CVs Yet</h3>
                            <p className="text-lg text-gray-600 mb-8">Upload your first CV or generate one with AI-powered tools</p>
                            <div className="flex gap-4 justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -3, boxShadow: '0 20px 40px rgba(101, 202, 225, 0.4)' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowUploadModal(true)}
                                    className="px-8 py-4 text-white rounded-xl font-semibold text-lg"
                                    style={{ backgroundImage: 'linear-gradient(135deg, #65cae1, #4db8d4)', boxShadow: '0 10px 30px rgba(101, 202, 225, 0.35)' }}
                                >
                                    📤 Upload CV
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -3, boxShadow: '0 20px 40px rgba(101, 202, 225, 0.4)' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowGenerateModal(true)}
                                    className="px-8 py-4 text-white rounded-xl font-semibold text-lg"
                                    style={{ backgroundImage: 'linear-gradient(135deg, #4db8d4, #3a9fb5)', boxShadow: '0 10px 30px rgba(77, 184, 212, 0.35)' }}
                                >
                                    ✨ Generate with AI
                                </motion.button>
                            </div>
                        </motion.div>
                    ) : (
                        resumes.map((resume, i) => (
                            <motion.div
                                key={resume._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08, type: 'spring', stiffness: 100 }}
                                whileHover={{ y: -4, boxShadow: '0 25px 50px rgba(101, 202, 225, 0.3)' }}
                                className="bg-white rounded-2xl p-7 shadow-lg border-2 transition-all"
                                style={{ borderColor: 'rgba(101, 202, 225, 0.25)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' }}
                            >
                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                                            style={{ backgroundImage: 'linear-gradient(to right, #65cae1, #4db8d4)' }}>
                                            📄
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                <h3 className="text-xl font-bold text-gray-800">{resume.title}</h3>
                                                {resume.isPrimary && (
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                        PRIMARY
                                                    </span>
                                                )}
                                                {resume.atsScore && (
                                                    <span
                                                        className={`px-3 py-1 bg-${getScoreColor(resume.atsScore)}-100 text-${getScoreColor(resume.atsScore)}-700 rounded-full text-xs font-bold`}
                                                    >
                                                        ATS: {resume.atsScore}%
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">Updated {formatDate(resume.updatedAt)}</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {resume.versions && resume.versions.length > 0 && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium"
                                                        style={{ background: 'rgba(101, 202, 225, 0.15)', color: '#4db8d4' }}>
                                                        📚 {resume.versions.length} versions
                                                    </span>
                                                )}
                                                {resume.tags?.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-3 py-1 rounded-full text-xs font-medium"
                                                        style={{ background: 'rgba(101, 202, 225, 0.15)', color: '#4db8d4' }}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-wrap items-center">
                                        <motion.button
                                            whileHover={{ scale: 1.05, y: -2, boxShadow: '0 10px 25px rgba(101, 202, 225, 0.35)' }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleViewResume(resume)}
                                            className="px-5 py-2.5 rounded-xl shadow-md border-2 border-[#65cae1] text-[#4db8d4] font-semibold bg-white hover:bg-[#e0f7fc] transition-all"
                                            title="View Resume"
                                        >
                                            View
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05, y: -2, boxShadow: '0 10px 25px rgba(239, 68, 68, 0.25)' }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleDeleteResume(resume._id)}
                                            className="px-5 py-2.5 rounded-xl shadow-md border-2 border-red-400 text-red-600 font-semibold bg-white hover:bg-red-50 transition-all"
                                            title="Delete Resume"
                                        >
                                            Delete
                                        </motion.button>
                                        <div className="relative" style={{ zIndex: 1000 }}>
                                            <motion.button
                                                whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setOpenMenuId(openMenuId === resume._id ? null : resume._id)}
                                                className="px-2.5 py-2.5 rounded-full border-2 border-gray-300 bg-white hover:bg-gray-100 text-gray-700 shadow-md ml-2 focus:outline-none focus:ring-2 focus:ring-[#65cae1] focus:border-[#65cae1]"
                                                title="More actions"
                                                aria-haspopup="true"
                                                aria-expanded={openMenuId === resume._id}
                                            >
                                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2" fill="currentColor" /><circle cx="12" cy="12" r="2" fill="currentColor" /><circle cx="19" cy="12" r="2" fill="currentColor" /></svg>
                                            </motion.button>
                                            <AnimatePresence>
                                                {openMenuId === resume._id && (
                                                    <motion.div
                                                        key="dropdown-bg"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="fixed inset-0"
                                                        style={{ zIndex: 999 }}
                                                        onClick={() => setOpenMenuId(null)}
                                                        aria-hidden="true"
                                                    />
                                                )}
                                            </AnimatePresence>
                                            <AnimatePresence>
                                                {openMenuId === resume._id && (
                                                    <motion.div
                                                        key="dropdown-menu"
                                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                                        className="absolute right-0 mt-3 w-52 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
                                                        style={{ minWidth: 200, boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(101, 202, 225, 0.1)', zIndex: 1001 }}
                                                        tabIndex={-1}
                                                    >
                                                        <motion.button
                                                            whileHover={{ backgroundColor: '#e0f7fc', x: 4 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => { handleDownloadHarvardCV(resume); setOpenMenuId(null); }}
                                                            className="block w-full text-left px-5 py-3.5 text-[#4db8d4] font-semibold border-b border-gray-100 focus:bg-[#e0f7fc] focus:outline-none transition-all"
                                                        >
                                                            📥 Download
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ backgroundColor: '#e0f7fc', x: 4 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => { setSelectedResume(resume); setShowATSModal(true); setOpenMenuId(null); }}
                                                            className="block w-full text-left px-5 py-3.5 text-[#4db8d4] font-semibold border-b border-gray-100 focus:bg-[#e0f7fc] focus:outline-none transition-all"
                                                        >
                                                            📊 ATS Score
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ backgroundColor: '#e0f7fc', x: 4 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => { setSelectedResume(resume); setShowRewriteModal(true); setOpenMenuId(null); }}
                                                            className="block w-full text-left px-5 py-3.5 text-[#4db8d4] font-semibold border-b border-gray-100 focus:bg-[#e0f7fc] focus:outline-none transition-all"
                                                        >
                                                            ✍️ Rewrite
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ backgroundColor: '#e0f7fc', x: 4 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => { setSelectedResume(resume); setShowCompareModal(true); setOpenMenuId(null); }}
                                                            className="block w-full text-left px-5 py-3.5 text-[#4db8d4] font-semibold focus:bg-[#e0f7fc] focus:outline-none transition-all"
                                                        >
                                                            🔄 Compare
                                                        </motion.button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Upload Modal */}
                <AnimatePresence>
                    {showUploadModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => !uploading && setShowUploadModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <span className="text-3xl">📤</span>
                                    Upload Resume PDF
                                </h2>

                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Upload PDF File
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            onChange={handleFileUpload}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold"
                                            style={{ '--tw-ring-color': '#65cae1' } as any}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        📄 Upload your LinkedIn resume PDF or any other professional CV in PDF format
                                    </p>
                                </div>

                                {uploadFile && (
                                    <div className="mb-4 p-4 rounded-xl border-2"
                                        style={{ background: 'rgba(101, 202, 225, 0.1)', borderColor: 'rgba(101, 202, 225, 0.3)' }}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">📄</span>
                                            <div className="flex-1">
                                                <p className="font-semibold text-blue-800">{uploadFile.name}</p>
                                                <p className="text-sm text-blue-600">
                                                    {(uploadFile.size / 1024).toFixed(2)} KB
                                                    {uploadContent ? ' • Text extracted successfully' : ' • Extracting text...'}
                                                </p>
                                            </div>
                                            {uploadContent ? (
                                                <span className="text-green-600 text-xl">✓</span>
                                            ) : (
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                    className="w-5 h-5 border-2 border-t-transparent rounded-full"
                                                    style={{ borderColor: '#65cae1', borderTopColor: 'transparent' }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Resume Title
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Senior Developer CV 2025"
                                        value={uploadTitle}
                                        onChange={(e) => setUploadTitle(e.target.value)}
                                        className="w-full px-5 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowUploadModal(false)}
                                        disabled={uploading}
                                        className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold disabled:opacity-50 hover:bg-gray-300 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading || !uploadFile || !uploadContent}
                                        className="flex-1 py-3 text-white rounded-xl font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
                                        style={{ backgroundImage: 'linear-gradient(to right, #65cae1, #4db8d4)', boxShadow: '0 8px 20px rgba(101, 202, 225, 0.3)' }}
                                    >
                                        {uploading ? '🔄 Uploading & Analyzing...' : uploadFile && !uploadContent ? '⏳ Processing PDF...' : '📤 Upload & Analyze'}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Generate Modal */}
                <AnimatePresence>
                    {showGenerateModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => !generating && setShowGenerateModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="bg-white rounded-3xl p-8 max-w-md w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                    <span className="text-3xl">✨</span>
                                    Generate Resume with AI
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    AI will create a professional resume from your profile data
                                </p>

                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Template Style
                                    </label>
                                    <select
                                        value={generateTemplate}
                                        onChange={(e) => setGenerateTemplate(e.target.value)}
                                        className="w-full px-5 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                                    >
                                        <option value="harvard">📜 Harvard - Classic & Professional</option>
                                        <option value="modern">🎨 Modern - Clean & Contemporary</option>
                                        <option value="minimalist">✨ Minimalist - Simple & Elegant</option>
                                        <option value="creative">🎭 Creative - Bold & Unique</option>
                                    </select>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Target Role
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Senior Software Engineer"
                                        value={generateRole}
                                        onChange={(e) => setGenerateRole(e.target.value)}
                                        className="w-full px-5 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowGenerateModal(false)}
                                        disabled={generating}
                                        className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold disabled:opacity-50 hover:bg-gray-300 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={generating}
                                        className="flex-1 py-3 text-white rounded-xl font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
                                        style={{ backgroundImage: 'linear-gradient(to right, #65cae1, #4db8d4)', boxShadow: '0 8px 20px rgba(101, 202, 225, 0.3)' }}
                                    >
                                        {generating ? 'Generating...' : '✨ Generate'}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* ATS Score Modal */}
                <AnimatePresence>
                    {showATSModal && selectedResume && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => !analyzing && setShowATSModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                    <span className="text-3xl">🎯</span>
                                    ATS Score Analysis - {selectedResume.title}
                                </h2>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Job Description (Optional)
                                    </label>
                                    <textarea
                                        placeholder="Paste the job description here for targeted analysis..."
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        rows={4}
                                        className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:outline-none transition-all resize-none text-sm"
                                        style={{ '--tw-ring-color': '#65cae1' } as any}
                                    />
                                </div>

                                {!atsResult ? (
                                    <button
                                        onClick={handleATSScore}
                                        disabled={analyzing}
                                        className="w-full py-4 text-white rounded-xl font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all mb-4"
                                        style={{ backgroundImage: 'linear-gradient(to right, #65cae1, #4db8d4)', boxShadow: '0 8px 20px rgba(101, 202, 225, 0.3)' }}
                                    >
                                        {analyzing ? '🔄 Analyzing Resume...' : '🎯 Analyze ATS Score'}
                                    </button>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        {/* Score Display */}
                                        <div className="bg-linear-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-white text-center">
                                            <div className="text-6xl font-bold mb-2">{atsResult.score}%</div>
                                            <div className="text-xl opacity-90">ATS Compatibility Score</div>
                                        </div>

                                        {/* Strengths */}
                                        {atsResult.strengths?.length > 0 && (
                                            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                                                <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
                                                    ✅ Strengths
                                                </h3>
                                                <ul className="space-y-2">
                                                    {atsResult.strengths.map((strength: string, i: number) => (
                                                        <li key={i} className="text-green-700 flex items-start gap-2">
                                                            <span className="mt-1">•</span>
                                                            <span>{strength}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Weaknesses */}
                                        {atsResult.weaknesses?.length > 0 && (
                                            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                                                <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center gap-2">
                                                    ⚠️ Areas to Improve
                                                </h3>
                                                <ul className="space-y-2">
                                                    {atsResult.weaknesses.map((weakness: string, i: number) => (
                                                        <li key={i} className="text-red-700 flex items-start gap-2">
                                                            <span className="mt-1">•</span>
                                                            <span>{weakness}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Suggestions */}
                                        {atsResult.suggestions?.length > 0 && (
                                            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                                                <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
                                                    💡 Suggestions
                                                </h3>
                                                <ul className="space-y-2">
                                                    {atsResult.suggestions.map((suggestion: string, i: number) => (
                                                        <li key={i} className="text-blue-700 flex items-start gap-2">
                                                            <span className="mt-1">•</span>
                                                            <span>{suggestion}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Keywords */}
                                        {atsResult.keywordMatches?.length > 0 && (
                                            <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
                                                <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center gap-2">
                                                    🔑 Keyword Matches
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {atsResult.keywordMatches.map((keyword: string, i: number) => (
                                                        <span
                                                            key={i}
                                                            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                                                        >
                                                            {keyword}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => {
                                                setATSResult(null);
                                                setJobDescription('');
                                            }}
                                            className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                                        >
                                            🔄 Analyze Again
                                        </button>
                                    </motion.div>
                                )}

                                <button
                                    onClick={() => {
                                        setShowATSModal(false);
                                        setATSResult(null);
                                        setJobDescription('');
                                    }}
                                    className="w-full mt-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                                >
                                    Close
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* AI Rewrite Modal */}
                <AnimatePresence>
                    {showRewriteModal && selectedResume && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => !rewriting && setShowRewriteModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                    <span className="text-3xl">✍️</span>
                                    AI Rewrite Section - {selectedResume.title}
                                </h2>

                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Section to Rewrite
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Professional Summary, Work Experience"
                                            value={rewriteSection}
                                            onChange={(e) => setRewriteSection(e.target.value)}
                                            className="w-full px-5 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Target Role (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Senior Software Engineer"
                                            value={rewriteTarget}
                                            onChange={(e) => setRewriteTarget(e.target.value)}
                                            className="w-full px-5 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Current Content
                                    </label>
                                    <textarea
                                        placeholder="Paste the section content you want to improve..."
                                        value={rewriteContent}
                                        onChange={(e) => setRewriteContent(e.target.value)}
                                        rows={6}
                                        className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all resize-none font-mono text-sm"
                                    />
                                </div>

                                {!rewriteResult ? (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowRewriteModal(false)}
                                            disabled={rewriting}
                                            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold disabled:opacity-50 hover:bg-gray-300 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleRewrite}
                                            disabled={rewriting}
                                            className="flex-1 py-4 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
                                        >
                                            {rewriting ? '🔄 Rewriting with AI...' : '✍️ Rewrite with AI'}
                                        </button>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
                                                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                                    📝 Original
                                                </h3>
                                                <p className="text-gray-700 whitespace-pre-wrap text-sm">
                                                    {rewriteResult.original}
                                                </p>
                                            </div>
                                            <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
                                                <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center gap-2">
                                                    ✨ AI Improved
                                                </h3>
                                                <p className="text-purple-900 whitespace-pre-wrap text-sm font-medium">
                                                    {rewriteResult.rewritten}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                                            <p className="text-sm text-blue-700">
                                                <strong>Version {rewriteResult.versionNumber}</strong> saved to history
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setRewriteResult(null);
                                                    setRewriteSection('');
                                                    setRewriteContent('');
                                                    setRewriteTarget('');
                                                }}
                                                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                                            >
                                                🔄 Rewrite Another Section
                                            </button>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(rewriteResult.rewritten);
                                                }}
                                                className="flex-1 py-3 bg-[#65cae1] text-white rounded-xl font-semibold hover:bg-[#4db8d4] transition-all"
                                                style={{ boxShadow: '0 8px 20px rgba(101, 202, 225, 0.3)' }}
                                            >
                                                Copy Improved Version
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                <button
                                    onClick={() => {
                                        setShowRewriteModal(false);
                                        setRewriteResult(null);
                                        setRewriteSection('');
                                        setRewriteContent('');
                                        setRewriteTarget('');
                                    }}
                                    className="w-full mt-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                                >
                                    Close
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Compare Versions Modal */}
                <AnimatePresence>
                    {showCompareModal && selectedResume && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => !comparing && setShowCompareModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="bg-white rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                    <span className="text-3xl">📊</span>
                                    Compare Versions - {selectedResume.title}
                                </h2>

                                {selectedResume.versions && selectedResume.versions.length > 0 && (
                                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Version 1 (0 = Current)
                                            </label>
                                            <select
                                                value={compareVersion1}
                                                onChange={(e) => setCompareVersion1(Number(e.target.value))}
                                                className="w-full px-5 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all"
                                            >
                                                <option value={0}>Current Version</option>
                                                {selectedResume.versions.map((v) => (
                                                    <option key={v.versionNumber} value={v.versionNumber}>
                                                        Version {v.versionNumber} - {v.changes}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Version 2 (0 = Current)
                                            </label>
                                            <select
                                                value={compareVersion2}
                                                onChange={(e) => setCompareVersion2(Number(e.target.value))}
                                                className="w-full px-5 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all"
                                            >
                                                <option value={0}>Current Version</option>
                                                {selectedResume.versions.map((v) => (
                                                    <option key={v.versionNumber} value={v.versionNumber}>
                                                        Version {v.versionNumber} - {v.changes}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {!compareResult ? (
                                    <button
                                        onClick={handleCompare}
                                        disabled={comparing}
                                        className="w-full py-4 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all mb-4"
                                    >
                                        {comparing ? '🔄 Comparing Versions...' : '📊 Compare Versions'}
                                    </button>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div className="rounded-xl p-4 text-center" style={{ background: '#65cae1', border: '2px solid #4db8d4', color: '#fff' }}>
                                                <h3 className="font-bold mb-1" style={{ color: '#fff' }}>{compareResult.version1.label}</h3>
                                                {compareResult.version1.atsScore && (
                                                    <p className="text-2xl font-bold" style={{ color: '#fff' }}>
                                                        ATS: {compareResult.version1.atsScore}%
                                                    </p>
                                                )}
                                            </div>
                                            <div className="rounded-xl p-4 text-center" style={{ background: '#65cae1', border: '2px solid #4db8d4', color: '#fff' }}>
                                                <h3 className="font-bold mb-1" style={{ color: '#fff' }}>{compareResult.version2.label}</h3>
                                                {compareResult.version2.atsScore && (
                                                    <p className="text-2xl font-bold" style={{ color: '#fff' }}>
                                                        ATS: {compareResult.version2.atsScore}%
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-2xl p-4 max-h-[500px] overflow-auto">
                                                <h4 className="font-bold text-gray-800 mb-3 sticky top-0 bg-gray-50 pb-2">{compareResult.version1.label}</h4>
                                                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{compareResult.version1.content}</pre>
                                            </div>
                                            <div className="bg-blue-50 rounded-2xl p-4 max-h-[500px] overflow-auto">
                                                <h4 className="font-bold text-blue-800 mb-3 sticky top-0 bg-blue-50 pb-2">{compareResult.version2.label}</h4>
                                                <pre className="text-xs text-blue-900 whitespace-pre-wrap font-mono">{compareResult.version2.content}</pre>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setCompareResult(null)}
                                            className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                                        >
                                            🔄 Compare Different Versions
                                        </button>
                                    </motion.div>
                                )}

                                <button
                                    onClick={() => {
                                        setShowCompareModal(false);
                                        setCompareResult(null);
                                        setCompareVersion1(0);
                                        setCompareVersion2(0);
                                    }}
                                    className="w-full mt-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                                >
                                    Close
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </DashboardLayout>
    );
}
