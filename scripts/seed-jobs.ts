// Load environment variables FIRST before any other imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import mongoose from 'mongoose';
import { JobModel } from '../src/server/db/models';

async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI not found in .env.local');
    }
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
}

const mockJobs = [
    {
        externalId: 'mock-1',
        provider: 'mock',
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc',
        location: 'San Francisco, CA',
        remote: true,
        postedAt: new Date(),
        url: 'https://example.com/job/1',
        source: 'mock',
        salaryRange: {
            min: 120000,
            max: 180000,
            currency: 'USD',
        },
        rawData: {
            organization_logo: '💼',
            description: 'Build scalable systems with React and Node.js',
        },
    },
    {
        externalId: 'mock-2',
        provider: 'mock',
        title: 'Full Stack Developer',
        company: 'StartupHub',
        location: 'New York, NY',
        remote: false,
        postedAt: new Date(Date.now() - 86400000),
        url: 'https://example.com/job/2',
        source: 'mock',
        salaryRange: {
            min: 100000,
            max: 150000,
            currency: 'USD',
        },
        rawData: {
            organization_logo: '🚀',
            description: 'Work with modern web technologies',
        },
    },
    {
        externalId: 'mock-3',
        provider: 'mock',
        title: 'Data Engineer',
        company: 'DataFlow Solutions',
        location: 'Austin, TX',
        remote: true,
        postedAt: new Date(Date.now() - 172800000),
        url: 'https://example.com/job/3',
        source: 'mock',
        salaryRange: {
            min: 110000,
            max: 160000,
            currency: 'USD',
        },
        rawData: {
            organization_logo: '📊',
            description: 'Build data pipelines with Python and AWS',
        },
    },
    {
        externalId: 'mock-4',
        provider: 'mock',
        title: 'Frontend Developer',
        company: 'Creative Labs',
        location: 'Los Angeles, CA',
        remote: false,
        postedAt: new Date(Date.now() - 259200000),
        url: 'https://example.com/job/4',
        source: 'mock',
        salaryRange: {
            min: 90000,
            max: 130000,
            currency: 'USD',
        },
        rawData: {
            organization_logo: '🎨',
            description: 'Create beautiful UIs with React and TypeScript',
        },
    },
    {
        externalId: 'mock-5',
        provider: 'mock',
        title: 'DevOps Engineer',
        company: 'CloudScale Systems',
        location: 'Seattle, WA',
        remote: true,
        postedAt: new Date(Date.now() - 345600000),
        url: 'https://example.com/job/5',
        source: 'mock',
        salaryRange: {
            min: 115000,
            max: 165000,
            currency: 'USD',
        },
        rawData: {
            organization_logo: '⚙️',
            description: 'Manage infrastructure with Kubernetes and Docker',
        },
    },
    {
        externalId: 'mock-6',
        provider: 'mock',
        title: 'Software Engineering Intern',
        company: 'InnovateX',
        location: 'Boston, MA',
        remote: false,
        postedAt: new Date(Date.now() - 432000000),
        url: 'https://example.com/job/6',
        source: 'mock',
        salaryRange: {
            min: 25,
            max: 35,
            currency: 'USD',
        },
        rawData: {
            organization_logo: '🎓',
            description: 'Learn and grow with experienced engineers',
        },
    },
    {
        externalId: 'mock-7',
        provider: 'mock',
        title: 'Machine Learning Engineer',
        company: 'AI Innovations',
        location: 'United States',
        remote: true,
        postedAt: new Date(Date.now() - 518400000),
        url: 'https://example.com/job/7',
        source: 'mock',
        salaryRange: {
            min: 130000,
            max: 200000,
            currency: 'USD',
        },
        rawData: {
            organization_logo: '🤖',
            description: 'Build cutting-edge ML models with Python and TensorFlow',
        },
    },
    {
        externalId: 'mock-8',
        provider: 'mock',
        title: 'Product Manager',
        company: 'Product Co',
        location: 'Chicago, IL',
        remote: false,
        postedAt: new Date(Date.now() - 604800000),
        url: 'https://example.com/job/8',
        source: 'mock',
        salaryRange: {
            min: 110000,
            max: 150000,
            currency: 'USD',
        },
        rawData: {
            organization_logo: '📱',
            description: 'Lead product strategy and execution',
        },
    },
];

async function seedJobs() {
    try {
        await connectDB();

        // Clear existing mock jobs
        await JobModel.deleteMany({ provider: 'mock' });
        console.log('Cleared existing mock jobs');

        // Insert new mock jobs
        const inserted = await JobModel.insertMany(mockJobs);
        console.log(`Seeded ${inserted.length} mock jobs`);

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seedJobs();
