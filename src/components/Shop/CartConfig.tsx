export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  brand: string;
  categoryId?: string;
  brandId?: string;
  variants?: any[];
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Banano Premium',
    description: 'El banano más dulce y fresco de la región.',
    price: 1.50,
    image: 'https://images.unsplash.com/photo-1571771896612-61871f0a5866?q=80&w=2070&auto=format&fit=crop',
    category: 'Frutas',
    brand: 'BananoKing',
  },
  {
    id: '2',
    name: 'Pack Smoothie',
    description: 'Mix de bananos y fresas listo para licuar.',
    price: 4.00,
    image: 'https://images.unsplash.com/photo-1628543108328-9844dfd3dcc3?q=80&w=1934&auto=format&fit=crop',
    category: 'Bebidas',
    brand: 'FreshMix',
  },
  {
    id: '3',
    name: 'Pan de Banano',
    description: 'Casero, esponjoso y lleno de sabor.',
    price: 3.50,
    image: 'https://images.unsplash.com/photo-1605292356183-a77d0a9c9d1d?q=80&w=2070&auto=format&fit=crop',
    category: 'Panadería',
    brand: 'BakeryGood',
  },
  {
    id: '4',
    name: 'Chips de Banano',
    description: 'Crujientes y saladitos, el snack perfecto.',
    price: 2.00,
    image: 'https://images.unsplash.com/photo-1599307767316-77f6b4d32e92?q=80&w=2070&auto=format&fit=crop',
    category: 'Snacks',
    brand: 'CrunchyB',
  }
];
