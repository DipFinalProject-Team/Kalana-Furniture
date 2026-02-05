import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaBell, FaCalendar, FaCircle } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { contactService, type ContactForm } from '../services/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'response' | 'system';
}

const NotificationPage = () => {
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

      const contactForms = await contactService.getAll();

      // Transform contact forms with responses into notifications
      const responseNotifications: Notification[] = contactForms
        .filter((form: ContactForm) => form.response && form.response.trim() !== '')
        .map((form: ContactForm) => ({
          id: form.id,
          title: `Response to your inquiry`,
          message: form.response!,
          date: new Date(form.created_at).toLocaleString(),
          isRead: false, // You could track read status in the database
          type: 'response' as const
        }));

      // Add a welcome notification if there are no responses yet
      if (responseNotifications.length === 0) {
        responseNotifications.push({
          id: 999,
          title: 'Welcome to Kalana Furniture',
          message: 'Thank you for creating an account. Explore our latest collection of handcrafted furniture.',
          date: new Date().toLocaleString(),
          isRead: true,
          type: 'system'
        });
      }

      setNotifications(responseNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
      // Fallback to default notification
      setNotifications([{
        id: 999,
        title: 'Welcome to Kalana Furniture',
        message: 'Thank you for creating an account. Explore our latest collection of handcrafted furniture.',
        date: new Date().toLocaleString(),
        isRead: true,
        type: 'system'
      }]);
    } finally {
      setLoading(false);
    }
  };

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
            {loading ? (
              <div className="text-center py-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-accent mx-auto mb-4"></div>
                <p className="text-wood-light">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-red-50/10 backdrop-blur-md rounded-2xl border border-red-200/20">
                <div className="text-6xl text-red-400/50 mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-red-300 mb-2">Error Loading Notifications</h3>
                <p className="text-red-200 mb-4">{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : notifications.length > 0 ? (
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
                          notification.type === 'response' ? 'bg-blue-100 text-blue-800' :
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
