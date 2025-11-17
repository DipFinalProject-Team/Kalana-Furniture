const products = [
  { id: 1, name: 'Modern Velvet Sofa', price: 'Rs.799', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80' },
  { id: 2, name: 'Oak Dining Table', price: 'Rs.450', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80' },
  { id: 3, name: 'King Size Bed Frame', price: 'Rs.550', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80' },
  { id: 4, name: 'Ergonomic Office Chair', price: 'Rs.250', image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80' },
];

const FeaturedProducts = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-3xl font-bold text-wood-brown text-center mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-lg text-wood-brown">{product.name}</h3>
                <p className="text-wood-accent font-bold mt-2">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
