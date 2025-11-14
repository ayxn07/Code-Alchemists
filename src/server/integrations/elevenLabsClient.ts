import { env } from '@/src/config/env';

export interface TTSOptions {
    text: string;
    voiceId?: string;
    stability?: number;
    similarityBoost?: number;
}

/**
 * ElevenLabs Text-to-Speech Client
 */
export async function generateSpeech(options: TTSOptions): Promise<ArrayBuffer> {
    const apiKey = env.elevenLabs.apiKey;
    const voiceId = options.voiceId || env.elevenLabs.voiceId || '21m00Tcm4TlvDq8ikWAM'; // Default voice

    if (!apiKey) {
        throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text: options.text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: options.stability || 0.5,
                    similarity_boost: options.similarityBoost || 0.75,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
        }

        return await response.arrayBuffer();
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
