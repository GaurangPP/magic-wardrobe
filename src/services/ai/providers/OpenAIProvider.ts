import { SYSTEM_PROMPT } from '../prompts';
import { AIProvider, ClothingAnalysis } from '../types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export class OpenAIProvider implements AIProvider {
    private apiKey: string;

    constructor() {
        const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
        if (!key) {
            console.error('[OpenAIProvider] Missing API Key. tailored results will fail.');
            throw new Error('Missing EXPO_PUBLIC_OPENAI_API_KEY');
        }
        this.apiKey = key;
    }

    async analyzeImage(imageUri: string): Promise<ClothingAnalysis> {
        try {
            console.log('[OpenAIProvider] Reading image (Modern Fetch API)...');

            const response = await fetch(imageUri);
            const blob = await response.blob();

            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        resolve(reader.result);
                    } else {
                        reject(new Error('Failed to convert image to base64 string'));
                    }
                };
                reader.onerror = (err) => reject(err);
                reader.readAsDataURL(blob);
            });

            console.log('[OpenAIProvider] Sending request to OpenAI (gpt-4o)...');

            const apiResponse = await fetch(OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: SYSTEM_PROMPT
                        },
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: dataUrl,
                                        detail: 'low',
                                    },
                                },
                            ],
                        },
                    ],
                    response_format: { type: "json_object" },
                    max_tokens: 300,
                }),
            });

            if (!apiResponse.ok) {
                const errorText = await apiResponse.text();
                console.error('[OpenAIProvider] API Error:', apiResponse.status, errorText);
                throw new Error(`OpenAI API Error: ${apiResponse.status}`);
            }

            const data = await apiResponse.json();
            const content = data.choices[0].message.content;

            console.log('[OpenAIProvider] Received response:', content);

            const analysis: ClothingAnalysis = JSON.parse(content);
            return analysis;

        } catch (error) {
            console.error('[OpenAIProvider] Analysis failed:', error);
            throw error;
        }
    }
}
