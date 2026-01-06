export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  discountPrice?: number;
  images: string[];
  rating: number;
  stock: number;
  description?: string;
  reviews?: Review[];
}

export interface Review {
  id: number;
  product_id?: number;
  user_id?: string;
  user_name: string;
  rating: number;
  comment: string;
  images?: string[];
  created_at?: string;
}

export interface Category {
  name: string;
  image: string;
}

export const categories: Category[] = [
  { name: 'Living Room', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80' },
  { name: 'Bedroom', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=871&q=80' },
  { name: 'Dining', image: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80' },
  { name: 'Office', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80' },
];

export const allProducts: Product[] = [
  {
    id: 1,
    name: 'Modern Velvet Sofa',
    category: 'Living Room',
    price: 799,
    discountPrice: 699,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
    ],
    description: 'A luxurious and comfortable velvet sofa, perfect for modern living rooms.',
    stock: 15,
    rating: 4.5,
    reviews: [
      {
        id: 1,
        user_name: 'Alex',
        comment: 'So comfortable and looks amazing!',
        rating: 5,
      },
      {
        id: 2,
        user_name: 'Maria',
        comment: 'Great value for the price.',
        rating: 4,
      },
    ],
  },
  {
    id: 2,
    name: 'Oak Dining Table',
    category: 'Dining',
    price: 450,
    discountPrice: 399,
    images: [
      'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
    ],
    description: 'A sturdy and stylish oak dining table that seats up to 6 people.',
    stock: 10,
    rating: 4.8,
    reviews: [],
  },
  {
    id: 3,
    name: 'Leather Accent Chair',
    category: 'Living Room',
    price: 350,
    images: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
    ],
    description: 'A stylish leather accent chair that adds elegance to any living space.',
    stock: 8,
    rating: 4.3,
    reviews: [],
  },
  {
    id: 4,
    name: 'Rustic Coffee Table',
    category: 'Living Room',
    price: 220,
    images: [
      'https://images.unsplash.com/photo-1543536448-d209d2d13a1c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
    ],
    description: 'A beautiful rustic coffee table made from reclaimed wood.',
    stock: 12,
    rating: 4.6,
    reviews: [],
  },
  {
    id: 5,
    name: 'Elegant Dining Chair',
    category: 'Dining',
    price: 120,
    images: [
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
    ],
    description: 'Comfortable and elegant dining chairs that complement any dining set.',
    stock: 20,
    rating: 4.4,
    reviews: [],
  },
  {
    id: 6,
    name: 'Bar Stool',
    category: 'Dining',
    price: 80,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
    ],
    description: 'Contemporary bar stools perfect for kitchen islands or bar areas.',
    stock: 4,
    rating: 4.2,
    reviews: [],
  },
  {
    id: 7,
    name: 'King Size Bed Frame',
    category: 'Bedroom',
    price: 650,
    discountPrice: 549,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
    ],
    description: 'A sturdy king size bed frame with modern design.',
    stock: 6,
    rating: 4.7,
    reviews: [],
  },
  {
    id: 8,
    name: 'Wooden Nightstand',
    category: 'Bedroom',
    price: 150,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
    ],
    description: 'A practical wooden nightstand with storage space.',
    stock: 14,
    rating: 4.1,
    reviews: [],
  },
  {
    id: 9,
    name: 'Ergonomic Office Chair',
    category: 'Office',
    price: 250,
    images: [
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
    ],
    description: 'An ergonomic office chair designed for comfort during long work sessions.',
    stock: 9,
    rating: 4.5,
    reviews: [],
  },
  {
    id: 10,
    name: 'Office Desk',
    category: 'Office',
    price: 300,
    images: [
      'https://images.unsplash.com/photo-1549497538-303791108f95?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
    ],
    description: 'A spacious office desk with multiple drawers for organization.',
    stock: 7,
    rating: 4.3,
    reviews: [],
  },
  { id: 11, name: 'Minimalist Bookshelf', category: 'Living Room', price: 180, discountPrice: 149, images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80'], rating: 4.2, stock: 12 },
  { id: 12, name: 'TV Stand', category: 'Living Room', price: 200, images: ['https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80'], rating: 4.0, stock: 11 },
  { id: 13, name: 'Armchair', category: 'Living Room', price: 320, images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80'], rating: 4.4, stock: 9 },
  { id: 14, name: 'Tall Bookshelf', category: 'Living Room', price: 190, images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80'], rating: 4.3, stock: 13 },
  { id: 15, name: 'Modern Wardrobe', category: 'Bedroom', price: 650, images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80'], rating: 4.4, stock: 5 },
  { id: 16, name: 'Dresser', category: 'Bedroom', price: 400, images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80'], rating: 4.5, stock: 8 },
  { id: 17, name: 'Bedside Lamp', category: 'Bedroom', price: 50, images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80'], rating: 4.0, stock: 22 },
  { id: 18, name: 'Computer Desk', category: 'Office', price: 250, images: ['https://images.unsplash.com/photo-1549497538-303791108f95?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80'], rating: 4.1, stock: 6 },
  { id: 19, name: 'Side Table', category: 'Living Room', price: 100, images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80'], rating: 3.9, stock: 18 },
  { id: 20, name: 'Filing Cabinet', category: 'Office', price: 180, images: ['https://images.unsplash.com/photo-1549497538-303791108f95?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80'], rating: 3.8, stock: 4 },
];