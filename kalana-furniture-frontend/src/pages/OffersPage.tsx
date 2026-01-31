import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { productService, promotionService } from '../services/api';
import type { Product, Promotion } from '../services/api';

const OffersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [sortOrder, setSortOrder] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 9;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch products and promotions on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, promotionsData] = await Promise.all([
          productService.getAll(),
          promotionService.getActive()
        ]);
        console.log('OffersPage - Products data:', productsData?.length || 0, 'items');
        console.log('OffersPage - Promotions data:', promotionsData?.length || 0, 'items');
        promotionsData?.forEach((promo, index) => {
          console.log(`Promotion ${index}:`, {
            id: promo.id,
            code: promo.code,
            description: promo.description,
            start_date: promo.start_date,
            end_date: promo.end_date,
            is_active: promo.is_active
          });
        });
        setProducts(productsData);
        setPromotions(promotionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to apply promotions to a product
  const applyPromotionsToProduct = useCallback((product: Product): Product & { discountPrice?: number; discountPercentage?: number } => {
    let bestDiscountPrice = product.price;
    let bestDiscountPercentage = 0;

    promotions.forEach(promotion => {
      // Skip code-based promotions, only apply general discounts (where code is empty/falsy or 'GENERAL_DISCOUNT')
      if (promotion.code && promotion.code !== 'GENERAL_DISCOUNT') return;
      
      // Skip inactive promotions (though getActive should only return active ones)
      if (!promotion.is_active) return;

      // Check if promotion applies to this product
      let appliesToProduct = false;

      if (promotion.applies_to === 'All Products') {
        appliesToProduct = true;
      } else if (promotion.applies_to && promotion.applies_to.startsWith('Category: ')) {
        const category = promotion.applies_to.replace('Category: ', '');
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
  }, [promotions]);

  // Get products with applied promotions
  const productsWithDiscounts = useMemo(() => {
    const discountedProducts = products.map(applyPromotionsToProduct).filter(product => product.discountPrice);
    console.log('OffersPage - Products with discounts:', discountedProducts.length, 'out of', products.length);
    return discountedProducts;
  }, [products, applyPromotionsToProduct]);

  // Calculate maximum price from all products for dynamic range
  const maxProductPrice = useMemo(() => {
    const allPrices = products.map(p => p.price);
    return allPrices.length > 0 ? Math.max(...allPrices) : 100000;
  }, [products]);

  // Filter and sort products based on current filters
  const filteredProducts = useMemo(() => {
    let filtered = productsWithDiscounts;

    if (searchTerm) {
      filtered = filtered.filter(p => p.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    filtered = filtered.filter(p => (p.discountPrice || p.price) >= priceRange[0] && (p.discountPrice || p.price) <= priceRange[1]);

    if (sortOrder === 'low-to-high') {
      filtered = [...filtered].sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortOrder === 'high-to-low') {
      filtered = [...filtered].sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || b.price));
    }

    return filtered;
  }, [searchTerm, priceRange, sortOrder, productsWithDiscounts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priceRange, sortOrder]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Ensure current page doesn't exceed total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <div>
        <Header />
      </div>
      <div className="bg-[url('/wood-bg.jpg')] pt-20 bg-cover bg-fixed min-h-screen relative">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 border border-wood-brown rounded-lg p-6 bg-wood-brown bg-opacity-60">
            <h1 className="font-serif text-4xl font-bold text-white tracking-tight sm:text-5xl">
              Special Offers
            </h1>
            <p className="mt-4 text-xl text-white">
              Discover amazing deals on our premium furniture collection!
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-brown"></div>
              <span className="ml-3 text-white">Loading offers...</span>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8">
              {/* Filters */}
              <div className="w-full md:w-1/4">
                <div className="bg-wood-light p-6 rounded-lg shadow-lg">
                  <h2 className="text-lg font-semibold mb-4">Filters</h2>

                  {/* Search */}
                  <div className="mb-4">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
                    <input
                      type="text"
                      id="search"
                      placeholder="Search offers..."
                      className="mt-1 block w-full p-2 border border-wood-light rounded-md"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Price Range */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Price Range</label>
                    <div className="flex items-center justify-between mt-1">
                      <span>Rs {priceRange[0]}</span>
                      <span>Rs {priceRange[1]}</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-600">Minimum Price</label>
                        <input
                          type="range"
                          min="0"
                          max={maxProductPrice}
                          step={Math.max(100, Math.floor(maxProductPrice / 100))}
                          value={priceRange[0]}
                          className="w-full"
                          onChange={(e) => setPriceRange([Number(e.target.value), Math.max(Number(e.target.value), priceRange[1])])}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Maximum Price</label>
                        <input
                          type="range"
                          min="0"
                          max={maxProductPrice}
                          step={Math.max(100, Math.floor(maxProductPrice / 100))}
                          value={priceRange[1]}
                          className="w-full"
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sorting */}
                  <div>
                    <label htmlFor="sort" className="block text-sm font-medium text-gray-700">Sort by</label>
                    <select
                      id="sort"
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="">Default</option>
                      <option value="low-to-high">Price: Low to High</option>
                      <option value="high-to-low">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="w-full md:w-3/4">
                {paginatedProducts.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">🛋️</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No Offers Available</h3>
                    <p className="text-gray-600 mb-6">We're currently updating our special offers. Check back soon for amazing deals!</p>
                    <Link 
                      to="/products" 
                      className="inline-block bg-wood-brown text-white px-6 py-3 rounded-lg hover:bg-wood-accent transition duration-300"
                    >
                      Browse All Products
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                      {paginatedProducts.map((product) => (
                        <div key={product.id} className="group bg-white rounded-lg shadow-lg overflow-hidden relative">
                          {/* Discount Badge */}
                          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                            {product.discountPercentage}% OFF
                          </div>

                          <div className="w-full h-64 overflow-hidden rounded-t-lg bg-gray-200">
                            <img
                              src={product.images[0]}
                              alt={product.productName}
                              className="h-full w-full object-cover object-center group-hover:opacity-75"
                            />
                          </div>
                          <div className="p-4">
                            <Link to={`/product/${product.id}`} className="block">
                              <h3 className="font-bold text-lg text-wood-brown hover:text-wood-accent hover:underline transition duration-200">{product.productName}</h3>
                            </Link>
                            <div className="mt-2">
                              {product.discountPrice && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 line-through text-sm">Rs.{product.price}</span>
                                  <span className="text-red-600 font-bold text-lg">Rs.{product.discountPrice}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-12">
                        <nav className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setCurrentPage(Math.max(1, currentPage - 1));
                              scrollToTop();
                            }}
                            disabled={currentPage === 1}
                            className="px-3 py-2 rounded-md bg-wood-brown text-white hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => {
                                setCurrentPage(page);
                                scrollToTop();
                              }}
                              className={`px-4 py-2 rounded-md transition duration-200 ${
                                currentPage === page
                                  ? 'bg-wood-brown text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-wood-brown hover:text-white'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            onClick={() => {
                              setCurrentPage(Math.min(totalPages, currentPage + 1));
                              scrollToTop();
                            }}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 rounded-md bg-wood-brown text-white hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OffersPage;