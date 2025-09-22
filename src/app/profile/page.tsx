'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Shield, Calendar, Save, Edit, X } from 'lucide-react';
import { authService, UserProfile } from '../../../lib/auth';
import { toast } from '@/components/Toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProfilePage() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'REPORTER' as UserProfile['role']
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || user?.email || '',
        role: userProfile.role
      });
    }
  }, [userProfile, user]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await authService.updateUserProfile(user.uid, {
        name: formData.name,
        role: formData.role
      });
      
      await refreshUserProfile();
      setIsEditing(false);
      toast.success('Profile Updated', 'Your profile has been successfully updated.');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Update Failed', 'There was an error updating your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || user?.email || '',
        role: userProfile.role
      });
    }
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  const roleColors = {
    ADMIN: 'bg-red-100 text-red-800',
    COORDINATOR: 'bg-blue-100 text-blue-800',
    RESPONDER: 'bg-green-100 text-green-800',
    REPORTER: 'bg-gray-100 text-gray-800'
  };

  const roleDescriptions = {
    ADMIN: 'Full system access, can manage all resources and incidents',
    COORDINATOR: 'Can manage resources and coordinate responses',
    RESPONDER: 'Can view incidents and update response status',
    REPORTER: 'Can report new incidents and view basic information'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Information */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{userProfile.name || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{userProfile.email || user.email}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    {isEditing ? (
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="REPORTER">Reporter</option>
                        <option value="RESPONDER">Responder</option>
                        <option value="COORDINATOR">Coordinator</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-gray-400" />
                        <span className={`px-2 py-1 text-sm font-medium rounded-full ${roleColors[userProfile.role]}`}>
                          {userProfile.role}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User ID
                    </label>
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900 font-mono text-sm">{user.uid}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Since
                    </label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">
                        {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Information */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Information</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Current Role</h4>
                      <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${roleColors[userProfile.role]}`}>
                        {userProfile.role}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Permissions</h4>
                      <p className="text-sm text-gray-600">
                        {roleDescriptions[userProfile.role]}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
                      <p className="text-sm text-gray-600">
                        {userProfile.updatedAt ? new Date(userProfile.updatedAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
