import { useState, useEffect } from 'react';
import { FiBell, FiClock, FiAlertCircle, FiMessageSquare } from 'react-icons/fi';
import { supplierService } from '../services/api';

interface Notification {
  elementId?: number;
  id?: number;
  supplier_contact_form_id?: number;
  message: string;
  response: string;
  created_at: string;
  status: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supplierService.getNotifications();
      // data.data contains the array
      setNotifications(data.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    return <FiMessageSquare className="text-blue-500" />;
  };

  const getBgColor = () => {
    return 'bg-blue-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-brown"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-wood-brown">Notifications</h1>
          <p className="text-gray-600">Responses from the administrator.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FiAlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-orange-100/50 overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div 
                key={notification.supplier_contact_form_id || notification.id || Math.random()} 
                className="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getBgColor()}`}>
                    {getIcon()}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-wood-brown">
                        Response from Admin
                      </h3>
                      <span className="text-xs text-gray-500 flex items-center">
                        <FiClock className="mr-1" />
                        {new Date(notification.created_at).toLocaleDateString()} {new Date(notification.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-wood-brown">
                       <p className="text-xs text-gray-500 mb-1 font-semibold uppercase">Your Inquiry:</p>
                       <p className="text-gray-600 text-sm italic">"{notification.message}"</p>
                    </div>

                    <div className="mt-2">
                      <p className="text-gray-800 text-sm font-medium">
                        {notification.response}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiBell className="text-3xl text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No notifications yet</h3>
            <p className="text-gray-500 mt-1">We'll notify you when the admin responds to your inquiries.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
