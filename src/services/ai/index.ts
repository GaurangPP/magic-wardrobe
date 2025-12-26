import { OpenAIProvider } from './providers/OpenAIProvider';
import { VoyageProvider } from './providers/VoyageProvider';
import { AIProvider, ClothingAnalysis, EmbeddingProvider } from './types';

class AIServiceInstance {
    private visionProvider: AIProvider;
    private embeddingProvider: EmbeddingProvider;

    constructor() {
        this.visionProvider = new OpenAIProvider();
        this.embeddingProvider = new VoyageProvider();
    }

    public setVisionProvider(provider: AIProvider) {
        this.visionProvider = provider;
    }

    public setEmbeddingProvider(provider: EmbeddingProvider) {
        this.embeddingProvider = provider;
    }

    public async analyzeImage(imageUri: string): Promise<ClothingAnalysis> {
        return this.visionProvider.analyzeImage(imageUri);
    }

    public async generateEmbedding(text: string): Promise<number[]> {
        return this.embeddingProvider.generateEmbedding(text);
    }

    public async generateOutfitDescription(anchor: any, weather: string): Promise<any> {
        // Safe cast or optional chaining if interface allows
        if ('generateOutfitDescription' in this.visionProvider) {
            return (this.visionProvider as any).generateOutfitDescription(anchor, weather);
        }
        return {};
    }
}

export const AIService = new AIServiceInstance();
