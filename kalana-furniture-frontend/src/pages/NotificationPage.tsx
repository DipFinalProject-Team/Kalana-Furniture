import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaBell, FaCalendar, FaCircle } from 'react-icons/fa';

const NotificationPage = () => {
  // Mock data for notifications
  const notifications = [
    {
      id: 1,
      title: 'Order Delivered',
      message: 'Your order #12345 has been successfully delivered. We hope you enjoy your purchase!',
      date: '2023-10-25 14:30',
      isRead: false,
      type: 'order'
    },
    {
      id: 2,
      title: 'New Offer Available',
      message: 'Get 20% off on all living room furniture this weekend! Use code LIVING20.',
      date: '2023-10-24 09:00',
      isRead: true,
      type: 'promo'
    },
    {
      id: 3,
      title: 'Welcome to Kalana Furniture',
      message: 'Thank you for creating an account. Explore our latest collection of handcrafted furniture.',
      date: '2023-10-20 10:15',
      isRead: true,
      type: 'system'
    }
  ];

  return (
    <>
      <Header />
      <div className="bg-[url('/wood-bg.jpg')] bg-cover bg-fixed min-h-screen pt-20 relative">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
              <FaBell className="text-wood-accent" />
              Notifications
            </h1>
            <div className="w-24 h-1 bg-wood-accent mx-auto mb-6"></div>
          </div>

          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border-l-4 transition-all duration-300 hover:transform hover:scale-[1.01] ${
                    notification.isRead ? 'border-gray-300' : 'border-wood-accent'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {!notification.isRead && (
                          <FaCircle className="text-wood-accent text-xs animate-pulse" />
                        )}
                        <h3 className={`text-lg font-bold ${notification.isRead ? 'text-gray-700' : 'text-wood-brown'}`}>
                          {notification.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.type === 'order' ? 'bg-blue-100 text-blue-800' :
                          notification.type === 'promo' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{notification.message}</p>
                      <div className="flex items-center text-gray-400 text-sm">
                        <FaCalendar className="mr-2" />
                        {notification.date}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <FaBell className="mx-auto text-6xl text-white/50 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">No Notifications</h3>
                <p className="text-wood-light">You're all caught up! Check back later for updates.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotificationPage;
