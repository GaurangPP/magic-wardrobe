export type ClothingCategory = 'Headwear' | 'Outerwear' | 'Tops' | 'Bottoms' | 'Footwear' | 'Accessories';

export interface ClothingAnalysis {
    category: ClothingCategory;
    subCategory: string; // Detailed name, e.g. "Graphic T-Shirt"
    primaryColor: string; // Hex code or standard name, e.g. "#000000"
    description: string; // Search-optimized description
    tags: string[]; // e.g. ["Casual", "Cotton", "Streetwear"]
    // Extensible for future fields
    [key: string]: any;
}

export interface AIProvider {
    /**
     * Analyzes an image and extracts structured clothing data.
     * @param imageUri Local file URI of the image to analyze.
     */
    analyzeImage(imageUri: string): Promise<ClothingAnalysis>;

    /**
     * Generates descriptions for matching outfit items based on an anchor item and context.
     * @param anchor The item to build the outfit around.
     * @param weather Current weather description.
     */
    generateOutfitDescription(context: { slots: any, locked: any }, weather: string): Promise<{
        Headwear?: any;
        Outerwear?: any;
        Tops?: any;
        Bottoms?: any;
        Footwear?: any;
    }>;
}

export interface EmbeddingProvider {
    /**
     * Generates a vector embedding for semantic search.
     * @param text The text to embed.
     */
    generateEmbedding(text: string): Promise<number[]>;
}
