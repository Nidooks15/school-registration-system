'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { paymentAPI } from '@/lib/api';
import { Download, Filter } from 'lucide-react';

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, failed: 0 });

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  const loadPayments = async () => {
    try {
      const params: any = { limit: 100 };
      if (statusFilter) params.status = statusFilter;

      const response = await paymentAPI.getAll(params);
      setPayments(response.data.payments);

      // Calculate stats
      const allPayments = response.data.payments;
      setStats({
        total: allPayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0),
        paid: allPayments.filter((p: any) => p.paymentStatus === 'PAID').reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0),
        pending: allPayments.filter((p: any) => p.paymentStatus === 'PENDING').length,
        failed: allPayments.filter((p: any) => p.paymentStatus === 'FAILED').length,
      });
    } catch (error) {
      console.error('Failed to load payments:', error);
    }
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600 mt-2">View and manage all payments</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">₱{stats.total.toFixed(2)}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Paid</p>
              <p className="text-2xl font-bold text-green-600">₱{stats.paid.toFixed(2)}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
          </div>

          {/* Filter */}
          <div className="card mb-6">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field flex-1"
              >
                <option value="">All Statuses</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          {/* Payments Table */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Payment History</h2>
            {payments.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No payments found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Method</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{new Date(payment.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm">
                          {payment.student.firstName} {payment.student.lastName}
                          <br />
                          <span className="text-xs text-gray-500">{payment.student.gradeLevel}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">{payment.paymentType.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3 text-sm font-semibold">₱{parseFloat(payment.amount).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">{payment.paymentMethod}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`badge badge-${payment.paymentStatus.toLowerCase()}`}>
                            {payment.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {payment.receiptUrl && (
                            <a
                              href={payment.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700"
                            >
                              <Download className="h-4 w-4 inline" />
                            </a>
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
