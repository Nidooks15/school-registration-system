'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { FileText, CreditCard, CheckCircle, Clock, XCircle, Upload } from 'lucide-react';

export default function StudentDashboard() {
  const { user, refreshUser } = useAuth();
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (user?.student) {
      setStudent(user.student);
    }
  }, [user]);

  const getStatusBadge = (status: string) => {
    const badges: any = {
      PENDING: <span className="badge badge-pending"><Clock className="h-4 w-4 mr-1" /> Pending</span>,
      APPROVED: <span className="badge badge-approved"><CheckCircle className="h-4 w-4 mr-1" /> Approved</span>,
      REJECTED: <span className="badge badge-rejected"><XCircle className="h-4 w-4 mr-1" /> Rejected</span>,
      ENROLLED: <span className="badge badge-enrolled"><CheckCircle className="h-4 w-4 mr-1" /> Enrolled</span>,
    };
    return badges[status] || status;
  };

  return (
    <ProtectedRoute requiredRole="STUDENT">
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {student?.firstName}!</p>
          </div>

          {/* Status Card */}
          <div className="card-gradient mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Registration Status</h2>
                <div className="flex items-center space-x-2">
                  {student && getStatusBadge(student.enrollmentStatus)}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Grade Level</p>
                <p className="text-2xl font-bold">{student?.gradeLevel}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link href="/student/documents" className="card group hover:scale-105 transition-transform duration-300">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Documents</h3>
                  <p className="text-gray-600 text-sm">Upload & manage</p>
                </div>
              </div>
            </Link>

            <Link href="/student/payments" className="card group hover:scale-105 transition-transform duration-300">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                  <CreditCard className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Payments</h3>
                  <p className="text-gray-600 text-sm">Pay fees & view history</p>
                </div>
              </div>
            </Link>

            <div className="card">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Upload className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Documents</h3>
                  <p className="text-gray-600 text-sm">{student?.documents?.length || 0} uploaded</p>
                </div>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Personal Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-semibold">{student?.firstName} {student?.middleName} {student?.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{student?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold">{student?.address}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4">Academic Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Grade Level</p>
                  <p className="font-semibold">{student?.gradeLevel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Academic Year</p>
                  <p className="font-semibold">{student?.academicYear}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Enrollment Status</p>
                  <div className="mt-1">{student && getStatusBadge(student.enrollmentStatus)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          {student?.guardians && student.guardians.length > 0 && (
            <div className="card mt-6">
              <h3 className="text-xl font-bold mb-4">Guardian Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.guardians.map((guardian: any) => (
                  <div key={guardian.id} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold">{guardian.firstName} {guardian.lastName}</p>
                    <p className="text-sm text-gray-600">{guardian.relationship}</p>
                    <p className="text-sm text-gray-600 mt-2">{guardian.phone}</p>
                    <p className="text-sm text-gray-600">{guardian.email}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
