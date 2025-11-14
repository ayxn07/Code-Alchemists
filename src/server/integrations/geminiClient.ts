import { env } from '@/src/config/env';

export interface GeminiMessage {
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
}

export interface GeminiGenerateOptions {
    messages?: GeminiMessage[];
    prompt?: string;
    temperature?: number;
    maxTokens?: number;
    systemInstruction?: string;
}

export interface GeminiResponse {
    text: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

/**
 * Gemini API Client
 * Generates text completions using Google's Gemini models
 */
export async function generateWithGemini(
    options: GeminiGenerateOptions
): Promise<GeminiResponse> {
    const apiKey = env.geminiApiKey;
    const model = env.geminiModel || 'gemini-1.5-pro';

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
        // Build contents array
        let contents: GeminiMessage[] = [];

        if (options.messages && options.messages.length > 0) {
            contents = options.messages;
        } else if (options.prompt) {
            contents = [
                {
                    role: 'user',
                    parts: [{ text: options.prompt }],
                },
            ];
        } else {
            throw new Error('Either messages or prompt must be provided');
        }

        const requestBody: any = {
            contents,
            generationConfig: {
                temperature: options.temperature || 0.7,
                maxOutputTokens: options.maxTokens || 2048,
            },
        };

        // Add system instruction if provided (Gemini 1.5 Pro supports this)
        if (options.systemInstruction) {
            requestBody.systemInstruction = {
                parts: [{ text: options.systemInstruction }],
            };
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`
            );
        }

        const data = await response.json();

        // Extract text from response
        const text =
            data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Extract usage metadata if available
        const usage = data.usageMetadata
            ? {
                promptTokens: data.usageMetadata.promptTokenCount || 0,
                completionTokens: data.usageMetadata.candidatesTokenCount || 0,
                totalTokens: data.usageMetadata.totalTokenCount || 0,
            }
            : undefined;

        return {
            text,
            usage,
        };
    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
}

/**
 * Helper function for simple text generation
 */
export async function generateText(
    prompt: string,
    systemInstruction?: string
): Promise<string> {
    const response = await generateWithGemini({
        prompt,
        systemInstruction,
        temperature: 0.7,
    });
    return response.text;
}

/**
 * Helper function for chat-style conversations
 */
export async function generateChat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemInstruction?: string
): Promise<string> {
    // Convert to Gemini format
    const geminiMessages: GeminiMessage[] = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
    }));

    const response = await generateWithGemini({
        messages: geminiMessages,
        systemInstruction,
    });

    return response.text;
}

/**
 * Structured output generation with JSON parsing
 */
export async function generateJSON<T = any>(
    prompt: string,
    systemInstruction?: string
): Promise<T> {
    const fullPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON, no markdown or extra text.`;

    const response = await generateWithGemini({
        prompt: fullPrompt,
        systemInstruction,
        temperature: 0.3, // Lower temperature for more consistent JSON
    });

    // Clean response (remove markdown code blocks if present)
    let cleanedText = response.text.trim();
    if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    try {
        return JSON.parse(cleanedText) as T;
    } catch (error) {
        console.error('Failed to parse JSON from Gemini response:', cleanedText);
        throw new Error('Invalid JSON response from Gemini');
    }
}
