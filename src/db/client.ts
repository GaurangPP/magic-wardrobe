import * as SQLite from 'expo-sqlite';

const DB_NAME = 'magic_wardrobe.db';

export const getDB = async () => {
    return await SQLite.openDatabaseAsync(DB_NAME);
};

export const initDB = async () => {
    try {
        const db = await getDB();

        // Create clothing_items table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS clothing_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                image_uri TEXT NOT NULL,
                metadata TEXT, -- JSON string for analyzed data
                embedding TEXT, -- JSON string for vector embedding
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );
        `);

        // Migration: Ensure new columns exist
        const migrations = [
            'ALTER TABLE clothing_items ADD COLUMN embedding TEXT;',
            'ALTER TABLE clothing_items ADD COLUMN wear_count INTEGER DEFAULT 0;',
            'ALTER TABLE clothing_items ADD COLUMN max_wears INTEGER DEFAULT 5;',
            'ALTER TABLE clothing_items ADD COLUMN is_clean BOOLEAN DEFAULT 1;',
            'ALTER TABLE clothing_items ADD COLUMN last_worn INTEGER;'
        ];

        for (const query of migrations) {
            try {
                await db.execAsync(query);
            } catch (e) {
                // Column likely already exists, ignore
            }
        }

        // Create outfits table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS outfits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                items TEXT NOT NULL, -- JSON array of clothing_item_ids
                description TEXT,
                date_worn INTEGER,
                created_at INTEGER NOT NULL
            );
        `);

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
};
