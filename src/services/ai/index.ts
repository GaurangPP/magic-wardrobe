import { OpenAIProvider } from './providers/OpenAIProvider';
import { AIProvider, ClothingAnalysis } from './types';

class AIServiceInstance {
    private provider: AIProvider;

    constructor() {
        this.provider = new OpenAIProvider();
    }

    public setProvider(provider: AIProvider) {
        this.provider = provider;
    }

    public async analyzeImage(imageUri: string): Promise<ClothingAnalysis> {
        return this.provider.analyzeImage(imageUri);
    }
}

export const AIService = new AIServiceInstance();
