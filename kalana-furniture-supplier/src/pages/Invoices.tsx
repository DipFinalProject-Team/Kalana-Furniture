import React, { useState } from 'react';
import { invoices as mockInvoices, purchaseOrders, supplierProfile } from '../data/mockdata';
import { FaFileInvoiceDollar, FaDownload, FaCheckCircle, FaClock, FaHistory } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Invoice {
  id: string;
  orderId: string;
  amount: number;
  date: string;
  dueDate: string;
  status: string;
  paymentDate: string | null;
}

const Invoices: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'history'>('all');
  const [invoices] = useState<Invoice[]>(mockInvoices);

  const filteredInvoices = activeTab === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.status === 'Paid');

  const handleDownload = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) return;

    const order = purchaseOrders.find(po => po.id === invoice.orderId);
    
    const doc = new jsPDF();

    // Add Company Logo/Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('INVOICE', 105, 20, { align: 'center' });

    // Company Details (From)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('From:', 14, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(supplierProfile.companyName, 14, 45);
    doc.text(supplierProfile.address, 14, 50);
    doc.text(supplierProfile.email, 14, 55);
    doc.text(supplierProfile.contactNumber, 14, 60);

    // Invoice Details
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Details:', 120, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice ID: ${invoice.id}`, 120, 45);
    doc.text(`Date: ${invoice.date}`, 120, 50);
    doc.text(`Due Date: ${invoice.dueDate}`, 120, 55);
    doc.text(`Status: ${invoice.status}`, 120, 60);
    if (invoice.paymentDate) {
        doc.text(`Payment Date: ${invoice.paymentDate}`, 120, 65);
    }

    // Bill To (To)
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 14, 75);
    doc.setFont('helvetica', 'normal');
    doc.text('Kalana Furniture', 14, 80);
    doc.text('Main Showroom & Warehouse', 14, 85);
    
    // Table
    const tableColumn = ["Item", "Quantity", "Unit Price (LKR)", "Total (LKR)"];
    const tableRows = [];

    if (order) {
        const total = order.quantity * order.pricePerUnit;
        const row = [
            order.product,
            order.quantity.toString(),
            order.pricePerUnit.toLocaleString(),
            total.toLocaleString()
        ];
        tableRows.push(row);
    } else {
        tableRows.push(["Unknown Item", "-", "-", invoice.amount.toLocaleString()]);
    }

    autoTable(doc, {
        startY: 95,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [217, 119, 6] }, // Amber-600
        foot: [['', '', 'Total Amount:', `LKR ${invoice.amount.toLocaleString()}`]],
        footStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
    });

    // Footer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable.finalY || 95;
    doc.setFontSize(10);
    doc.text('Thank you for your business!', 105, finalY + 20, { align: 'center' });

    doc.save(`Invoice_${invoice.id}.pdf`);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-serif text-amber-900 mb-6">Invoices & Payments</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          className={`pb-2 px-4 font-medium text-sm transition-colors ${
            activeTab === 'all' 
              ? 'border-b-2 border-amber-600 text-amber-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('all')}
        >
          <div className="flex items-center gap-2">
            <FaFileInvoiceDollar /> All Invoices
          </div>
        </button>
        <button
          className={`pb-2 px-4 font-medium text-sm transition-colors ${
            activeTab === 'history' 
              ? 'border-b-2 border-amber-600 text-amber-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('history')}
        >
          <div className="flex items-center gap-2">
            <FaHistory /> Payment History
          </div>
        </button>
      </div>

      {/* Stats Cards */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Outstanding</p>
              <p className="text-xl font-bold text-amber-600">
                LKR {invoices.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-full text-amber-600">
              <FaClock />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="text-xl font-bold text-green-600">
                LKR {invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full text-green-600">
              <FaCheckCircle />
            </div>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-md border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-amber-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date Issued</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (LKR)</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                {activeTab === 'history' && (
                   <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                )}
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.orderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.dueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  {activeTab === 'history' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.paymentDate || '-'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      onClick={() => handleDownload(invoice.id)}
                      className="text-amber-600 hover:text-amber-900 flex items-center gap-1"
                      title="Download Invoice"
                    >
                      <FaDownload /> <span className="hidden md:inline">Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredInvoices.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No invoices found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;
