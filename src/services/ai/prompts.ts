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

export const CLOTHING_TAGS = {
    styles: [
        'Casual', 'Smart Casual', 'Formal', 'Streetwear',
        'Athleisure',  'Minimalist', 'Rugged'
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
