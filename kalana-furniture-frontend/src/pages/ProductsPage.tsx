import React from 'react';

const allProducts = [
  { id: 1, name: 'Modern Velvet Sofa', price: '£799', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80' },
  { id: 2, name: 'Oak Dining Table', price: '£450', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80' },
  { id: 3, name: 'King Size Bed Frame', price: '£550', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80' },
  { id: 4, name: 'Ergonomic Office Chair', price: '£250', image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80' },
  { id: 5, name: 'Minimalist Bookshelf', price: '£180', image: 'https://images.unsplash.com/photo-1594224457193-09a3a1f1d929?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80' },
  { id: 6, name: 'Leather Accent Chair', price: '£350', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80' },
  { id: 7, name: 'Rustic Coffee Table', price: '£220', image: 'https://images.unsplash.com/photo-1594026112272-cb45413c9a83?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80' },
  { id: 8, name: 'Modern Wardrobe', price: '£650', image: 'https://images.unsplash.com/photo-1618221382245-99deba589477?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80' },
];

const ProductsPage = () => {
  return (
    <div className="bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold text-wood-brown tracking-tight sm:text-5xl">All Products</h1>
          <p className="mt-4 text-xl text-gray-600">
            Discover our curated collection of high-quality furniture.
          </p>
        </div>

        <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {allProducts.map((product) => (
            <a key={product.id} href="#" className="group">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                />
              </div>
              <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">{product.price}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
