export const supplierProfile = {
  companyName: 'Kalana Furniture Suppliers',
  contactNumber: '+94 77 123 4567',
  email: 'admin@kalana.com',
  address: '123 Furniture Road, Colombo 03, Sri Lanka',
  bankDetails: ''
};

export const dashboardStats = {
  totalProductsSupplied: 1250,
  pendingSupplyOrders: 15,
  completedSupplies: 342,
  totalEarnings: 'LKR 4,500,000',
  newPurchaseRequests: 8
};

export const recentSupplyOrders = [
  { id: 'ORD-001', product: 'Teak Dining Table', quantity: 5, date: '2024-01-02', status: 'Pending' },
  { id: 'ORD-002', product: 'Mahogany Chair', quantity: 20, date: '2024-01-01', status: 'Completed' },
  { id: 'ORD-003', product: 'Oak Coffee Table', quantity: 10, date: '2023-12-30', status: 'Processing' },
  { id: 'ORD-004', product: 'King Size Bed Frame', quantity: 3, date: '2023-12-28', status: 'Completed' },
  { id: 'ORD-005', product: 'Bedside Lamp', quantity: 50, date: '2023-12-25', status: 'Pending' },
];

export const lowStockRequests = [
  { id: 'REQ-001', product: 'Office Desk', requestedQty: 15, urgency: 'High' },
  { id: 'REQ-002', product: 'Ergonomic Chair', requestedQty: 25, urgency: 'Medium' },
  { id: 'REQ-003', product: 'Bookshelf', requestedQty: 10, urgency: 'Low' },
];

export const purchaseOrders = [
  { 
    id: 'PO-MOCK-001', 
    product: 'Modern Sofa Set', 
    quantity: 5, 
    expectedDelivery: '2024-02-01', 
    pricePerUnit: 1200, 
    status: 'Delivered',
    orderDate: '2024-01-15',
    actualDeliveryDate: '2024-01-30',
    deliveryNotes: 'Delivered to warehouse',
    deliveryProof: 'proof.jpg'
  },
  { 
    id: 'PO-001', 
    product: 'Teak Dining Table', 
    quantity: 5, 
    expectedDelivery: '2024-01-10', 
    pricePerUnit: 45000, 
    status: 'Pending',
    orderDate: '2024-01-02',
    actualDeliveryDate: '',
    deliveryNotes: '',
    deliveryProof: ''
  },
  { 
    id: 'PO-002', 
    product: 'Mahogany Chair', 
    quantity: 20, 
    expectedDelivery: '2024-01-08', 
    pricePerUnit: 8500, 
    status: 'Accepted',
    orderDate: '2024-01-01',
    actualDeliveryDate: '',
    deliveryNotes: 'Scheduled for pickup on Monday',
    deliveryProof: ''
  },
  { 
    id: 'PO-003', 
    product: 'Oak Coffee Table', 
    quantity: 10, 
    expectedDelivery: '2024-01-15', 
    pricePerUnit: 25000, 
    status: 'Dispatched',
    orderDate: '2023-12-30',
    actualDeliveryDate: '',
    deliveryNotes: 'In transit via City Couriers',
    deliveryProof: ''
  },
  { 
    id: 'PO-004', 
    product: 'King Size Bed Frame', 
    quantity: 3, 
    expectedDelivery: '2024-01-05', 
    pricePerUnit: 85000, 
    status: 'Delivered',
    orderDate: '2023-12-28',
    actualDeliveryDate: '2024-01-05',
    deliveryNotes: 'Delivered to warehouse B',
    deliveryProof: 'proof_po004.pdf'
  },
  { 
    id: 'PO-005', 
    product: 'Bedside Lamp', 
    quantity: 50, 
    expectedDelivery: '2024-01-20', 
    pricePerUnit: 3500, 
    status: 'Pending',
    orderDate: '2023-12-25',
    actualDeliveryDate: '',
    deliveryNotes: '',
    deliveryProof: ''
  },
  { 
    id: 'PO-006', 
    product: 'Office Desk', 
    quantity: 15, 
    expectedDelivery: '2023-12-15', 
    pricePerUnit: 12000, 
    status: 'Completed',
    orderDate: '2023-12-01',
    actualDeliveryDate: '2023-12-14',
    deliveryNotes: 'Received in good condition',
    deliveryProof: 'proof_po006.pdf'
  },
];

export const supplierProducts = [
  {
    id: 'PROD-001',
    name: 'Teak Wood (Grade A)',
    category: 'Raw Material',
    unitPrice: 1500,
    unit: 'per sqft',
    availability: 'In Stock',
    estimatedDelivery: '3-5 Days',
    image: 'https://images.unsplash.com/photo-1542834260-616c508d845f?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'PROD-002',
    name: 'Mahogany Wood',
    category: 'Raw Material',
    unitPrice: 1200,
    unit: 'per sqft',
    availability: 'Low Stock',
    estimatedDelivery: '5-7 Days',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'PROD-003',
    name: 'Furniture Varnish',
    category: 'Consumable',
    unitPrice: 2500,
    unit: 'per liter',
    availability: 'In Stock',
    estimatedDelivery: '1-2 Days',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'PROD-004',
    name: 'Drawer Handles (Brass)',
    category: 'Hardware',
    unitPrice: 450,
    unit: 'per unit',
    availability: 'Out of Stock',
    estimatedDelivery: '10-14 Days',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'PROD-005',
    name: 'Upholstery Fabric (Velvet)',
    category: 'Fabric',
    unitPrice: 1800,
    unit: 'per meter',
    availability: 'In Stock',
    estimatedDelivery: '2-4 Days',
    image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?q=80&w=1000&auto=format&fit=crop'
  }
];

export const invoices = [
  {
    id: 'INV-2024-001',
    orderId: 'PO-002',
    amount: 170000,
    date: '2024-01-08',
    dueDate: '2024-02-08',
    status: 'Paid',
    paymentDate: '2024-01-15'
  },
  {
    id: 'INV-2024-002',
    orderId: 'PO-004',
    amount: 255000,
    date: '2024-01-05',
    dueDate: '2024-02-05',
    status: 'Paid',
    paymentDate: '2024-01-10'
  },
  {
    id: 'INV-2024-003',
    orderId: 'PO-003',
    amount: 250000,
    date: '2024-01-15',
    dueDate: '2024-02-15',
    status: 'Pending',
    paymentDate: null
  },
  {
    id: 'INV-2024-004',
    orderId: 'PO-001',
    amount: 225000,
    date: '2024-01-10',
    dueDate: '2024-02-10',
    status: 'Pending',
    paymentDate: null
  }
];
