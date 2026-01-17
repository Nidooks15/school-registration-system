'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: 'MALE',
    address: '',
    phone: '',
    gradeLevel: '',
    academicYear: '2024-2025',
    guardian: {
      firstName: '',
      lastName: '',
      relationship: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('guardian.')) {
      const guardianField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        guardian: { ...prev.guardian, [guardianField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, middleName, ...submitData } = formData;
      
      // Ensure date is in ISO 8601 format (YYYY-MM-DD) for Safari/mobile compatibility
      if (submitData.dateOfBirth) {
        const date = new Date(submitData.dateOfBirth);
        if (!isNaN(date.getTime())) {
          submitData.dateOfBirth = date.toISOString().split('T')[0];
        }
      }
      
      // Clean phone numbers (remove spaces, dashes, parentheses) for mobile compatibility
      submitData.phone = submitData.phone.replace(/[\s\-\(\)]/g, '');
      submitData.guardian.phone = submitData.guardian.phone.replace(/[\s\-\(\)]/g, '');
      
      // Trim all fields
      submitData.email = submitData.email.trim();
      submitData.password = submitData.password.trim();
      submitData.firstName = submitData.firstName.trim();
      submitData.lastName = submitData.lastName.trim();
      submitData.address = submitData.address.trim();
      submitData.gradeLevel = submitData.gradeLevel.trim();
      submitData.academicYear = submitData.academicYear.trim();
      
      submitData.guardian.firstName = submitData.guardian.firstName.trim();
      submitData.guardian.lastName = submitData.guardian.lastName.trim();
      submitData.guardian.relationship = submitData.guardian.relationship.trim();
      submitData.guardian.email = submitData.guardian.email.trim();
      submitData.guardian.address = submitData.guardian.address.trim();
      
      // Only include middleName if it has a value
      if (middleName && middleName.trim()) {
        (submitData as any).middleName = middleName.trim();
      }
      
      await register(submitData);
      router.push('/student/dashboard');
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="card">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Student Registration</h1>
            <p className="text-gray-600 mt-2">Step {step} of 3</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className={`text-sm font-medium ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>Account</span>
              <span className={`text-sm font-medium ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>Personal Info</span>
              <span className={`text-sm font-medium ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>Guardian</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Account Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input type="password" name="password" required minLength={6} value={formData.password} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="input-field" />
                </div>
                <button type="button" onClick={() => setStep(2)} className="w-full btn-primary">Next</button>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name (Optional)</label>
                  <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} className="input-field" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select name="gender" required value={formData.gender} onChange={handleChange} className="input-field">
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea name="address" required value={formData.address} onChange={handleChange} className="input-field" rows={3}></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                    <select name="gradeLevel" required value={formData.gradeLevel} onChange={handleChange} className="input-field">
                      <option value="">Select Grade</option>
                      <option value="Grade 1">Grade 1</option>
                      <option value="Grade 2">Grade 2</option>
                      <option value="Grade 3">Grade 3</option>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                      <option value="Grade 6">Grade 6</option>
                      <option value="Grade 7">Grade 7</option>
                      <option value="Grade 8">Grade 8</option>
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 btn-secondary">Back</button>
                  <button type="button" onClick={() => setStep(3)} className="flex-1 btn-primary">Next</button>
                </div>
              </div>
            )}

            {/* Step 3: Guardian Information */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guardian First Name</label>
                    <input type="text" name="guardian.firstName" required value={formData.guardian.firstName} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Last Name</label>
                    <input type="text" name="guardian.lastName" required value={formData.guardian.lastName} onChange={handleChange} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                  <select name="guardian.relationship" required value={formData.guardian.relationship} onChange={handleChange} className="input-field">
                    <option value="">Select Relationship</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Phone</label>
                    <input type="tel" name="guardian.phone" required value={formData.guardian.phone} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Email</label>
                    <input type="email" name="guardian.email" required value={formData.guardian.email} onChange={handleChange} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Address</label>
                  <textarea name="guardian.address" required value={formData.guardian.address} onChange={handleChange} className="input-field" rows={3}></textarea>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 btn-secondary">Back</button>
                  <button type="submit" disabled={loading} className="flex-1 btn-primary">
                    {loading ? 'Registering...' : 'Complete Registration'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
