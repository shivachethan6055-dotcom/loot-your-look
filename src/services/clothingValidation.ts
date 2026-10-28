/**
 * Loot Your Look - Strict Clothing-Only Validation Engine
 * 
 * Strict Business Rule: "Loot Your Look must sell clothes and nothing else."
 * Prohibited categories and keywords are enforced both client-side and server-side.
 */

export const ALLOWED_CLOTHING_CATEGORIES = [
  'Shirts',
  'T-Shirts',
  'Jeans & Trousers',
  'Sarees',
  'Kurtas & Kurtis',
  'Dresses & Gowns',
  'Jackets & Hoodies',
  'Ethnic & Festive Wear',
  'Kids Clothing',
  'Sweaters & Cardigans',
  'Shorts & Trackpants',
] as const;

export const PROHIBITED_CATEGORIES = [
  'Shoes & Footwear',
  'Footwear, Slippers & Sandals',
  'Bags, Handbags, Purses & Wallets',
  'Jewellery, Watches & Accessories',
  'Cosmetics, Skincare & Beauty',
  'Electronics, Mobiles & Gadgets',
  'Home Products & Furniture',
  'Toys & Groceries',
] as const;

export const PROHIBITED_KEYWORDS = [
  // Footwear
  'shoe', 'shoes', 'sneaker', 'sneakers', 'sandal', 'sandals', 'slipper', 'slippers',
  'boot', 'boots', 'loafers', 'heels', 'crocs', 'chappal', 'mojari', 'jutti',
  // Bags & Luggage
  'bag', 'bags', 'handbag', 'handbags', 'purse', 'purses', 'wallet', 'wallets',
  'backpack', 'backpacks', 'tote', 'clutch', 'luggage', 'suitcase',
  // Jewellery & Accessories
  'jewellery', 'jewelry', 'watch', 'watches', 'smartwatch', 'necklace', 'earring',
  'earrings', 'bangle', 'bangles', 'bracelet', 'ring', 'rings', 'pendant', 'belt',
  'sunglasses', 'goggles', 'cap', 'hat',
  // Cosmetics & Beauty
  'cosmetic', 'cosmetics', 'lipstick', 'perfume', 'deodorant', 'foundation',
  'makeup', 'cream', 'lotion', 'shampoo', 'serum', 'skincare',
  // Electronics & Gadgets
  'electronic', 'electronics', 'mobile', 'phone', 'charger', 'cable', 'headphone',
  'earphone', 'earbuds', 'laptop', 'tablet', 'gadget',
  // Home & Furniture & Others
  'bedsheet', 'curtain', 'furniture', 'pillow', 'toy', 'grocery', 'blanket'
];

export interface ClothingValidationResult {
  isValid: boolean;
  errors: string[];
  detectedProhibitedTerms: string[];
}

export function validateClothingProduct(data: {
  title: string;
  description: string;
  category: string;
  fabric: string;
}): ClothingValidationResult {
  const errors: string[] = [];
  const detectedProhibitedTerms: string[] = [];

  // 1. Verify Category is in the allowed list
  if (!ALLOWED_CLOTHING_CATEGORIES.includes(data.category as any)) {
    errors.push(
      `Invalid category: "${data.category}". Loot Your Look exclusively sells clothing (apparel & garments). Prohibited category detected.`
    );
  }

  // 2. Scan text for prohibited keywords
  const textToScan = `${data.title} ${data.description} ${data.fabric} ${data.category}`.toLowerCase();
  
  // Normalize punctuation to spaces
  const cleanText = textToScan.replace(/[^a-z0-9]/g, ' ');
  const words = cleanText.split(/\s+/).filter(Boolean);

  for (const keyword of PROHIBITED_KEYWORDS) {
    if (words.includes(keyword)) {
      if (!detectedProhibitedTerms.includes(keyword)) {
        detectedProhibitedTerms.push(keyword);
      }
    }
  }

  if (detectedProhibitedTerms.length > 0) {
    errors.push(
      `Non-clothing item prohibited! The listing contains forbidden keyword(s): [${detectedProhibitedTerms.join(', ')}]. ` +
      `Under strict marketplace policy, shoes, bags, jewellery, cosmetics, accessories, electronics and home goods cannot be listed.`
    );
  }

  // 3. Ensure mandatory clothing attributes exist
  if (!data.fabric || data.fabric.trim().length < 2) {
    errors.push('Garment fabric composition (e.g., Pure Cotton, Chanderi Silk, Denim) is required for clothing listings.');
  }

  if (!data.title || data.title.trim().length < 4) {
    errors.push('Product title must be at least 4 characters describing the clothing garment.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    detectedProhibitedTerms,
  };
}
