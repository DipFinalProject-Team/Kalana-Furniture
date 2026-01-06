import type { Product } from './mockdata';

export interface OrderItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  total: number;
  items: OrderItem[];
}

export const mockOrders: Order[] = [
  {
    id: 'ORD-2025-001',
    date: '2025-10-28',
    status: 'Completed',
    total: 499.99,
    items: [
      {
        id: 1,
        name: "Classic Wooden Chair",
        price: 120.00,
        description: "A timeless wooden chair, perfect for any dining room. Made from solid oak.",
        category: "Chairs",
        images: [
                'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
                'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
                'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',

        ],
        stock: 15,
        rating: 4.5,
        reviews: [
          { id: 1, user_name: "Alice", rating: 5, comment: "Very sturdy and looks great!" },
          { id: 2, user_name: "Bob", rating: 4, comment: "Comfortable, but assembly was a bit tricky." },
        ],
        quantity: 1,
      }
    ],
  },
  {
    id: 'ORD-2025-002',
    date: '2025-11-10',
    status: 'Pending',
    total: 1250.00,
    items: [
        {
            id: 2,
            name: "Modern Leather Sofa",
            price: 750.00,
            description: "A sleek and comfortable leather sofa for modern living spaces.",
            category: "Sofas",
            images: [
      'https://images.unsplash.com/photo-1543536448-d209d2d13a1c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
      'https://images.unsplash.com/photo-1543536448-d209d2d13a1c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
      'https://images.unsplash.com/photo-1543536448-d209d2d13a1c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
            ],
            stock: 8,
            rating: 4.8,
            reviews: [
              { id: 3, user_name: "Charlie", rating: 5, comment: "Absolutely love this sofa! It's the centerpiece of my living room." },
            ],
            quantity: 1,
          },
          {
            id: 7,
            name: "Glass Coffee Table",
            price: 150.00,
            description: "A minimalist coffee table with a glass top and metal frame.",
            category: "Tables",
            images: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
            ],
            stock: 20,
            rating: 4.3,
            reviews: [],
            quantity: 1,
          }
    ],
  },
  {
    id: 'ORD-2025-003',
    date: '2025-11-15',
    status: 'Cancelled',
    total: 85.50,
    items: [
        {
            id: 10,
            name: "Bedside Lamp",
            price: 45.00,
            description: "A stylish lamp that provides warm, ambient light.",
            category: "Lighting",
            images: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
            ],
            stock: 30,
            rating: 4.6,
            reviews: [],
            quantity: 1,
          }
    ],
  },
];
