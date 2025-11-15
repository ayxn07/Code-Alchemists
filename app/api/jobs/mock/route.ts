import { NextResponse } from 'next/server';

// Mock job data in the exact format from your sample
const MOCK_JOBS = [
    {
        "id": "1901345864",
        "date_posted": "2025-11-14T17:24:21",
        "title": "Senior Data Engineer",
        "organization": "Arrive",
        "organization_url": "https://www.linkedin.com/company/arrive",
        "locations_derived": ["London, England, United Kingdom"],
        "salary_raw": null,
        "employment_type": ["FULL_TIME"],
        "url": "https://uk.linkedin.com/jobs/view/senior-data-engineer-at-arrive-4336091910",
        "source": "linkedin",
        "organization_logo": "https://media.licdn.com/dms/image/v2/D560BAQEd8mnKra0Nxw/company-logo_200_200/B56ZdkhYJZGQAc-/0/1749738161152/arrive_logo?e=2147483647&v=beta&t=ZyWadhpl4T_85Kooj0RPa8W595jdZoLl7l3-_N2ZLKw",
        "remote_derived": false,
        "description_text": "The Role \nWe are looking for a skilled and experienced Senior Data Engineer to join our Data Science team..."
    },
    {
        "id": "1901346716",
        "date_posted": "2025-11-14T17:21:20",
        "title": "Cloud Data Engineer - Snowflake",
        "organization": "TalentAlly",
        "organization_url": "https://www.linkedin.com/company/talentallyatwork",
        "locations_derived": ["Lee's Summit, Missouri, United States"],
        "salary_raw": {
            "currency": "USD",
            "value": {
                "minValue": 94039,
                "maxValue": 132561,
                "unitText": "YEAR"
            }
        },
        "employment_type": ["FULL_TIME"],
        "url": "https://www.linkedin.com/jobs/view/cloud-data-engineer-snowflake-at-talentally-4336081981",
        "source": "linkedin",
        "organization_logo": "https://media.licdn.com/dms/image/v2/D4E0BAQHbDxd4fgyh_A/company-logo_200_200/company-logo_200_200/0/1724678394122/prodivnet_logo?e=2147483647&v=beta&t=va92l3pbyiXjCUkkWYbVGODz5UatZSpfp8nxnbo3knc",
        "remote_derived": false,
        "description_text": "G.E.H.A (Government Employees Health Association, Inc.) is a nonprofit member association..."
    },
    {
        "id": "1901342987",
        "date_posted": "2025-11-14T17:18:05",
        "title": "Lead Data Engineer",
        "organization": "EXL",
        "organization_url": "https://www.linkedin.com/company/exl-service",
        "locations_derived": ["Jersey City, New Jersey, United States"],
        "salary_raw": {
            "currency": "USD",
            "value": {
                "minValue": 130000,
                "maxValue": 145000,
                "unitText": "YEAR"
            }
        },
        "employment_type": ["FULL_TIME"],
        "url": "https://www.linkedin.com/jobs/view/lead-data-engineer-at-exl-4322574384",
        "source": "linkedin",
        "organization_logo": "https://media.licdn.com/dms/image/v2/D4E0BAQHZga8kSwpMTQ/company-logo_200_200/company-logo_200_200/0/1719841183720/exl_service_logo?e=2147483647&v=beta&t=Rh-Qa0qb-BAD5AULwvvtdZYXZguzTxnGFkLcHJ015jE",
        "remote_derived": false,
        "description_text": "Position: Lead Data Engineer\nExperience Required: 12 years+\nLocation: Jersey City , NJ(Hybrid)..."
    },
    {
        "id": "1901344927",
        "date_posted": "2025-11-14T17:10:34",
        "title": "AWS Lead Data Engineer",
        "organization": "Square One Resources",
        "organization_url": "https://www.linkedin.com/company/square-one",
        "locations_derived": ["Glasgow, Scotland, United Kingdom"],
        "salary_raw": null,
        "employment_type": ["CONTRACTOR"],
        "url": "https://uk.linkedin.com/jobs/view/aws-lead-data-engineer-at-square-one-resources-4340811169",
        "source": "linkedin",
        "organization_logo": "https://media.licdn.com/dms/image/v2/D4E0BAQFFVLkHLDtk4g/company-logo_200_200/B4EZm.OWYEIkAI-/0/1759833057145/square_one_logo?e=2147483647&v=beta&t=dgljfLOH3bDC5vNgCG9CuxMpCJuA0tXIv56-ZAy9Cy8",
        "remote_derived": false,
        "description_text": "Location: Glasgow (Hybrid – 2–3 days on-site)\nContract Length: Until 31/12/2026..."
    },
    {
        "id": "1901344964",
        "date_posted": "2025-11-14T17:06:55",
        "title": "Junior Data Engineer",
        "organization": "Oakland Everything Data",
        "organization_url": "https://www.linkedin.com/company/oakland-everythingdata",
        "locations_derived": ["Leeds, England, United Kingdom"],
        "salary_raw": null,
        "employment_type": ["FULL_TIME"],
        "url": "https://uk.linkedin.com/jobs/view/junior-data-engineer-at-oakland-everything-data-4336231411",
        "source": "linkedin",
        "organization_logo": "https://media.licdn.com/dms/image/v2/D4E0BAQG6-gqoSmbthw/company-logo_200_200/B4EZcg1KnZHkAM-/0/1748602498082/oakland_everythingdata_logo?e=2147483647&v=beta&t=m3xMbvJqqx21sHxjMcpH98oTexQj8dRLFyqSUJsqT6w",
        "remote_derived": false,
        "description_text": "About Us: \nAt Oakland, we help businesses unlock the power of their data..."
    }
];

export async function GET() {
    return NextResponse.json({
        success: true,
        jobs: MOCK_JOBS,
        count: MOCK_JOBS.length,
        source: 'Mock Data',
    });
}

export async function POST(request: Request) {
    const body = await request.json();

    // Simple filtering based on query
    let filteredJobs = [...MOCK_JOBS];

    if (body.query) {
        const searchTerm = body.query.toLowerCase();
        filteredJobs = filteredJobs.filter(job =>
            job.title.toLowerCase().includes(searchTerm) ||
            job.organization.toLowerCase().includes(searchTerm) ||
            job.description_text.toLowerCase().includes(searchTerm)
        );
    }

    if (body.location) {
        const locationTerm = body.location.toLowerCase();
        filteredJobs = filteredJobs.filter(job =>
            job.locations_derived.some(loc => loc.toLowerCase().includes(locationTerm))
        );
    }

    if (body.remote) {
        filteredJobs = filteredJobs.filter(job => job.remote_derived);
    }

    return NextResponse.json({
        success: true,
        jobs: filteredJobs,
        count: filteredJobs.length,
        source: 'Mock Data',
    });
}
