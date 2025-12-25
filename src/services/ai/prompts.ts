export const CLOTHING_CATEGORIES = [
    'Headwear',
    'Outerwear',
    'Tops',
    'Bottoms',
    'Footwear',
    'Accessories'
] as const;

export const STANDARD_SUBCATEGORIES = {
    Headwear: [
        'Cap', 'Beanie', 'Bucket Hat', 'Fedora', 'Sun Hat', 'Visor', 'Headband'
    ],
    Outerwear: [
        'Bomber Jacket', 'Blazer', 'Cardigan', 'Peacoat', 'Denim Jacket',
        'Zip-Up Hoodie', 'Varsity Jacket', 'Leather Jacket', 'Parka', 'Raincoat', 'Vest',
        'Windbreaker', 'Puffer Jacket', 'Trench Coat'
    ],
    Tops: [
        'T-Shirt', 'Button-Down', 'Polo', 'Tank Top', 'Sweater',
        'Sweatshirt', 'Hoodie', 'Quarter Zip', 'Jersey',
    ],
    Bottoms: [
        'Jeans', 'Trousers', 'Chinos', 'Shorts', 'Sweatpants',
        'Cargo Pants', 'Joggers', 'Pajamas'
    ],
    Footwear: [
        'Sneakers', 'Boots', 'Loafers', 'Oxfords', 'Sandals',
        'Slippers', 'Slides'
    ],
    Accessories: [
        'Belt', 'Necklace', 'Watch', 'Ring', 'Bracelet', 'Scarf',
        'Gloves', 'Bag', 'Sunglasses', 'Tie'
    ]
};

// null = Infinity (Doesn't need washing / Specialist Clean Only)
type SubCategoryLimits = Record<string, number | null>;

export const CLOTHING_WEAR_LIMITS: Record<string, SubCategoryLimits> = {
    Headwear: {
        'Cap': 14,
        'Beanie': 7,
        'Bucket Hat': 14,
        'Fedora': null,
        'Sun Hat': null,
        'Visor': 14,
        'Headband': 2,
    },
    Outerwear: {
        'Bomber Jacket': 10,
        'Blazer': 5,
        'Cardigan': 5,
        'Peacoat': null,
        'Denim Jacket': 20,
        'Zip-Up Hoodie': 5,
        'Varsity Jacket': 10,
        'Leather Jacket': null,
        'Parka': null,
        'Raincoat': null,
        'Vest': 10,
        'Windbreaker': 10,
        'Puffer Jacket': null,
        'Trench Coat': null,
    },
    Tops: {
        'T-Shirt': 1,
        'Button-Down': 2,
        'Polo': 2,
        'Tank Top': 1,
        'Sweater': 3,
        'Sweatshirt': 3,
        'Hoodie': 3,
        'Quarter Zip': 3,
        'Jersey': 1,
    },
    Bottoms: {
        'Jeans': 10,
        'Trousers': 3,
        'Chinos': 3,
        'Shorts': 2,
        'Sweatpants': 3,
        'Cargo Pants': 5,
        'Joggers': 2,
        'Pajamas': 3,
    },
    Footwear: {
        'Sneakers': null,
        'Boots': null, // Can clean, but not traditionally "washed"
        'Loafers': null,
        'Oxfords': null,
        'Sandals': null,
        'Slippers': null,
        'Slides': null,
    },
    Accessories: {
        'Belt': null,
        'Necklace': null,
        'Watch': null,
        'Ring': null,
        'Bracelet': null,
        'Scarf': 10,
        'Gloves': 10,
        'Bag': null,
        'Sunglasses': null,
        'Tie': null,
    }
};

export const CLOTHING_TAGS = {
    styles: [
        'Casual', 'Smart Casual', 'Formal', 'Streetwear',
        'Athleisure', 'Minimalist', 'Rugged'
    ],
    occasions: [
        'Everyday', 'Home', 'Work', 'Date', 'Party', 'Gym',
        'Formal', 'Beach', 'Travel',
    ],
    fit: [
        'Slim', 'Regular', 'Oversized', 'Cropped', 'Baggy', 'Tailored'
    ],
    materials: [
        'Cotton', 'Denim', 'Leather', 'Wool', 'Linen', 'Silk',
        'Polyester', 'Spandex', 'Nylon', 'Velvet', 'Fleece',
        'Suede', 'Corduroy', 'Rayon', 'Satin'
    ],
    patterns: [
        'Solid', 'Striped', 'Plaid', 'Floral', 'Graphic',
        'Camouflage', 'Polka Dot', 'Animal Print', 'Checkered',
        'Tie-Dye', 'Geometric', 'Paisley'
    ],
    season: [
        'Summer', 'Winter', 'Spring', 'Fall', 'All-Season'
    ]
} as const;

export const SYSTEM_PROMPT = `You are an expert fashion stylist. Analyze the clothing item in the image.

Return ONLY a valid JSON object matching this strict schema:
{
  "category": "Headwear" | "Outerwear" | "Tops" | "Bottoms" | "Footwear" | "Accessories",
  "subCategory": string (Select most appropriate from standard list below),
  "primaryColor": string (dominant color name or hex),
  "description": string (visual description for search),
  "tags": string[] (Select relevant tags from standard list below, include Style, Material, Pattern, Occasion, Fit, Season)
}

STANDARD CATEGORIES & SUBCATEGORIES:
${JSON.stringify(STANDARD_SUBCATEGORIES, null, 2)}

STANDARD TAGS (Grouped by Type):
${JSON.stringify(CLOTHING_TAGS, null, 2)}

Do NOT include brand or season as separate top-level fields (include season in tags).
Ensure the JSON is minified and contains no markdown formatting (no backticks).
`;
