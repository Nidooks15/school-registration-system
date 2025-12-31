'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { studentAPI, paymentAPI } from '@/lib/api';
import { Users, DollarSign, FileCheck, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    approvedStudents: 0,
  });
  const [recentStudents, setRecentStudents] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [studentsRes, paymentsRes] = await Promise.all([
        studentAPI.getAll({ limit: 5 }),
        paymentAPI.getAll({ limit: 100 }),
      ]);

      const students = studentsRes.data.students;
      const payments = paymentsRes.data.payments;

      setStats({
        totalStudents: studentsRes.data.pagination.total,
        pendingApprovals: students.filter((s: any) => s.enrollmentStatus === 'PENDING').length,
        totalRevenue: payments
          .filter((p: any) => p.paymentStatus === 'PAID')
          .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0),
        approvedStudents: students.filter((s: any) => s.enrollmentStatus === 'APPROVED' || s.enrollmentStatus === 'ENROLLED').length,
      });

      setRecentStudents(students);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Overview of school registration system</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card-gradient">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Total Students</p>
                  <p className="text-3xl font-bold">{stats.totalStudents}</p>
                </div>
                <Users className="h-12 w-12 opacity-80" />
              </div>
            </div>

            <div className="card bg-yellow-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Pending Approvals</p>
                  <p className="text-3xl font-bold">{stats.pendingApprovals}</p>
                </div>
                <FileCheck className="h-12 w-12 opacity-80" />
              </div>
            </div>

            <div className="card bg-green-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold">₱{stats.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-12 w-12 opacity-80" />
              </div>
            </div>

            <div className="card bg-blue-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Approved</p>
                  <p className="text-3xl font-bold">{stats.approvedStudents}</p>
                </div>
                <TrendingUp className="h-12 w-12 opacity-80" />
              </div>
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Recent Registrations</h2>
              <a href="/admin/students" className="text-primary-600 hover:text-primary-700 font-semibold">
                View All →
              </a>
            </div>

            {recentStudents.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No students yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{student.firstName} {student.lastName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{student.user.email}</td>
                        <td className="px-4 py-3 text-sm">{student.gradeLevel}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`badge badge-${student.enrollmentStatus.toLowerCase()}`}>
                            {student.enrollmentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(student.createdAt).toLocaleDateString()}
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
