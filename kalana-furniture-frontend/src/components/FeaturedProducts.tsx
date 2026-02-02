import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService, promotionService } from '../services/api';
import type { Product, Promotion } from '../services/api';

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to apply promotions to a product
  const applyPromotionsToProduct = (product: Product, promotionsList: Promotion[]): Product & { discountPrice?: number; discountPercentage?: number } => {
    let bestDiscountPrice = product.discountPrice || product.price; // Start with existing discount or original price
    let bestDiscountPercentage = 0;

    promotionsList.forEach(promotion => {
      // Only apply general discounts (where code is null or 'GENERAL_DISCOUNT')
      if (promotion.code && promotion.code !== 'GENERAL_DISCOUNT') return;
      
      // Skip inactive promotions (though getActive should only return active ones)
      if (!promotion.is_active) return;

      // Check if promotion applies to this product
      let appliesToProduct = false;

      if (promotion.applies_to === 'All Products') {
        appliesToProduct = true;
      } else if (promotion.applies_to) {
        // Handle both "Category: Name" and simple "Name" formats
        const category = promotion.applies_to.replace('Category: ', '').replace('Category ', '');
        appliesToProduct = product.category === category;
      }

      if (appliesToProduct) {
        let discountPrice = product.price;

        if (promotion.type === 'percentage') {
          discountPrice = product.price * (1 - promotion.value / 100);
        } else if (promotion.type === 'fixed') {
          discountPrice = Math.max(0, product.price - promotion.value);
        }

        if (discountPrice < bestDiscountPrice) {
          bestDiscountPrice = discountPrice;
          bestDiscountPercentage = promotion.type === 'percentage' ? promotion.value : Math.round(((product.price - discountPrice) / product.price) * 100);
        }
      }
    });

    if (bestDiscountPrice < product.price) {
      return {
        ...product,
        discountPrice: Math.round(bestDiscountPrice),
        discountPercentage: bestDiscountPercentage
      };
    }

    return product;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [productsData, promotionsData] = await Promise.all([
          productService.getAll(),
          promotionService.getActive()
        ]);
        
        // Apply promotions to products
        const productsWithDiscounts = productsData.map(product => applyPromotionsToProduct(product, promotionsData));
        
        setProducts(productsWithDiscounts.slice(0, 4)); // Get first 4 products as featured
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-wood-brown text-center mb-8">Featured Products</h2>
          <div className="text-center py-16">Loading featured products...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-3xl font-bold text-wood-brown text-center mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {products.map(product => {
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
              <img src={product.images[0]} alt={product.productName || product.name} className="w-full h-64 object-cover" />
              <div className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-bold text-lg text-wood-brown hover:text-wood-accent hover:underline transition duration-200">{product.productName || product.name}</h3>
                </Link>
                <div className="mt-2">
                  {product.discountPrice ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 line-through text-sm">Rs.{product.price}</span>
                        <span className="text-red-600 font-bold text-lg">Rs.{product.discountPrice}</span>
                      </div>
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
