import { EmbeddingProvider } from '../types';

const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';

export class VoyageProvider implements EmbeddingProvider {
    private apiKey: string;
    private model: string;

    constructor(model: string = 'voyage-3.5-lite') {
        const key = process.env.EXPO_PUBLIC_VOYAGE_API_KEY;
        if (!key) {
            console.error('[VoyageProvider] Missing API Key. Search will fail.');
            throw new Error('Missing EXPO_PUBLIC_VOYAGE_API_KEY');
        }
        this.apiKey = key;
        this.model = model;
    }

    async generateEmbedding(text: string): Promise<number[]> {
        try {
            console.log(`[VoyageProvider] Generating embedding for text (${text.length} chars)...`);

            const response = await fetch(VOYAGE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: this.model,
                    input: text,
                    input_type: 'document' // Optimized for storage/retrieval
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[VoyageProvider] API Error:', response.status, errorText);
                throw new Error(`Voyage API Error: ${response.status}`);
            }

            const data = await response.json();
            const embedding = data.data[0].embedding;

            console.log('[VoyageProvider] Embedding generated successfully. Dimensions:', embedding.length);
            return embedding;

        } catch (error) {
            console.error('[VoyageProvider] Failed to generate embedding:', error);
            throw error;
        }
    }
}
