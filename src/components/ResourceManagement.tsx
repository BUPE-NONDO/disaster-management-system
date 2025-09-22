'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Truck, Shield, Wrench } from 'lucide-react';
import { resourceService, Resource } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/Toast';

interface ResourceFormProps {
  resource?: Resource;
  onClose: () => void;
  onSave: (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

function ResourceForm({ resource, onClose, onSave }: ResourceFormProps) {
  const [formData, setFormData] = useState({
    name: resource?.name || '',
    type: resource?.type || 'PERSONNEL',
    description: resource?.description || '',
    available: resource?.available || 0,
    total: resource?.total || 0,
    location: resource?.location || ''
  });

  const resourceTypes = [
    { value: 'PERSONNEL', label: 'Personnel', icon: Users },
    { value: 'VEHICLE', label: 'Vehicle', icon: Truck },
    { value: 'EQUIPMENT', label: 'Equipment', icon: Wrench },
    { value: 'SUPPLIES', label: 'Supplies', icon: Shield }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'available' || name === 'total' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {resource ? 'Edit Resource' : 'Add New Resource'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resource Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter resource name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resource Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {resourceTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter resource description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available *
                </label>
                <input
                  type="number"
                  name="available"
                  value={formData.available}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total *
                </label>
                <input
                  type="number"
                  name="total"
                  value={formData.total}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Resource location"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {resource ? 'Update Resource' : 'Add Resource'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResourceManagement() {
  const { userProfile } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = resourceService.subscribeToResources((resources) => {
      setResources(resources);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (resourceData: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingResource) {
        await resourceService.updateResource(editingResource.id!, resourceData);
        toast.success('Resource Updated', 'The resource has been successfully updated.');
      } else {
        await resourceService.createResource(resourceData);
        toast.success('Resource Added', 'The new resource has been successfully added.');
      }
      setShowForm(false);
      setEditingResource(undefined);
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Save Failed', 'There was an error saving the resource. Please try again.');
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setShowForm(true);
  };

  const handleDelete = async (resourceId: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourceService.updateResource(resourceId, { available: 0, total: 0 });
        toast.success('Resource Deleted', 'The resource has been successfully deleted.');
      } catch (error) {
        console.error('Error deleting resource:', error);
        toast.error('Delete Failed', 'There was an error deleting the resource. Please try again.');
      }
    }
  };

  const canManageResources = userProfile?.role === 'ADMIN' || userProfile?.role === 'COORDINATOR';

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Resource Management</h2>
        {canManageResources && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Resource</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {resources.map((resource) => {
          const IconComponent = {
            PERSONNEL: Users,
            VEHICLE: Truck,
            EQUIPMENT: Wrench,
            SUPPLIES: Shield
          }[resource.type] || Shield;

          return (
            <div key={resource.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <IconComponent className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{resource.name}</h3>
                  <p className="text-sm text-gray-500">{resource.type} • {resource.location}</p>
                  {resource.description && (
                    <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {resource.available}/{resource.total}
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(resource.available / resource.total) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {canManageResources && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(resource)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id!)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {resources.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No resources available
          </div>
        )}
      </div>

      {showForm && (
        <ResourceForm
          resource={editingResource}
          onClose={() => {
            setShowForm(false);
            setEditingResource(undefined);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
