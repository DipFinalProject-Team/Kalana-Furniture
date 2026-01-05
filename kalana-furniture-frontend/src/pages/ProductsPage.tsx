import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { productService, categoryService, promotionService } from '../services/api';
import type { Product, Promotion } from '../services/api';

const ProductsPage = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [sortOrder, setSortOrder] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Function to apply promotions to a product
  const applyPromotionsToProduct = (product: Product, promotionsList: Promotion[]): Product & { discountPrice?: number; discountPercentage?: number } => {
    let bestDiscountPrice = product.discountPrice || product.price; // Start with existing discount or original price
    let bestDiscountPercentage = 0;

    promotionsList.forEach(promotion => {
      // Only apply general discounts (where code is null)
      if (promotion.code !== null) return;
      
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
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching products, categories, and promotions...');
        const [productsData, categoriesData, promotionsData] = await Promise.all([
          productService.getAll(),
          categoryService.getAll(),
          promotionService.getActive()
        ]);
        
        console.log('Products data:', productsData);
        console.log('Categories data:', categoriesData);
        console.log('Promotions data:', promotionsData);
        
        // Apply promotions to products
        const productsWithPromotions = productsData.map((product: Product) => 
          applyPromotionsToProduct(product, promotionsData)
        );
        
        setAllProducts(productsWithPromotions);
        setProducts(productsWithPromotions);
        
        // Set categories from backend
        const categoryNames = ['All', ...categoriesData.map(cat => cat.name)];
        setCategories(categoryNames);
        console.log('Categories set:', categoryNames);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set empty arrays on error to prevent infinite loading
        setAllProducts([]);
        setProducts([]);
        setCategories(['All']);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle filtering
  useEffect(() => {
    if (allProducts.length === 0) return;

    let filtered = allProducts;

    if (searchTerm) {
      filtered = filtered.filter(p => p.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    if (sortOrder === 'low-to-high') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'high-to-low') {
      filtered.sort((a, b) => b.price - a.price);
    }

    setProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedCategory, priceRange, sortOrder, allProducts]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-600">Loading products...</div>
        </div>
      </>
    );
  }

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
    <div>
      <Header />
    </div>
    <div className="bg-[url('/wood-bg.jpg')] pt-20 bg-cover bg-fixed min-h-screen">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 border border-wood-brown rounded-lg p-6 bg-wood-brown bg-opacity-60">
          <h1 className="font-serif text-4xl font-bold text-white tracking-tight sm:text-5xl">All Products</h1>
          <p className="mt-4 text-xl text-white">
            Discover our curated collection of high-quality furniture.
          </p>
        </div>

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
                  placeholder="Search products..."
                  className="mt-1 block w-full p-2 border border-wood-light rounded-md"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  id="category"
                  className="mt-1 block w-full p-2 border border-wood-light rounded-md"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
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
                      max="100000"
                      step="10"
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
                      max="100000"
                      step="10"
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
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No products found.</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters or check back later.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                  {paginatedProducts.map((product) => {
                    const discountPercentage = product.discountPrice 
                      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                      : 0;

                    return (
                    <div key={product.id} className="group bg-white rounded-lg shadow-lg overflow-hidden relative">
                      {product.discountPrice && (
                        <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                          -{discountPercentage}%
                        </div>
                      )}
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
      </div>
    </div>
    </>
  );
};

export default ProductsPage;
