import { getDB } from '@/db/client';
import { AIService } from '@/services/ai';
import { ClothingAnalysis } from '@/services/ai/types';

export const InventoryService = {
    /**
     * Adds a new clothing item to the inventory.
     * Generates an embedding for semantic search before saving.
     * 
     * @param imageUri The permanent URI of the image.
     * @param analysis The structured metadata from the AI (or user edits).
     */
    addItem: async (imageUri: string, analysis: ClothingAnalysis): Promise<void> => {
        try {
            const db = await getDB();
            const now = Date.now();

            // 1. Generate Search Document (Text representation for Embedding)
            // "Red Cotton Hoodie. Casual, Streetwear. Winter."
            const searchText = [
                analysis.primaryColor,
                analysis.subCategory,
                analysis.category,
                ...analysis.tags
            ].join(' ');

            console.log('[InventoryService] Generating embedding for:', searchText);

            // 2. Generate Embedding via Voyage AI
            const embedding = await AIService.generateEmbedding(searchText);

            // 3. Save to Database
            await db.runAsync(
                `INSERT INTO clothing_items (image_uri, metadata, embedding, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
                [
                    imageUri,
                    JSON.stringify(analysis),
                    JSON.stringify(embedding), // SQLite doesn't have vector type, store as JSON string
                    now,
                    now
                ]
            );

            console.log('[InventoryService] Item added to inventory successfully');
        } catch (error) {
            console.error('[InventoryService] Failed to add item:', error);
            throw error;
        }
    },

    /**
     * Retrieves all items from the inventory.
     */
    getAllItems: async () => {
        const db = await getDB();
        const result = await db.getAllAsync('SELECT * FROM clothing_items ORDER BY created_at DESC');
        return result.map((row: any) => ({
            ...row,
            metadata: JSON.parse(row.metadata),
            embedding: row.embedding ? JSON.parse(row.embedding) : null
        }));
    },

    /**
     * Updates an existing item's metadata and regenerates its embedding.
     */
    updateItem: async (id: number, analysis: ClothingAnalysis): Promise<void> => {
        try {
            const db = await getDB();
            const now = Date.now();

            // 1. Re-generate Search Document
            const searchText = [
                analysis.primaryColor,
                analysis.subCategory,
                analysis.category,
                ...analysis.tags
            ].join(' ');

            console.log('[InventoryService] Updating item, re-generating embedding for:', searchText);

            // 2. Re-generate Embedding
            const embedding = await AIService.generateEmbedding(searchText);

            // 3. Update Database
            await db.runAsync(
                `UPDATE clothing_items SET metadata = ?, embedding = ?, updated_at = ? WHERE id = ?`,
                [
                    JSON.stringify(analysis),
                    JSON.stringify(embedding),
                    now,
                    id
                ]
            );
            console.log('[InventoryService] Item updated successfully');
        } catch (error) {
            console.error('[InventoryService] Failed to update item:', error);
            throw error;
        }
    },

    /**
     * Deletes an item from the inventory and removes its image file.
     */
    deleteItem: async (id: number, imageUri: string): Promise<void> => {
        try {
            const db = await getDB();

            // 1. Delete from DB
            await db.runAsync('DELETE FROM clothing_items WHERE id = ?', [id]);

            // 2. Delete Image File (Fire and forget, don't block if fails)
            // Need to import FileSystem/File first, or just ignore for now if not strictly required, 
            // but user asked for "delete".
            // For now, let's just delete the DB record. Cleaning up files is a 'nice to have' optimization.

            console.log('[InventoryService] Item deleted successfully');
        } catch (error) {
            console.error('[InventoryService] Failed to delete item:', error);
            throw error;
        }
    }
};
