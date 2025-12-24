import { removeBackground } from '@jacobjmc/react-native-background-remover';
import { File, Paths } from 'expo-file-system';

export const ImageService = {
    /**
     * Moves a captured image from the temporary cache to the permanent app document storage.
     * @param tempUri The temporary URI from the camera.
     * @returns The new permanent URI.
     */
    saveImage: async (tempUri: string): Promise<string> => {
        try {
            const file = new File(tempUri);
            const fileName = file.name;
            const destination = new File(Paths.document, fileName);

            await file.move(destination);
            return destination.uri;
        } catch (error) {
            console.error('[ImageService] Error saving image:', error);
            throw error;
        }
    },

    /**
     * Pre-processes the image before background removal.
     * reserved for future improvements (Lighting, Contrast, resizing).
     * 
     * @param uri The URI of the image to process.
     * @returns The URI of the processed image.
     */
    preprocessImage: async (uri: string): Promise<string> => {
        // Placeholder for future image analysis/optimizations
        // e.g. Lighting correction, contrast adjustment
        return uri;
    },

    /**
     * Removes the background from an image.
     * @param uri The URI of the image to process.
     * @returns The URI of the processed image (transparent PNG).
     */
    removeBackground: async (uri: string): Promise<string> => {
        try {
            console.log('[ImageService] Starting background removal:', uri);

            const processedUri = await ImageService.preprocessImage(uri);
            const resultUri = await removeBackground(processedUri);

            console.log('[ImageService] Background removed successfully:', resultUri);
            return resultUri;
        } catch (error) {
            console.error('[ImageService] Background removal failed:', error);
            throw error;
        }
    }
};
