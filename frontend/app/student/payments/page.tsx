'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { paymentAPI } from '@/lib/api';
import { CreditCard, Download, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function PaymentForm({ studentId, onSuccess }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('REGISTRATION_FEE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !amount) return;

    setLoading(true);
    try {
      // Create payment intent
      console.log('Creating payment intent...', { studentId, amount, paymentType });
      const { data } = await paymentAPI.createIntent({
        studentId,
        amount: parseFloat(amount),
        paymentType,
      });

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        console.error('Card element not found');
        return;
      }

      // Confirm payment
      console.log('Confirming card payment with Stripe...');
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        console.error('Stripe confirmation error:', error);
        toast.error(error.message || 'Payment failed');
      } else if (paymentIntent?.status === 'succeeded') {
        console.log('Stripe payment succeeded, confirming on backend...');
        // Confirm payment on backend
        await paymentAPI.confirm(data.paymentId);
        toast.success('Payment successful!');
        onSuccess();
        setAmount('');
      } else {
        console.warn('Payment intent status:', paymentIntent?.status);
        toast.error(`Payment status: ${paymentIntent?.status}`);
      }
    } catch (error: any) {
      console.error('Payment process error:', error);
      toast.error(error.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
        <select
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
          className="input-field"
        >
          <option value="REGISTRATION_FEE">Registration Fee</option>
          <option value="TUITION_DOWN_PAYMENT">Tuition Down Payment</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₱)</label>
        <input
          type="number"
          min="1"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-field"
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
        <div className="border border-gray-300 rounded-lg p-3">
          <CardElement options={{
            style: {
              base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } },
            },
          }} />
        </div>
      </div>

      <button type="submit" disabled={!stripe || loading} className="w-full btn-primary">
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

export default function StudentPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (user?.studentId) {
      loadPayments();
    }
  }, [user]);

  const loadPayments = async () => {
    try {
      const response = await paymentAPI.getByStudent(user!.studentId!);
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    }
  };

  const downloadReceipt = async (paymentId: string) => {
    try {
      const response = await paymentAPI.getReceipt(paymentId);
      window.open(response.data.receiptUrl, '_blank');
    } catch (error: any) {
      toast.error('Failed to download receipt');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      PENDING: <span className="badge badge-pending"><Clock className="h-4 w-4 mr-1" /> Pending</span>,
      PAID: <span className="badge badge-paid"><CheckCircle className="h-4 w-4 mr-1" /> Paid</span>,
      FAILED: <span className="badge badge-failed"><XCircle className="h-4 w-4 mr-1" /> Failed</span>,
    };
    return badges[status] || status;
  };

  return (
    <ProtectedRoute requiredRole="STUDENT">
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600 mt-2">Manage your payments and view history</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <CreditCard className="h-6 w-6 mr-2 text-primary-600" />
                Make a Payment
              </h2>
              <Elements stripe={stripePromise}>
                <PaymentForm studentId={user?.studentId} onSuccess={loadPayments} />
              </Elements>
            </div>

            {/* Payment Summary */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Payment Summary</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₱{payments.filter(p => p.paymentStatus === 'PAID').reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="card mt-8">
            <h2 className="text-xl font-bold mb-4">Payment History</h2>
            {payments.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No payments yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{new Date(payment.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm">{payment.paymentType.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3 text-sm font-semibold">₱{parseFloat(payment.amount).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">{getStatusBadge(payment.paymentStatus)}</td>
                        <td className="px-4 py-3 text-sm">
                          {payment.receiptUrl && (
                            <button
                              onClick={() => downloadReceipt(payment.id)}
                              className="text-primary-600 hover:text-primary-700 flex items-center"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
