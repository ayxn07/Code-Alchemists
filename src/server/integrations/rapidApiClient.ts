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
 * Search jobs using RapidAPI LinkedIn Job Search API
 * https://rapidapi.com/rockapis-rockapis-default/api/linkedin-job-search-api
 */
export async function searchJobsRapidAPI(
    params: RapidAPIJobSearchParams
): Promise<any[]> {
    const apiKey = env.jobApi.rapidApiKey;

    if (!apiKey) {
        throw new Error('RAPIDAPI_KEY is not configured');
    }

    // Build title filter based on query
    const titleFilter = params.query ? `"${params.query}"` : '"Data Engineer"';

    // Build location filter
    const locationFilter = params.location
        ? `"${params.location}"`
        : '"United States" OR "United Kingdom"';

    // Build URL with query parameters
    const limit = 20;
    const offset = params.page ? (params.page - 1) * limit : 0;
    const url = `https://linkedin-job-search-api.p.rapidapi.com/active-jb-24h?limit=${limit}&offset=${offset}&title_filter=${encodeURIComponent(titleFilter)}&location_filter=${encodeURIComponent(locationFilter)}&description_type=text`;

    console.log('[RapidAPI] Fetching jobs from:', url);
    console.log('[RapidAPI] API Key present:', !!apiKey);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'linkedin-job-search-api.p.rapidapi.com',
            },
        });

        console.log('[RapidAPI] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[RapidAPI] Error response:', errorText);
            throw new Error(`RapidAPI error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('[RapidAPI] Received data type:', typeof data, 'Is array:', Array.isArray(data));
        console.log('[RapidAPI] Jobs count:', Array.isArray(data) ? data.length : 'N/A');

        // The API returns jobs directly in the format we need
        // Ensure each job has the expected structure
        const jobs = Array.isArray(data) ? data : [];

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
