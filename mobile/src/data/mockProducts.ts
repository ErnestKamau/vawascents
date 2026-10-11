export type MockProduct = {
  id: string;
  name: string;
  brand: string;
  category: 'Women' | 'Men' | 'Unisex';
  volumeMl: number;
  price: number;
  compareAt?: number;
  notes: string[];
  imageUri: string;
  rating?: number;
  reviewCount?: number;
};

export const CATEGORIES = ['All', 'Women', 'Men', 'Unisex', 'Gift Sets'] as const;

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'velvet-noir',
    name: 'Velvet Noir',
    brand: 'VawaScents',
    category: 'Women',
    volumeMl: 50,
    price: 6500,
    compareAt: 7800,
    notes: ['Bergamot', 'Black Orchid', 'Patchouli'],
    imageUri: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80',
    rating: 4.8,
    reviewCount: 64,
  },
  {
    id: 'ocean-mist',
    name: 'Ocean Mist',
    brand: 'VawaScents',
    category: 'Men',
    volumeMl: 100,
    price: 7200,
    notes: ['Sea Salt', 'Driftwood', 'Amber'],
    imageUri: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80',
    rating: 4.6,
    reviewCount: 38,
  },
  {
    id: 'rose-aura',
    name: 'Rose Aura',
    brand: 'VawaScents',
    category: 'Unisex',
    volumeMl: 75,
    price: 5400,
    notes: ['Turkish Rose', 'Vanilla', 'Musk'],
    imageUri: 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=600&q=80',
    rating: 4.7,
    reviewCount: 52,
  },
  {
    id: 'amber-dusk',
    name: 'Amber Dusk',
    brand: 'VawaScents',
    category: 'Men',
    volumeMl: 100,
    price: 8900,
    notes: ['Amber', 'Oud', 'Tobacco'],
    imageUri: 'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=600&q=80',
    rating: 4.9,
    reviewCount: 81,
  },
  {
    id: 'citrus-bloom',
    name: 'Citrus Bloom',
    brand: 'VawaScents',
    category: 'Women',
    volumeMl: 50,
    price: 4800,
    notes: ['Yuzu', 'Jasmine', 'White Tea'],
    imageUri: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80',
    rating: 4.5,
    reviewCount: 27,
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    brand: 'VawaScents',
    category: 'Unisex',
    volumeMl: 100,
    price: 9900,
    compareAt: 11200,
    notes: ['Saffron', 'Sandalwood', 'Honey'],
    imageUri: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80',
    rating: 4.9,
    reviewCount: 96,
  },
];

export function findProduct(id: string): MockProduct | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id);
}
