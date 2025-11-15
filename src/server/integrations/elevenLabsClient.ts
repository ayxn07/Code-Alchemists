import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { env } from '@/src/config/env';

export interface TTSOptions {
    text: string;
    voiceId?: string;
    stability?: number;
    similarityBoost?: number;
}

// Initialize ElevenLabs client
const client = new ElevenLabsClient({
    apiKey: env.elevenLabs.apiKey,
});

/**
 * ElevenLabs Text-to-Speech Client using official SDK
 */
export async function generateSpeech(options: TTSOptions): Promise<ArrayBuffer> {
    const apiKey = env.elevenLabs.apiKey;
    const voiceId = options.voiceId || env.elevenLabs.voiceId || 'Xb7hH8MSUJpSbSDYk0k2'; // Default voice

    if (!apiKey) {
        throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    try {
        const audio = await client.textToSpeech.convert(voiceId, {
            text: options.text,
            modelId: 'eleven_multilingual_v2', // Updated to free tier model
            outputFormat: 'mp3_44100_128',
            voiceSettings: {
                stability: options.stability || 0.5,
                similarityBoost: options.similarityBoost || 0.75,
            },
        });

        // Convert ReadableStream to ArrayBuffer
        const chunks: Uint8Array[] = [];
        const reader = audio.getReader();

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
            }
        } finally {
            reader.releaseLock();
        }

        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
        }

        return result.buffer;
    } catch (error) {
        console.error('ElevenLabs TTS error:', error);
        throw error;
    }
}

/**
 * Get available voices from ElevenLabs
 */
export async function getVoices(): Promise<any[]> {
    const apiKey = env.elevenLabs.apiKey;

    if (!apiKey) {
        throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: {
                'xi-api-key': apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        const data = await response.json();
        return data.voices || [];
    } catch (error) {
        console.error('Get voices error:', error);
        return [];
    }
}
