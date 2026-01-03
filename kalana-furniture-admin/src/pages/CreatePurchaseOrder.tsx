import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaCalendar, FaTags, FaCheck, FaEye, FaTimes } from 'react-icons/fa';
import { suppliers, inventoryData } from '../data/mockData';
import Toast from '../components/Toast';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  categories: string;
  joinedDate: string;
  status: string;
}

interface InventoryItem {
  id: number;
  productName: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  lastUpdated: string;
  image: string;
}

const CreatePurchaseOrder: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const productId = location.state?.productId;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [product, setProduct] = useState<InventoryItem | null>(null);
  const [showSupplierDetails, setShowSupplierDetails] = useState(false);
  const [supplierForDetails, setSupplierForDetails] = useState<Supplier | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  useEffect(() => {
    if (productId) {
      const foundProduct = inventoryData.find(p => p.id === productId);
      setProduct(foundProduct || null);
    }
  }, [productId]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.categories.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOrder = () => {
    if (!selectedSupplier || !product || !expectedDelivery) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Create the purchase order
    const order = {
      id: `PO-${Math.floor(Math.random() * 1000)}`,
      productName: product.productName,
      quantity: quantity,
      expectedDelivery: expectedDelivery,
      pricePerUnit: product.price, // Using product price as default, can be adjusted
      status: 'Pending',
      orderDate: new Date().toISOString().split('T')[0],
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name
    };

    // Save to localStorage (simulating backend)
    const savedOrders = localStorage.getItem('kalana_purchase_orders');
    const currentOrders = savedOrders ? JSON.parse(savedOrders) : [];
    localStorage.setItem('kalana_purchase_orders', JSON.stringify([...currentOrders, order]));

    showToast('Purchase Order created successfully!', 'success');

    // Navigate back to inventory after a short delay
    setTimeout(() => {
      navigate('/inventory');
    }, 2000);
  };

  if (!product) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Product not found. Please go back to inventory.</p>
          <button
            onClick={() => navigate('/inventory')}
            className="mt-4 px-4 py-2 bg-wood-brown text-white rounded-lg hover:bg-opacity-90"
            style={{ backgroundColor: '#8B4513' }}
          >
            Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen rounded-2xl">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/inventory')}
          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Create Purchase Order</h1>
          <p className="text-gray-500 mt-1">Select a supplier and create an order for {product.productName}</p>
        </div>
      </div>

      {/* Product Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Product Details</h2>
        <div className="flex items-center gap-4">
          <img
            src={product.image}
            alt={product.productName}
            className="w-20 h-20 rounded-lg object-cover border border-gray-200"
          />
          <div>
            <h3 className="font-bold text-gray-800">{product.productName}</h3>
            <p className="text-gray-600">SKU: {product.sku}</p>
            <p className="text-gray-600">Category: {product.category}</p>
            <p className="text-gray-600">Current Stock: {product.stock}</p>
            <p className="text-gray-600">Price: Rs. {product.price}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Suppliers List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Select Supplier</h2>

            {/* Search Bar */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search suppliers by name, contact person, or categories..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedSupplier?.id === supplier.id
                    ? 'bg-wood-brown bg-opacity-10 border-l-4 border-wood-brown'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedSupplier(supplier)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-800">{supplier.name}</h3>
                      {selectedSupplier?.id === supplier.id && (
                        <FaCheck className="text-wood-brown" />
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaUser size={12} />
                        <span>{supplier.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaEnvelope size={12} />
                        <span>{supplier.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhone size={12} />
                        <span>{supplier.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaTags size={12} />
                        <span>{supplier.categories}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCalendar size={12} />
                        <span>Joined: {supplier.joinedDate}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSupplierForDetails(supplier);
                      setShowSupplierDetails(true);
                    }}
                    className="p-2 text-gray-400 hover:text-wood-brown transition-colors"
                    title="View supplier details"
                  >
                    <FaEye size={16} />
                  </button>
                </div>
              </div>
            ))}

            {filteredSuppliers.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No suppliers found matching your search.
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Order Details</h2>

          {selectedSupplier && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-2">Selected Supplier</h3>
              <p className="text-gray-600">{selectedSupplier.name}</p>
              <p className="text-sm text-gray-500">{selectedSupplier.contactPerson}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wood-brown"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wood-brown"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Estimated Total:</span>
                <span className="font-bold text-gray-800">Rs. {quantity * product.price}</span>
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={!selectedSupplier || !expectedDelivery}
                className="w-full py-3 bg-wood-brown text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                style={{ backgroundColor: selectedSupplier && expectedDelivery ? '#8B4513' : undefined }}
              >
                Create Purchase Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Details Modal */}
      {showSupplierDetails && supplierForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Supplier Details</h2>
              <button 
                onClick={() => setShowSupplierDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Company Name</p>
                      <p className="font-medium text-gray-800">{supplierForDetails.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-medium text-gray-800">{supplierForDetails.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Categories</p>
                      <p className="font-medium text-gray-800">{supplierForDetails.categories}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        supplierForDetails.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {supplierForDetails.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">{supplierForDetails.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-800">{supplierForDetails.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Joined Date</p>
                      <p className="font-medium text-gray-800">{supplierForDetails.joinedDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Supplier ID</p>
                      <p className="font-medium text-gray-800 font-mono">{supplierForDetails.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowSupplierDetails(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedSupplier(supplierForDetails);
                    setShowSupplierDetails(false);
                    showToast(`Selected ${supplierForDetails.name} for order`, 'success');
                  }}
                  className="px-4 py-2 bg-wood-brown text-white rounded-lg hover:bg-opacity-90 transition-colors"
                  style={{ backgroundColor: '#8B4513' }}
                >
                  Select This Supplier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePurchaseOrder;