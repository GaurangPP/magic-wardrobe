import { getDB } from '@/db/client';
import { AIService } from '@/services/ai';
import { CLOTHING_WEAR_LIMITS } from '@/services/ai/prompts';
import { ClothingAnalysis } from '@/services/ai/types';

export const InventoryService = {
    /**
     * Adds a new clothing item to the inventory.
     * Generates an embedding for semantic search before saving.
     * Determines max_wears based on category.
     * 
     * @param imageUri The permanent URI of the image.
     * @param analysis The structured metadata from the AI (or user edits).
     */
    addItem: async (imageUri: string, analysis: ClothingAnalysis): Promise<void> => {
        try {
            const db = await getDB();
            const now = Date.now();

            // 1. Determine Max Wears
            // Default to 5 if not found, or infinite (represented as very high number in DB? Or handled logic side?)
            // DB column is INTEGER. Let's use 10000 for "Infinity" or just nullable.
            // But we defined DEFAULT 5.
            // Let's implement logic: If CLOTHING_WEAR_LIMITS returns null, stored as NULL in DB.
            // In logic, NULL means infinite.

            const categoryLimits = CLOTHING_WEAR_LIMITS[analysis.category] as Record<string, number | null> | undefined;
            const limit = categoryLimits?.[analysis.subCategory];
            // If undefined, default to 5. If null, use null (SQL).
            const maxWears = limit === undefined ? 5 : limit;


            // 2. Generate Search Document (Text representation for Embedding)
            const searchText = [
                analysis.primaryColor,
                analysis.subCategory,
                analysis.category,
                ...analysis.tags
            ].join(' ');

            console.log('[InventoryService] Generating embedding for:', searchText);

            // 3. Generate Embedding via Voyage AI
            const embedding = await AIService.generateEmbedding(searchText);

            // 4. Save to Database
            await db.runAsync(
                `INSERT INTO clothing_items (image_uri, metadata, embedding, max_wears, wear_count, is_clean, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    imageUri,
                    JSON.stringify(analysis),
                    JSON.stringify(embedding),
                    maxWears, // Can be null
                    0, // wear_count starts at 0
                    true, // is_clean defaults to true
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
            embedding: row.embedding ? JSON.parse(row.embedding) : null,
            // Ensure types are correct
            wear_count: row.wear_count ?? 0,
            max_wears: row.max_wears, // can be null
            is_clean: !!row.is_clean,
            last_worn: row.last_worn
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

            // 3. Update Database (Metadata + Embedding)
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
     * Deletes an item from the inventory.
     */
    deleteItem: async (id: number, imageUri: string): Promise<void> => {
        try {
            const db = await getDB();
            await db.runAsync('DELETE FROM clothing_items WHERE id = ?', [id]);
            // TODO: Delete file logic
            console.log('[InventoryService] Item deleted successfully');
        } catch (error) {
            console.error('[InventoryService] Failed to delete item:', error);
            throw error;
        }
    },

    // --- Laundry / Wear Logic ---

    /**
     * Increment wear count. 
     * Automatically sets is_clean = false if limit is reached.
     */
    markAsWorn: async (id: number): Promise<void> => {
        try {
            const db = await getDB();
            const item = await db.getFirstAsync('SELECT * FROM clothing_items WHERE id = ?', [id]) as any;
            if (!item) throw new Error('Item not found');

            const newCount = (item.wear_count || 0) + 1;
            const maxWears = item.max_wears;
            const now = Date.now();

            // Check if dirty (if maxWears is not null/infinity)
            // If newCount >= maxWears, it becomes dirty.
            // If it was already dirty manually, it stays dirty.
            const shouldBeStatus = (maxWears !== null && newCount >= maxWears) ? 0 : (item.is_clean ? 1 : 0);

            await db.runAsync(
                `UPDATE clothing_items SET wear_count = ?, is_clean = ?, last_worn = ? WHERE id = ?`,
                [newCount, shouldBeStatus, now, id]
            );
            console.log(`[InventoryService] Item ${id} worn. Count: ${newCount}/${maxWears}. Clean: ${shouldBeStatus}`);
        } catch (error) {
            console.error('[InventoryService] Failed to mark as worn:', error);
            throw error;
        }
    },

    /**
     * Decrement wear count (correcting mistakes).
     * If count drops below limit, we responsibly reset clean status IF it was dirty due to wear limit.
     * But effectively, if count < limit, logic suggests it is clean unless manually marked.
     * For user experience: If I un-wear, I expect it to revert to state before wear.
     */
    decrementWear: async (id: number): Promise<void> => {
        try {
            const db = await getDB();
            const item = await db.getFirstAsync('SELECT * FROM clothing_items WHERE id = ?', [id]) as any;
            if (!item) throw new Error('Item not found');

            const newCount = Math.max(0, (item.wear_count || 0) - 1);
            const maxWears = item.max_wears;

            // If we drop below maxWears, we can assume it's clean again?
            // Let's be generous: yes. If you are correcting an over-wear, it becomes clean.
            // Exception: If you manually marked it dirty, maybe we shouldn't?
            // But we don't track *why* it is dirty.
            // Let's go with: If newCount < maxWears, set is_clean = true.

            let shouldBeClean = item.is_clean;
            if (maxWears !== null && newCount < maxWears) {
                shouldBeClean = 1;
            }

            // NOTE: If item matches "Wear +1" behavior, maybe we should toggle.
            // But let's keep it simple. Un-wearing makes it clean if below limit.

            await db.runAsync(
                `UPDATE clothing_items SET wear_count = ?, is_clean = ? WHERE id = ?`,
                [newCount, shouldBeClean ? 1 : 0, id]
            );
            console.log(`[InventoryService] Item ${id} unworn. Count: ${newCount}`);
        } catch (error) {
            console.error('[InventoryService] Failed to decrement wear:', error);
            throw error;
        }
    },

    /**
     * Resets wear count to 0 and sets is_clean = true.
     */
    markAsClean: async (id: number): Promise<void> => {
        try {
            const db = await getDB();
            await db.runAsync(
                `UPDATE clothing_items SET wear_count = 0, is_clean = 1 WHERE id = ?`,
                [id]
            );
            console.log(`[InventoryService] Item ${id} marked as clean`);
        } catch (error) {
            console.error('[InventoryService] Failed to mark as clean:', error);
            throw error;
        }
    },

    /**
     * Manually marks as dirty without incrementing wear count (e.g. spilled coffee).
     */
    markAsDirty: async (id: number): Promise<void> => {
        try {
            const db = await getDB();
            await db.runAsync(
                `UPDATE clothing_items SET is_clean = 0 WHERE id = ?`,
                [id]
            );
            console.log(`[InventoryService] Item ${id} marked as dirty`);
        } catch (error) {
            console.error('[InventoryService] Failed to mark as dirty:', error);
            throw error;
        }
    }
};
