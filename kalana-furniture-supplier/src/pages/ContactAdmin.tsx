import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiSend, FiUser, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { supplierService } from '../services/api';
import Toast from '../components/Toast';
import Cookies from 'js-cookie';

interface SupplierUser {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
}

const ContactAdmin = () => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [user, setUser] = useState<SupplierUser | null>(null);

  useEffect(() => {
    const userData = Cookies.get('supplierUser') || localStorage.getItem('supplierUser');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setToast({ message: 'Please enter a message', type: 'error' });
      return;
    }

    if (!user?.id) {
        setToast({ message: 'User session not found. Please log in again.', type: 'error' });
        return;
    }

    setIsSubmitting(true);
    try {
      await supplierService.submitContactForm({
        supplier_id: user.id,
        message: message
      });
      setToast({ message: 'Message sent successfully to admin!', type: 'success' });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setToast({ message: 'Failed to send message. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-wood-brown">Contact Admin</h1>
          <p className="text-gray-600">Send a message to the administrator for support or inquiries.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-orange-100/50 p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Name</label>
                <div className="flex items-center text-gray-700 font-medium">
                  <FiUser className="mr-2 text-wood-accent" />
                  {user.companyName}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Number</label>
                <div className="flex items-center text-gray-700 font-medium">
                  <FiPhone className="mr-2 text-wood-accent" />
                  {user.phone}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                <div className="flex items-center text-gray-700 font-medium">
                  <FiMail className="mr-2 text-wood-accent" />
                  {user.email}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</label>
                <div className="flex items-center text-gray-700 font-medium">
                  <FiMapPin className="mr-2 text-wood-accent" />
                  {user.address}
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>
            <div className="relative">
              <textarea
                id="message"
                rows={6}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-accent/50 focus:border-wood-accent transition-all duration-200 resize-none"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
              />
              <div className="absolute top-3 right-3 text-gray-400">
                <FiMessageSquare />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                flex items-center gap-2 px-6 py-2.5 bg-wood-accent text-white rounded-lg font-medium shadow-sm transition-all duration-200
                ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-wood-accent-hover hover:shadow-md active:transform active:scale-95'}
              `}
            >
              <FiSend />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ContactAdmin;
