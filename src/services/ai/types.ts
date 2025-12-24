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
}
