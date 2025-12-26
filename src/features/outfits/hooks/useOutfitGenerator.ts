import { AIService } from '@/services/ai';
import { InventoryService } from '@/services/inventory';
import { OutfitService } from '@/services/outfits';
import { WeatherService } from '@/services/weather';
import { useCallback, useEffect, useState } from 'react';

export type OutfitSlots = {
    Headwear: any | null;
    Outerwear: any | null;
    Tops: any | null;
    Bottoms: any | null;
    Footwear: any | null;
};

export type LockedSlots = {
    Headwear: boolean;
    Outerwear: boolean;
    Tops: boolean;
    Bottoms: boolean;
    Footwear: boolean;
};

export const useOutfitGenerator = () => {
    // State for managing candidates (for navigation)
    const [slotOptions, setSlotOptions] = useState<Record<keyof OutfitSlots, any[]>>({
        Headwear: [],
        Outerwear: [],
        Tops: [],
        Bottoms: [],
        Footwear: []
    });

    const [slotIndices, setSlotIndices] = useState<Record<keyof OutfitSlots, number>>({
        Headwear: 0,
        Outerwear: 0,
        Tops: 0,
        Bottoms: 0,
        Footwear: 0
    });

    const [slots, setSlots] = useState<OutfitSlots>({
        Headwear: null,
        Outerwear: null,
        Tops: null,
        Bottoms: null,
        Footwear: null,
    });

    const [locked, setLocked] = useState<LockedSlots>({
        Headwear: false,
        Outerwear: false,
        Tops: false,
        Bottoms: false,
        Footwear: false,
    });

    const [loading, setLoading] = useState(false);
    const [weather, setWeather] = useState<string | null>(null);

    // Initial Weather Fetch
    useEffect(() => {
        const loadWeather = async () => {
            try {
                const loc = await WeatherService.getLocation();
                if (loc) {
                    const wData = await WeatherService.getCurrentWeather(loc.lat, loc.lon);
                    if (wData) {
                        setWeather(`${wData.description}, ${wData.temperature}°F`);
                    }
                }
            } catch (e) {
                console.error('Failed to load weather', e);
                setWeather('Weather Unavailable');
            }
        };
        loadWeather();
    }, []);

    /**
     * Toggles lock status for a slot.
     */
    const toggleLock = (slot: keyof LockedSlots) => {
        setLocked(prev => ({ ...prev, [slot]: !prev[slot] }));
    };

    /**
     * Step 1: Initialize/Remix Logic
     * If Bottoms are present/locked, they act as Anchor.
     * Otherwise, we pick a random bottom to start.
     */
    const generateOutfit = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Get Weather (if not already fetched)
            let currentWeather = weather;
            if (!currentWeather) {
                const loc = await WeatherService.getLocation();
                if (loc) {
                    const wData = await WeatherService.getCurrentWeather(loc.lat, loc.lon);
                    if (wData) {
                        currentWeather = `${wData.description}, ${wData.temperature}°F`;
                        setWeather(currentWeather);
                    }
                }
            }
            const contextWeather = currentWeather || "Mild, 70°F";

            // 2. Identify Anchor (only if nothing is locked)
            // If items are locked, THEY are the anchors, so we don't force a specific base.
            const hasLocks = Object.values(locked).some(v => v);
            let anchorItem = null;

            if (!hasLocks) {
                anchorItem = slots.Bottoms;
                if (!anchorItem && slots.Tops) anchorItem = slots.Tops;

                // 2b. If no anchor & no locks, pick random bottom
                if (!anchorItem) {
                    const allItems = await InventoryService.getAllItems();
                    const bottoms = allItems.filter((i: any) => i.metadata.category === 'Bottoms');
                    if (bottoms.length > 0) {
                        anchorItem = bottoms[Math.floor(Math.random() * bottoms.length)];
                    } else {
                        // Fallback to tops if no bottoms
                        const tops = allItems.filter((i: any) => i.metadata.category === 'Tops');
                        if (tops.length > 0) anchorItem = tops[Math.floor(Math.random() * tops.length)];
                    }
                }
            }

            if (!anchorItem && !hasLocks) {
                console.warn('[OutfitGenerator] No clothes found to start!');
                setLoading(false);
                return;
            }

            // 3. Imagine Outfit (Generative Step)
            // PASS FULL CONTEXT (Current slots + Lock state)
            const imaginedOutfit = await AIService.generateOutfitDescription({ slots, locked }, contextWeather);

            // 4. Find Matches (Vector Search)
            const newSlots: OutfitSlots = { ...slots };
            const newOptions: Record<string, any[]> = { ...slotOptions };
            const newIndices: Record<string, number> = { ...slotIndices };

            // Ensure anchor is preserved (only if we have one)
            if (anchorItem) {
                if (anchorItem.metadata.category === 'Bottoms') newSlots.Bottoms = anchorItem;
                else if (anchorItem.metadata.category === 'Tops') newSlots.Tops = anchorItem;
            }

            // Helper to fill a slot
            const fillSlot = async (slotKey: keyof OutfitSlots, details: any) => {
                // If this slot is the anchor, populate options with ALL items of this category
                // This allows the user to cycle through anchors (e.g. switch pants)
                if (anchorItem && newSlots[slotKey]?.id === anchorItem.id) {
                    const allItems = await InventoryService.getAllItems();
                    const categoryItems = allItems.filter((i: any) => i.metadata.category === slotKey);

                    // Ensure current anchor is in the list (it should be)
                    newOptions[slotKey] = categoryItems;

                    // Find index of current anchor
                    const anchorIndex = categoryItems.findIndex((i: any) => i.id === anchorItem.id);
                    newIndices[slotKey] = anchorIndex >= 0 ? anchorIndex : 0;
                    return;
                }

                // If locked, keep existing but ensure it is in options
                if (locked[slotKey] && newSlots[slotKey]) {
                    newOptions[slotKey] = [newSlots[slotKey]];
                    newIndices[slotKey] = 0;
                    return;
                }

                if (details) {
                    const searchText = [
                        details.primaryColor,
                        details.subCategory,
                        slotKey,
                        ...(details.tags || [])
                    ].join(' ');

                    const embedding = await AIService.generateEmbedding(searchText);
                    // Search for TOP 5 matches to allow navigation
                    const matches = await InventoryService.searchItems(embedding, slotKey, 5);

                    if (matches.length > 0) {
                        newSlots[slotKey] = matches[0]; // Default to best match
                        newOptions[slotKey] = matches;  // Store all candidates
                        newIndices[slotKey] = 0;        // Reset index
                    }
                }
            };

            await Promise.all([
                fillSlot('Tops', imaginedOutfit.Tops),
                fillSlot('Footwear', imaginedOutfit.Footwear),
                fillSlot('Outerwear', imaginedOutfit.Outerwear),
                fillSlot('Headwear', imaginedOutfit.Headwear),
                fillSlot('Bottoms', imaginedOutfit.Bottoms)
            ]);

            setSlots(newSlots);
            setSlotOptions(newOptions as any);
            setSlotIndices(newIndices as any);

        } catch (error) {
            console.error('[OutfitGenerator] Error generating outfit:', error);
        } finally {
            setLoading(false);
        }
    }, [slots, locked, weather]);

    /**
     * Cycles through the available candidates for a slot.
     */
    const cycleSlot = (slot: keyof OutfitSlots, direction: 'next' | 'prev') => {
        const options = slotOptions[slot];
        if (!options || options.length <= 1) return;

        let newIndex = slotIndices[slot];
        if (direction === 'next') {
            newIndex = (newIndex + 1) % options.length;
        } else {
            newIndex = (newIndex - 1 + options.length) % options.length;
        }

        setSlotIndices(prev => ({ ...prev, [slot]: newIndex }));
        setSlots(prev => ({ ...prev, [slot]: options[newIndex] }));
    };

    const setSlot = (slot: keyof OutfitSlots, item: any) => {
        setSlots(prev => ({ ...prev, [slot]: item }));
    };

    /**
     * Confirms the current outfit.
     * Marks all worn items as worn in the database AND saves to history.
     * Returns true if successful.
     */
    const confirmOutfit = async (): Promise<boolean> => {
        try {
            setLoading(true);
            const wornItems = Object.values(slots).filter(item => item !== null);

            // 1. Mark individual items as worn (updates wear count, laundry status)
            await Promise.all(wornItems.map(item => InventoryService.markAsWorn(item.id)));

            // 2. Save Outfit to History
            const itemIds = wornItems.map(item => item.id);
            await OutfitService.saveOutfit(itemIds, `Outfit for ${new Date().toLocaleDateString()}`);

            // Reset locks for next time
            setLocked({
                Headwear: false,
                Outerwear: false,
                Tops: false,
                Bottoms: false,
                Footwear: false
            });

            return true;
        } catch (error) {
            console.error('[OutfitGenerator] Error confirming outfit:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        slots,
        locked,
        loading,
        weather,
        generateOutfit,
        toggleLock,
        cycleSlot,
        setSlot,
        slotOptions,
        confirmOutfit
    };
};
