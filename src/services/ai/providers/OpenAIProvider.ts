import { CLOTHING_TAGS, STANDARD_SUBCATEGORIES, SYSTEM_PROMPT } from '../prompts';
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

    async generateOutfitDescription(context: { slots: any, locked: any }, weather: string): Promise<any> {
        try {
            // 1. Build a description of what the user is ALREADY wearing (Locked items)
            const lockedDescriptions: string[] = [];

            Object.keys(context.slots).forEach(key => {
                const item = context.slots[key];
                const isLocked = context.locked[key];

                if (item && isLocked) {
                    // Start of Sentence Case
                    const desc = `${item.metadata.primaryColor} ${item.metadata.subCategory} (${item.metadata.category})`;
                    lockedDescriptions.push(desc);
                }
            });

            // If nothing is locked (shouldn't happen given anchor logic, but safe fallback)
            const wearingDesc = lockedDescriptions.length > 0
                ? lockedDescriptions.join(', ')
                : "a randomly selected base item";

            // Construct Prompt
            const prompt = `
            You are a personal stylist. 
            The user is currently wearing these locked items: ${wearingDesc}.
            The weather is: ${weather}.
            
            Suggest the MISSING parts of the outfit to create a cohesive, stylish look that matches the locked items.
            
            CRITICAL: For each suggested item, you must strictly adhere to the defined Subcategories and Tags to ensure database matches.
            
            Available Subcategories:
            ${JSON.stringify(STANDARD_SUBCATEGORIES)}

            Available Tags:
            ${JSON.stringify(CLOTHING_TAGS)}
            
            Return ONLY a JSON object where keys are the slots (Headwear, Outerwear, Tops, Bottoms, Footwear) and values are objects with:
            - subCategory: Must be exact match from list.
            - primaryColor: Dominant color.
            - tags: Array of relevant tags from the list (Material, Style, Occasion).
            - description: Natural language description (e.g. "White linen shirt").

            Slots to consider (fill only if needed/missing):
            - Headwear (E.g. Hats, Sunglasses - optional)
            - Outerwear (E.g. Jackets, Coats - optional, based on weather)
            - Tops (E.g. Shirts, T-shirts - essential if anchor is Bottoms)
            - Bottoms (E.g. Pants, Shorts - essential if anchor is Tops)
            - Footwear (E.g. Sneakers, Boots - essential)

            Example Output:
            {
                "Tops": {
                    "subCategory": "Hoodie",
                    "primaryColor": "Beige",
                    "tags": ["Oversized", "Cotton", "Streetwear"],
                    "description": "Beige oversized cotton hoodie"
                },
                "Footwear": {
                    "subCategory": "Sneakers",
                    "primaryColor": "White",
                    "tags": ["Leather", "Casual", "Minimalist"],
                    "description": "White minimalist leather sneakers"
                }
            }
            `;

            const response = await fetch(OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: 'You are a helpful fashion assistant returning JSON.' },
                        { role: 'user', content: prompt }
                    ],
                    response_format: { type: "json_object" },
                    max_tokens: 500,
                }),
            });

            const data = await response.json();
            const content = data.choices[0].message.content;
            console.log('[OpenAIProvider] Outfit suggestions:', content);

            return JSON.parse(content);

        } catch (error) {
            console.error('[OpenAIProvider] Outfit generation failed:', error);
            // Fallback: return empty to avoid crashing UI
            return {};
        }
    }
}
