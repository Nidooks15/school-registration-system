'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { documentAPI } from '@/lib/api';
import { Upload, FileText, Trash2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    if (user?.studentId) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    try {
      const response = await documentAPI.getByStudent(user!.studentId!);
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, JPG, and PNG files are allowed');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('studentId', user!.studentId!);
    formData.append('documentType', type);

    try {
      await documentAPI.upload(formData);
      toast.success('Document uploaded successfully!');
      loadDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentAPI.delete(id);
      toast.success('Document deleted successfully');
      loadDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  };

  const getDocumentByType = (type: string) => {
    return documents.find(doc => doc.documentType === type);
  };

  const documentTypes = [
    { type: 'BIRTH_CERTIFICATE', label: 'Birth Certificate', icon: FileText },
    { type: 'REPORT_CARD', label: 'Report Card / Transcript', icon: FileText },
    { type: 'ID_PHOTO', label: 'ID Photo', icon: FileText },
  ];

  return (
    <ProtectedRoute requiredRole="STUDENT">
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
            <p className="text-gray-600 mt-2">Upload required documents for your registration</p>
          </div>

          <div className="space-y-6">
            {documentTypes.map(({ type, label, icon: Icon }) => {
              const doc = getDocumentByType(type);
              
              return (
                <div key={type} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${doc ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {doc ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <Icon className="h-6 w-6 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{label}</h3>
                        {doc ? (
                          <p className="text-sm text-gray-600">
                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-600">Not uploaded yet</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {doc ? (
                        <>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-sm py-2 px-4"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="btn-danger text-sm py-2 px-4"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : null}
                      
                      <label className="btn-primary text-sm py-2 px-4 cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, type)}
                          disabled={uploading}
                        />
                        <Upload className="h-4 w-4 inline mr-2" />
                        {doc ? 'Replace' : 'Upload'}
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 card bg-blue-50 border-blue-200">
            <h3 className="font-bold text-lg mb-2">Upload Guidelines</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Accepted formats: PDF, JPG, PNG</li>
              <li>Maximum file size: 5MB</li>
              <li>Ensure documents are clear and readable</li>
              <li>All three documents are required for registration approval</li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
