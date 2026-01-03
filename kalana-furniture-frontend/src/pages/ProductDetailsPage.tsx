import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header";
import { allProducts } from '../data/mockdata';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const product = allProducts.find((p) => p.id === Number(id));
  const [currentImage, setCurrentImage] = useState(0);

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <>
      <Header />
      <div className="bg-white py-[150px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row -mx-4">
            {/* Image Gallery */}
            <div className="md:w-1/2 px-4">
              <div className="flex gap-4">
                <div className="flex flex-col gap-2">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        currentImage === index
                          ? "border-blue-500"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img
                        className="w-full h-full object-cover"
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                      />
                    </button>
                  ))}
                </div>
                <div className="flex-1">
                  <div className="h-[500px] rounded-lg bg-gray-100 overflow-hidden">
                    <img
                      className="w-full h-full object-contain"
                      src={product.images[currentImage]}
                      alt={product.name}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details & Purchase */}
            <div className="md:w-1/2 px-4 mt-8 md:mt-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  <span className="text-yellow-500">
                    {"★".repeat(Math.floor(product.rating))}
                    {"☆".repeat(5 - Math.floor(product.rating))}
                  </span>
                  <span className="text-gray-600 ml-2 text-sm">
                    ({(product.reviews?.length || 0)} reviews)
                  </span>
                </div>
                <span className="mx-2 text-gray-300">|</span>
                <span className="text-sm text-gray-600">
                  Category: {product.category}
                </span>
              </div>

              <div className="border rounded-lg p-6 mt-6">
                <div className="flex items-baseline mb-6">
                  {product.discountPrice ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl text-gray-500 line-through">Rs.{product.price.toFixed(2)}</span>
                      <span className="text-4xl font-bold text-red-600">Rs.{product.discountPrice.toFixed(2)}</span>
                    </div>
                  ) : (
                    <span className="text-4xl font-bold text-gray-900">
                      Rs.{product.price.toFixed(2)}
                    </span>
                  )}
                  {product.stock < 10 && product.stock > 0 && (
                    <span className="ml-4 text-red-600 font-semibold">
                      Only {product.stock} left in stock - order soon
                    </span>
                  )}
                </div>

                <div className="flex items-center mb-6">
                  <label htmlFor="quantity" className="font-semibold mr-4">
                    Quantity:
                  </label>
                  <select
                    id="quantity"
                    className="border border-gray-300 rounded-md p-2"
                  >
                    {[...Array(Math.min(product.stock, 10)).keys()].map(
                      (x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="flex flex-col gap-4">
                  <button className="w-full bg-wood-accent text-white py-3 px-6 rounded-full font-bold text-lg hover:bg-wood-accent-hover transition-colors">
                    Buy It Now
                  </button>
                  <button className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-full font-bold text-lg hover:bg-gray-300 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-gray-600">
                  <span className="font-semibold">Availability:</span>{" "}
                  {product.stock > 0 ? (
                    <span className="text-wood-accent font-semibold">
                      In Stock
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      Out of Stock
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Description and Reviews Section */}
          <div className="mt-16">
            <div className="border-t">
              <div className="py-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  About this item
                </h3>
                <div>
                  <h4 className="font-semibold text-lg mb-2">
                    Product Description
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="border-t py-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Customer Reviews ({(product.reviews?.length || 0)})
                  </h3>
                  <Link to={`/review/${product.id}`} className="text-wood-accent px-6 py-2 font-semibold hover:text-wood-accent-hover transition-colors flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Review
                  </Link>
                </div>
                {(product.reviews?.length || 0) > 0 ? (
                  <div className="space-y-6">
                    {product.reviews?.map((review) => (
                      <div key={review.id} className="border-b pb-4">
                        <div className="flex items-center mb-2">
                          <span className="font-bold mr-2">{review.user}</span>
                          <span className="text-yellow-500">
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                          </span>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No reviews yet.</p>
                    <Link to={`/review/${product.id}`} className="bg-wood-accent text-white px-6 py-2 rounded-full font-semibold hover:bg-wood-accent-hover transition-colors">
                      Be the first to review this product
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Similar Products Section */}
          <div className="mt-16">
            <div className="border-t pt-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                You Might Also Like
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {allProducts
                  .filter(p => p.category === product.category && p.id !== product.id)
                  .slice(0, 4)
                  .map((similarProduct) => {
                    const discountPercentage = similarProduct.discountPrice 
                      ? Math.round(((similarProduct.price - similarProduct.discountPrice) / similarProduct.price) * 100)
                      : 0;

                    return (
                    <div key={similarProduct.id} className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
                      {similarProduct.discountPrice && (
                        <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                          -{discountPercentage}%
                        </div>
                      )}
                      <div className="w-full h-64 overflow-hidden bg-gray-200">
                        <img
                          src={similarProduct.images[0]}
                          alt={similarProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <Link 
                          to={`/product/${similarProduct.id}`} 
                          className="block"
                          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                          <h4 className="font-semibold text-lg text-gray-900 mb-2 hover:text-wood-accent transition-colors line-clamp-2">
                            {similarProduct.name}
                          </h4>
                        </Link>
                        <div className="flex items-center mb-2">
                          <span className="text-yellow-500 text-sm">
                            {"★".repeat(Math.floor(similarProduct.rating))}
                            {"☆".repeat(5 - Math.floor(similarProduct.rating))}
                          </span>
                          <span className="text-gray-500 text-sm ml-1">
                            ({similarProduct.rating})
                          </span>
                        </div>
                        <div className="mt-2">
                          {similarProduct.discountPrice ? (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 line-through text-sm">Rs.{similarProduct.price}</span>
                              <span className="text-red-600 font-bold text-xl">Rs.{similarProduct.discountPrice}</span>
                            </div>
                          ) : (
                            <p className="text-wood-accent font-bold text-xl">
                              Rs.{similarProduct.price}
                            </p>
                          )}
                        </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              {allProducts.filter(p => p.category === product.category && p.id !== product.id).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No similar products found in this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailsPage;
