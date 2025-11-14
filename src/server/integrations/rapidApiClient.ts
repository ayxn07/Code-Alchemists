import { env } from '@/src/config/env';

export interface RapidAPIJobSearchParams {
    query?: string;
    location?: string;
    remote?: boolean;
    employmentTypes?: string[];
    datePosted?: 'all' | 'today' | 'week' | 'month';
    radius?: number;
    page?: number;
}

export interface NormalizedJob {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    salary?: {
        min?: number;
        max?: number;
        currency?: string;
    };
    type: string;
    remote: boolean;
    postedDate: string;
    applyUrl: string;
    source: string;
}

/**
 * Search jobs using RapidAPI JSearch endpoint
 * https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
 */
export async function searchJobsRapidAPI(
    params: RapidAPIJobSearchParams
): Promise<NormalizedJob[]> {
    const apiKey = env.jobApi.rapidApiKey;

    if (!apiKey) {
        throw new Error('RAPIDAPI_KEY is not configured');
    }

    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.location) queryParams.append('location', params.location);
    if (params.remote) queryParams.append('remote_jobs_only', 'true');
    if (params.datePosted) queryParams.append('date_posted', params.datePosted);
    if (params.page) queryParams.append('page', params.page.toString());

    const url = `https://jsearch.p.rapidapi.com/search?${queryParams.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
            },
        });

        if (!response.ok) {
            throw new Error(`RapidAPI error: ${response.status}`);
        }

        const data = await response.json();

        // Normalize job data
        const jobs: NormalizedJob[] = (data.data || []).map((job: any) => ({
            id: job.job_id || `job-${Date.now()}-${Math.random()}`,
            title: job.job_title || 'Untitled',
            company: job.employer_name || 'Unknown Company',
            location: job.job_city && job.job_country
                ? `${job.job_city}, ${job.job_country}`
                : job.job_country || 'Not specified',
            description: job.job_description || '',
            salary: job.job_min_salary && job.job_max_salary
                ? {
                    min: job.job_min_salary,
                    max: job.job_max_salary,
                    currency: job.job_salary_currency || 'USD',
                }
                : undefined,
            type: job.job_employment_type || 'FULLTIME',
            remote: job.job_is_remote || false,
            postedDate: job.job_posted_at_datetime_utc || new Date().toISOString(),
            applyUrl: job.job_apply_link || job.job_google_link || '#',
            source: 'RapidAPI-JSearch',
        }));

        return jobs;
    } catch (error) {
        console.error('RapidAPI job search error:', error);
        throw error;
    }
}

/**
 * Get job details by ID
 */
export async function getJobDetailsRapidAPI(jobId: string): Promise<NormalizedJob | null> {
    const apiKey = env.jobApi.rapidApiKey;

    if (!apiKey) {
        throw new Error('RAPIDAPI_KEY is not configured');
    }

    try {
        const response = await fetch(
            `https://jsearch.p.rapidapi.com/job-details?job_id=${jobId}`,
            {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
                },
            }
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        const job = data.data?.[0];

        if (!job) return null;

        return {
            id: job.job_id,
            title: job.job_title,
            company: job.employer_name,
            location: job.job_city && job.job_country
                ? `${job.job_city}, ${job.job_country}`
                : job.job_country || 'Not specified',
            description: job.job_description || '',
            salary: job.job_min_salary && job.job_max_salary
                ? {
                    min: job.job_min_salary,
                    max: job.job_max_salary,
                    currency: job.job_salary_currency || 'USD',
                }
                : undefined,
            type: job.job_employment_type || 'FULLTIME',
            remote: job.job_is_remote || false,
            postedDate: job.job_posted_at_datetime_utc || new Date().toISOString(),
            applyUrl: job.job_apply_link || job.job_google_link || '#',
            source: 'RapidAPI-JSearch',
        };
    } catch (error) {
        console.error('Get job details error:', error);
        return null;
    }
}
