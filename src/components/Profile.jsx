import React from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <button
      onClick={handleProfileClick}
      className="flex items-center space-x-3 hover:bg-slate-100 rounded-lg p-2 transition-colors"
    >
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
        <User className="w-4 h-4 text-white" />
      </div>
      <div className="hidden md:block text-left">
        <p className="text-sm font-medium text-slate-700">John Doe</p>
        <p className="text-xs text-slate-500">Student</p>
      </div>
    </button>
  );
};
