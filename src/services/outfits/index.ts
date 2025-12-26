import { getDB } from '@/db/client';

export const OutfitService = {
    /**
     * Saves a confirmed outfit to the history.
     * @param itemIds Array of clothing_item IDs that were in the outfit.
     * @param description Optional description (e.g. "Summer Casual").
     */
    saveOutfit: async (itemIds: number[], description: string = ''): Promise<void> => {
        try {
            const db = await getDB();
            const now = Date.now();

            await db.runAsync(
                `INSERT INTO outfits (items, description, date_worn, created_at) VALUES (?, ?, ?, ?)`,
                [JSON.stringify(itemIds), description, now, now]
            );
            console.log('[OutfitService] Outfit saved to history');
        } catch (error) {
            console.error('[OutfitService] Failed to save outfit:', error);
            throw error;
        }
    },

    /**
     * Retrieves outfit history.
     */
    getHistory: async (): Promise<any[]> => {
        try {
            const db = await getDB();
            const result = await db.getAllAsync('SELECT * FROM outfits ORDER BY date_worn DESC');

            // We need to resolve the item IDs to actual item objects for display.
            // This might be expensive if many items. 
            // Better: Retrieve all items once and map them? Or JOIN?
            // Storage is efficient (JSON IDs), but retrieval needs hydration.

            // Let's fetch all clothing items for mapping
            const allItems = await db.getAllAsync('SELECT * FROM clothing_items');
            const itemMap = new Map(allItems.map((i: any) => [i.id, {
                ...i,
                metadata: JSON.parse(i.metadata)
            }]));

            return result.map((row: any) => {
                const ids = JSON.parse(row.items) as number[];
                const resolvedItems = ids.map(id => itemMap.get(id)).filter(Boolean);

                return {
                    ...row,
                    items: resolvedItems
                };
            });

        } catch (error) {
            console.error('[OutfitService] Failed to get history:', error);
            return [];
        }
    }
};
