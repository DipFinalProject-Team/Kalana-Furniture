import React, { useState } from 'react';
import { 
  FaPlus, FaSearch, FaEdit, FaTrash, FaFilter, FaImage, FaBoxOpen, FaTimes,
} from 'react-icons/fa';
import { inventoryData } from '../data/mockData';

interface Product {
  id: number;
  productName: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  lastUpdated: string;
  image: string;
  description?: string;
  images?: string[]; // For multiple images
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(inventoryData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  // Categories derived from data
  const categories = ['All', ...new Set(inventoryData.map(item => item.category))];

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

  const confirmDelete = () => {
    if (productToDelete) {
      setProducts(products.filter(p => p.id !== productToDelete));
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
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
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Default placeholder
        images: []
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    const calculatedStatus = (currentProduct.stock || 0) > 10 ? 'In Stock' : (currentProduct.stock || 0) > 0 ? 'Low Stock' : 'Out of Stock';

    if (isEditing && currentProduct.id) {
      setProducts(products.map(p => p.id === currentProduct.id ? { 
        ...currentProduct as Product, 
        status: calculatedStatus,
        lastUpdated: new Date().toISOString().split('T')[0] 
      } : p));
    } else {
      const newProduct: Product = {
        ...currentProduct as Product,
        id: Math.max(...products.map(p => p.id)) + 1,
        lastUpdated: new Date().toISOString().split('T')[0],
        status: calculatedStatus
      };
      setProducts([...products, newProduct]);
    }
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentProduct({
      ...currentProduct,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value
    });
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
            <div className="relative h-48 bg-gray-100">
              <img 
                src={product.image} 
                alt={product.productName} 
                className="w-full h-full object-cover"
              />
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
                <p className="font-bold text-wood-brown">${product.price}</p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      value={currentProduct.price}
                      onChange={handleInputChange}
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
                      value={currentProduct.stock}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-wood-brown focus:ring-2 focus:ring-wood-brown/20 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-wood-brown transition-colors cursor-pointer bg-gray-50">
                  <FaImage className="mx-auto text-4xl text-gray-400 mb-2" />
                  <p className="text-gray-600 font-medium">Click to upload images</p>
                  <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                </div>
                {/* Mock image preview */}
                {currentProduct.image && (
                  <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      <img src={currentProduct.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    {/* Placeholder for multiple images */}
                    {[1, 2].map(i => (
                      <div key={i} className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 flex-shrink-0">
                        <FaImage />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-wood-brown text-white rounded-lg hover:bg-wood-brown-dark transition-colors"
                >
                  {isEditing ? 'Save Changes' : 'Create Product'}
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
