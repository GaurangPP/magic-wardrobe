export const CLOTHING_CATEGORIES = [
    'Headwear',   // Renamed from 'Hats' for better AI accuracy
    'Outerwear',
    'Tops',
    'Bottoms',    // Fixed pluralization
    'Footwear',   // Renamed from 'Shoes'
    'Accessories' // Optional: Good for belts/scarves, easy to ignore if unused
] as const;

export const STANDARD_SUBCATEGORIES = {
    Headwear: [
        'Baseball Cap', 'Beanie', 'Bucket Hat', 'Fedora', 'Sun Hat', 'Visor', 'Headband'
    ],
    Outerwear: [
        'Bomber Jacket', 'Blazer', 'Cardigan', 'Peacoat', 'Denim Jacket',
        'Hoodie', 'Leather Jacket', 'Parka', 'Raincoat', 'Vest',
        'Windbreaker', 'Puffer Jacket', 'Trench Coat'
    ],
    Tops: [
        'T-Shirt', 'Button-Down', 'Polo', 'Tank Top', 'Sweater',
        'Sweatshirt', 'Crop Top', 'Bodysuit', 'Jersey', 'Tunic'
    ],
    Bottoms: [
        'Jeans', 'Trousers', 'Chinos', 'Shorts', 'Skirt',
        'Leggings', 'Sweatpants', 'Cargo Pants', 'Joggers'
    ],
    Footwear: [
        'Sneakers', 'Boots', 'Loafers', 'Oxfords', 'Sandals',
        'Heels', 'Flats', 'Slippers', 'Slides'
    ],
    Accessories: [
        'Belt', 'Scarf', 'Gloves', 'Bag', 'Sunglasses', 'Tie'
    ]
};

export const CLOTHING_TAGS = {
    styles: [
        'Casual', 'Smart Casual', 'Formal', 'Business', 'Streetwear',
        'Minimalist', 'Athleisure', 'Vintage', 'Bohemian', 'Preppy',
        'Grunge', 'Edgy', 'Y2K'
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
    occasions: [
        'Everyday', 'Work', 'Date Night', 'Party', 'Gym',
        'Lounge', 'Beach', 'Travel', 'Formal Event'
    ],
    // Crucial for Outfit Matching Rules
    fit: [
        'Slim', 'Regular', 'Oversized', 'Cropped', 'Baggy', 'Tailored'
    ],
    // Crucial for Weather Filtering
    season: [
        'Summer', 'Winter', 'Spring', 'Fall', 'Transitional', 'All-Season'
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
