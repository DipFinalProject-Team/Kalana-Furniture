import React, { useState, useEffect, useRef } from 'react';
import { 
  FaPlus, FaSearch, FaEdit, FaTrash, FaFilter, FaImage, FaBoxOpen, FaTimes, FaExclamationTriangle,
} from 'react-icons/fa';
import { productService, type Product } from '../services/api';
import Toast from '../components/Toast';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [priceFocused, setPriceFocused] = useState(false);
  const [stockFocused, setStockFocused] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Categories
  const categories = ['All', 'Living Room', 'Bedroom', 'Dining', 'Office'];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: number) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await productService.delete(productToDelete);
        setProducts(products.filter(p => p.id !== productToDelete));
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
      } catch (err) {
        console.error('Failed to delete product', err);
        // Optionally show error toast
      }
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setCurrentProduct(product);
      setIsEditing(true);
    } else {
      setCurrentProduct({
        productName: '',
        sku: '',
        category: 'Living Room',
        price: 0,
        stock: 0,
        status: 'In Stock',
        image: '', // Default placeholder
        images: []
      });
      setIsEditing(false);
    }
    setNewFiles([]);
    setPreviewUrls([]);
    setPriceFocused(false);
    setStockFocused(false);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting to save product:', currentProduct);
    
    // Basic validation
    if (!currentProduct.productName || !currentProduct.sku) {
      showToast('Product Name and SKU are required', 'error');
      return;
    }

    try {
      setLoading(true);
      if (isEditing && currentProduct.id) {
        const updatedProduct = await productService.update(currentProduct.id, currentProduct, newFiles);
        setProducts(products.map(p => p.id === currentProduct.id ? updatedProduct : p));
        showToast('Product updated successfully', 'success');
      } else {
        console.log('Creating new product...');
        const newProduct = await productService.create(currentProduct, newFiles);
        console.log('Product created successfully:', newProduct);
        setProducts([...products, newProduct]);
        showToast('Product created successfully', 'success');
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      console.error('Failed to save product:', err);
      let errorMessage = 'Failed to save product';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'response' in err) {
        const apiError = err as { response?: { data?: { error?: string } } };
        errorMessage = apiError.response?.data?.error || errorMessage;
      }
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentProduct({
      ...currentProduct,
      [name]: (name === 'price' || name === 'stock') ? (value === '' ? 0 : Number(value)) : value
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Validate file types and sizes
      const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
          showToast(`${file.name} is not a valid image file`, 'error');
          return false;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          showToast(`${file.name} is too large (max 5MB)`, 'error');
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      setNewFiles(prev => [...prev, ...validFiles]);
      
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const existingCount = currentProduct.images?.length || 0;
    
    if (index < existingCount) {
      // Remove existing image
      setCurrentProduct(prev => ({
        ...prev,
        images: prev.images?.filter((_, i) => i !== index)
      }));
    } else {
      // Remove new file
      const newIndex = index - existingCount;
      setNewFiles(prev => prev.filter((_, i) => i !== newIndex));
      setPreviewUrls(prev => {
        const urlToRemove = prev[newIndex];
        URL.revokeObjectURL(urlToRemove); // Cleanup
        return prev.filter((_, i) => i !== newIndex);
      });
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen rounded-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
          <p className="text-gray-500 mt-1">Manage your inventory, prices, and stock levels</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-wood-brown text-white rounded-xl hover:bg-wood-brown-dark transition-colors shadow-sm hover:shadow-md"
        >
          <FaPlus />
          Add New Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-wood-brown focus:ring-2 focus:ring-wood-brown/20 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <FaFilter className="text-gray-400" />
          <select
            className="px-4 py-2 rounded-lg border border-gray-200 focus:border-wood-brown focus:ring-2 focus:ring-wood-brown/20 outline-none bg-white w-full md:w-auto"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-brown"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col justify-center items-center py-12">
          <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
          <p className="text-red-600 text-lg font-medium">{error}</p>
          <button 
            onClick={fetchProducts}
            className="mt-4 px-4 py-2 bg-wood-brown text-white rounded-lg hover:bg-wood-brown-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="relative h-48 bg-gray-100">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.productName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    <FaImage className="text-4xl" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(product)}
                    className="p-2 bg-white text-blue-600 rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-2 bg-white text-red-600 rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold ${
                  product.stock === 0 ? 'bg-red-100 text-red-700' :
                  product.stock < 10 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Low Stock' : 'In Stock'}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                    <h3 className="font-bold text-gray-800 line-clamp-1">{product.productName}</h3>
                  </div>
                  <p className="font-bold text-wood-brown">Rs. {product.price}</p>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t border-gray-50">
                  <span className="flex items-center gap-1">
                    <FaBoxOpen className="text-gray-400" />
                    {product.stock} units
                  </span>
                  <span className="text-xs">SKU: {product.sku}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast Notification */}
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                      type="text"
                      name="productName"
                      required
                      value={currentProduct.productName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-wood-brown focus:ring-2 focus:ring-wood-brown/20 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input
                      type="text"
                      name="sku"
                      required
                      value={currentProduct.sku}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-wood-brown focus:ring-2 focus:ring-wood-brown/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      value={currentProduct.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-wood-brown focus:ring-2 focus:ring-wood-brown/20 outline-none bg-white"
                    >
                      {categories.filter(c => c !== 'All').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.)</label>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={(priceFocused && currentProduct.price === 0) ? '' : (currentProduct.price ?? 0)}
                      onChange={handleInputChange}
                      onFocus={() => setPriceFocused(true)}
                      onBlur={() => setPriceFocused(false)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-wood-brown focus:ring-2 focus:ring-wood-brown/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      name="stock"
                      required
                      min="0"
                      placeholder="0"
                      value={(stockFocused && currentProduct.stock === 0) ? '' : (currentProduct.stock ?? 0)}
                      onChange={handleInputChange}
                      onFocus={() => setStockFocused(true)}
                      onBlur={() => setStockFocused(false)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-wood-brown focus:ring-2 focus:ring-wood-brown/20 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  multiple 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-wood-brown transition-colors cursor-pointer bg-gray-50"
                >
                  <FaImage className="mx-auto text-4xl text-gray-400 mb-2" />
                  <p className="text-gray-600 font-medium">Click to upload images</p>
                  <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                </div>
                
                {/* Image Previews */}
                {((currentProduct.images && currentProduct.images.length > 0) || previewUrls.length > 0) && (
                  <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                    {[...(currentProduct.images || []), ...previewUrls].map((img, index) => (
                      <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 group">
                        <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTimes size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-2 bg-wood-brown text-white rounded-lg hover:bg-wood-brown-dark transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    isEditing ? 'Save Changes' : 'Create Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Product</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
