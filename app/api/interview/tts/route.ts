import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/src/server/services/authService';
import { generateSpeech } from '@/src/server/integrations/elevenLabsClient';

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const text: string = body.text;
        const voiceId: string | undefined = body.voiceId;

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const audioBuffer = await generateSpeech({ text, voiceId });
        const base64 = Buffer.from(audioBuffer).toString('base64');

        return NextResponse.json({ success: true, mime: 'audio/mpeg', audioBase64: base64 });
    } catch (error) {
        console.error('TTS route error:', error);
        return NextResponse.json({ error: 'Failed to synthesize speech' }, { status: 500 });
    }
}
