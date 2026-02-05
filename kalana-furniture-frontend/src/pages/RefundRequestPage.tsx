import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import Toast from '../components/Toast';
import { refundService } from '../services/api';

const RefundRequestPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const orderId = location.state?.orderId;

    useEffect(() => {
        if (!orderId) {
            navigate('/orders');
        }
    }, [orderId, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            setToast({ message: 'Please enter a reason for the refund request.', type: 'error' });
            return;
        }

        setIsSubmitting(true);

        try {
            if (user && orderId) {
                await refundService.create({
                    order_id: orderId,
                    user_id: user.id,
                    message: message
                });
                setToast({ message: 'Refund request sent successfully.', type: 'success' });
                setTimeout(() => {
                    navigate('/orders');
                }, 2000);
            }
        } catch (error) {
            console.error(error);
            setToast({ message: 'Failed to send refund request.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!orderId) return null;

    return (
        <>
            <Header />
            <div className="bg-[url('/wood-bg.jpg')] bg-cover bg-fixed min-h-screen pt-20 relative">
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10">
                   <div className="bg-white/10 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-white/20">
                    <h1 className="text-3xl font-serif font-bold text-white mb-6">Request Refund / Return</h1>
                    <p className="text-wood-light mb-6">
                        Order ID: <span className="text-white font-bold">#{orderId}</span>
                    </p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-wood-light mb-2">
                                Reason for Request
                            </label>
                            <textarea
                                id="message"
                                rows={5}
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wood-accent focus:border-transparent transition-all duration-300"
                                placeholder="Please describe why you want to cancel or return this product..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/orders')}
                                className="flex-1 px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all duration-300 font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-3 bg-wood-accent text-white rounded-lg hover:bg-wood-accent-hover transition-all duration-300 font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Request'}
                            </button>
                        </div>
                    </form>
                   </div>
                </div>
            </div>
            <Footer />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
};

export default RefundRequestPage;
