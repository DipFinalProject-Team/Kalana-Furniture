import { Link } from 'react-router-dom';
import { allProducts } from '../data/mockdata';

const FeaturedProducts = () => {
  // Get first 4 products as featured products
  const featuredProducts = allProducts.slice(0, 4);
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-3xl font-bold text-wood-brown text-center mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {featuredProducts.map(product => {
            const discountPercentage = product.discountPrice 
              ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
              : 0;

            return (
            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden relative">
              {product.discountPrice && (
                <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                  -{discountPercentage}%
                </div>
              )}
              <img src={product.images[0]} alt={product.name} className="w-full h-64 object-cover" />
              <div className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-bold text-lg text-wood-brown hover:text-wood-accent hover:underline transition duration-200">{product.name}</h3>
                </Link>
                <div className="flex items-center mb-2">
                  <span className="text-yellow-500 text-sm">
                    {"★".repeat(Math.floor(product.rating))}
                    {"☆".repeat(5 - Math.floor(product.rating))}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">
                    ({product.rating})
                  </span>
                </div>
                <div className="mt-2">
                  {product.discountPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 line-through text-sm">Rs.{product.price}</span>
                      <span className="text-red-600 font-bold text-lg">Rs.{product.discountPrice}</span>
                    </div>
                  ) : (
                    <p className="text-wood-accent font-bold text-lg">Rs.{product.price}</p>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
