import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { GraduationCap, FileText, CreditCard, CheckCircle, BookOpen, Users, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to Our School
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Empowering minds, shaping futures through quality education
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-white text-primary-600 font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Register Now
              </Link>
              <Link href="/login" className="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-lg hover:bg-white/10 transition-all duration-200">
                Student Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Our Programs</h2>
            <p className="section-subtitle">Comprehensive education from elementary to senior high school</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card group hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Elementary</h3>
              <p className="text-gray-600">Grades 1-6: Building strong foundations in core subjects with engaging, interactive learning.</p>
            </div>
            
            <div className="card group hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Junior High</h3>
              <p className="text-gray-600">Grades 7-10: Developing critical thinking and preparing for specialized tracks.</p>
            </div>
            
            <div className="card group hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Senior High</h3>
              <p className="text-gray-600">Grades 11-12: Specialized tracks (STEM, ABM, HUMSS) for college readiness.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tuition Section */}
      <section id="tuition" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Tuition & Fees</h2>
            <p className="section-subtitle">Affordable, quality education for every student</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200 hover:border-primary-500 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-4">Elementary</h3>
              <div className="text-4xl font-bold text-primary-600 mb-4">₱25,000</div>
              <p className="text-gray-600 mb-6">per year</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Books & Materials</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> School Activities</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> ID & Uniform</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl shadow-xl p-8 text-white transform scale-105">
              <div className="bg-white text-primary-600 text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">POPULAR</div>
              <h3 className="text-2xl font-bold mb-4">Junior High</h3>
              <div className="text-4xl font-bold mb-4">₱30,000</div>
              <p className="text-primary-100 mb-6">per year</p>
              <ul className="space-y-3">
                <li className="flex items-center"><CheckCircle className="h-5 w-5 mr-2" /> All Elementary Benefits</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 mr-2" /> Lab Access</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 mr-2" /> Sports Programs</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200 hover:border-primary-500 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-4">Senior High</h3>
              <div className="text-4xl font-bold text-primary-600 mb-4">₱35,000</div>
              <p className="text-gray-600 mb-6">per year</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> All JHS Benefits</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Track Specialization</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> College Prep</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Steps */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Registration Steps</h2>
            <p className="section-subtitle">Simple and straightforward enrollment process</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Create Account</h3>
              <p className="text-gray-600">Fill out the registration form with your information</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Upload Documents</h3>
              <p className="text-gray-600">Submit required documents (birth cert, report card, ID photo)</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CreditCard className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Pay Fees</h3>
              <p className="text-gray-600">Complete registration fee payment online</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">4. Get Approved</h3>
              <p className="text-gray-600">Wait for admin approval and enrollment confirmation</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/register" className="btn-primary text-lg">
              Start Registration
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
