'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { studentAPI } from '@/lib/api';
import { Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [search, statusFilter]);

  const loadStudents = async () => {
    try {
      const params: any = { limit: 50 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await studentAPI.getAll(params);
      setStudents(response.data.students);
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  const updateStatus = async (studentId: string, status: string) => {
    setLoading(true);
    try {
      await studentAPI.updateStatus(studentId, status);
      toast.success('Status updated successfully');
      loadStudents();
      if (selectedStudent?.id === studentId) {
        const response = await studentAPI.getById(studentId);
        setSelectedStudent(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const viewStudent = async (studentId: string) => {
    try {
      const response = await studentAPI.getById(studentId);
      setSelectedStudent(response.data);
    } catch (error) {
      toast.error('Failed to load student details');
    }
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
            <p className="text-gray-600 mt-2">Review and manage student registrations</p>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="ENROLLED">Enrolled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Students List */}
            <div className="lg:col-span-2 card">
              <h2 className="text-xl font-bold mb-4">Students ({students.length})</h2>
              {students.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No students found</p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors cursor-pointer"
                      onClick={() => viewStudent(student.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{student.firstName} {student.lastName}</h3>
                          <p className="text-sm text-gray-600">{student.user.email}</p>
                          <p className="text-sm text-gray-600">{student.gradeLevel}</p>
                        </div>
                        <div className="text-right">
                          <span className={`badge badge-${student.enrollmentStatus.toLowerCase()}`}>
                            {student.enrollmentStatus}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Student Details */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Student Details</h2>
              {!selectedStudent ? (
                <p className="text-gray-600 text-center py-8">Select a student to view details</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Personal Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Name:</span> {selectedStudent.firstName} {selectedStudent.lastName}</p>
                      <p><span className="text-gray-600">Email:</span> {selectedStudent.user.email}</p>
                      <p><span className="text-gray-600">Phone:</span> {selectedStudent.phone}</p>
                      <p><span className="text-gray-600">Grade:</span> {selectedStudent.gradeLevel}</p>
                      <p><span className="text-gray-600">Year:</span> {selectedStudent.academicYear}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Documents</h3>
                    <div className="space-y-2">
                      {selectedStudent.documents.map((doc: any) => (
                        <a
                          key={doc.id}
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-primary-600 hover:text-primary-700"
                        >
                          <Eye className="h-4 w-4 inline mr-1" />
                          {doc.documentType.replace(/_/g, ' ')}
                        </a>
                      ))}
                      {selectedStudent.documents.length === 0 && (
                        <p className="text-sm text-gray-600">No documents uploaded</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Payments</h3>
                    <p className="text-sm">
                      Total: ₱{selectedStudent.payments
                        .filter((p: any) => p.paymentStatus === 'PAID')
                        .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0)
                        .toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Update Status</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => updateStatus(selectedStudent.id, 'APPROVED')}
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4 inline mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(selectedStudent.id, 'REJECTED')}
                        disabled={loading}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4 inline mr-2" />
                        Reject
                      </button>
                      <button
                        onClick={() => updateStatus(selectedStudent.id, 'ENROLLED')}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Mark as Enrolled
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
