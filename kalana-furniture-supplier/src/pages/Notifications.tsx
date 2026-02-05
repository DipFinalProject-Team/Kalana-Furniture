import { FiBell, FiPackage, FiCheckCircle, FiInfo, FiClock, FiAlertCircle } from 'react-icons/fi';

const Notifications = () => {
  // Mock data for supplier notifications
  const notifications = [
    {
      id: 1,
      title: 'New Purchase Order Received',
      message: 'You have received a new purchase order #PO-2023-001 from admin. Please review and confirm availability.',
      date: '2023-11-15 09:30 AM',
      isRead: false,
      type: 'order'
    },
    {
      id: 2,
      title: 'Invoice Approved',
      message: 'Your invoice #INV-2023-056 for $4,500 has been approved and sent for payment processing.',
      date: '2023-11-14 02:15 PM',
      isRead: true,
      type: 'payment'
    },
    {
      id: 3,
      title: 'Stock Level Alert',
      message: 'The inventory for "Teak Wood Planks" is running low. Please update your stock availability.',
      date: '2023-11-12 11:00 AM',
      isRead: true,
      type: 'alert'
    },
    {
      id: 4,
      title: 'System Maintenance',
      message: 'The supplier portal will undergo scheduled maintenance on Sunday, Nov 19th from 2 AM to 4 AM.',
      date: '2023-11-10 08:00 AM',
      isRead: true,
      type: 'system'
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <FiPackage className="text-blue-500" />;
      case 'payment': return <FiCheckCircle className="text-green-500" />;
      case 'alert': return <FiAlertCircle className="text-red-500" />;
      default: return <FiInfo className="text-gray-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-blue-50';
      case 'payment': return 'bg-green-50';
      case 'alert': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-wood-brown">Notifications</h1>
          <p className="text-gray-600">Updates and alerts from the administrator.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-orange-100/50 overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-6 hover:bg-gray-50 transition-colors duration-200 ${!notification.isRead ? 'bg-orange-50/30' : ''}`}
              >
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getBgColor(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${!notification.isRead ? 'text-wood-brown' : 'text-gray-700'}`}>
                        {notification.title}
                        {!notification.isRead && (
                          <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500"></span>
                        )}
                      </h3>
                      <span className="text-xs text-gray-500 flex items-center">
                        <FiClock className="mr-1" />
                        {notification.date}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {notification.message}
                    </p>
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
            <p className="text-gray-500 mt-1">We'll notify you when something important arrives.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
