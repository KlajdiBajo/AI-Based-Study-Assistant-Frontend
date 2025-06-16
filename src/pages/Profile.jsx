import React from 'react';
import { User, Mail, Phone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
  const formData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1 (555) 123-4567',
    gender: 'male',
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    // Handle logout logic
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <User className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-slate-500">Student</p>
              <p className="text-sm text-slate-400 mt-1">Member since January 2024</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                <p className="flex items-center space-x-2 text-slate-800 bg-slate-50 px-3 py-2 rounded-lg">
                  <User className="w-4 h-4 text-slate-500" />
                  <span>{formData.firstName}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                <p className="flex items-center space-x-2 text-slate-800 bg-slate-50 px-3 py-2 rounded-lg">
                  <User className="w-4 h-4 text-slate-500" />
                  <span>{formData.lastName}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <p className="flex items-center space-x-2 text-slate-800 bg-slate-50 px-3 py-2 rounded-lg">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>{formData.email}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <p className="flex items-center space-x-2 text-slate-800 bg-slate-50 px-3 py-2 rounded-lg">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span>{formData.phoneNumber}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                <p className="flex items-center space-x-2 text-slate-800 bg-slate-50 px-3 py-2 rounded-lg">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="capitalize">{formData.gender.replace('-', ' ')}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Account Actions</h3>
        <div className="flex space-x-4">
          <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">
            Change Password
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
