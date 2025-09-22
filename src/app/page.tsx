'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Users, MapPin, Activity, Plus, LogOut, User } from 'lucide-react';
import IncidentForm from '@/components/IncidentForm';
import LoginForm from '@/components/LoginForm';
import ResourceManagement from '@/components/ResourceManagement';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { incidentService, resourceService, Incident, Resource } from '@/lib/firestore';
import { toast } from '@/components/Toast';

export default function Dashboard() {
  const { user, userProfile, loading: authLoading, signOut } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Set up real-time listeners
      const unsubscribeIncidents = incidentService.subscribeToIncidents((incidents) => {
        setIncidents(incidents);
        setLoading(false);
      });

      const unsubscribeResources = resourceService.subscribeToResources((resources) => {
        setResources(resources);
      });

      return () => {
        unsubscribeIncidents();
        unsubscribeResources();
      };
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleIncidentSubmit = async (incidentData: any) => {
    try {
      await incidentService.createIncident({
        ...incidentData,
        reportedBy: user!.uid
      });
      setShowIncidentForm(false);
      toast.success('Incident Reported', 'Your incident has been successfully reported and is being reviewed.');
    } catch (error) {
      console.error('Error submitting incident:', error);
      toast.error('Failed to Report Incident', 'There was an error reporting the incident. Please try again.');
    }
  };

  const getActiveIncidentsCount = () => {
    return incidents.filter((incident) => 
      incident.status === 'REPORTED' || incident.status === 'RESPONDING'
    ).length;
  };

  const getAvailableTeamsCount = () => {
    const personnelResource = resources.find((r) => r.type === 'PERSONNEL');
    return personnelResource ? personnelResource.available : 0;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed Out', 'You have been successfully signed out.');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Sign Out Failed', 'There was an error signing out. Please try again.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Initializing..." />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Disaster Management System
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowIncidentForm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Report Incident</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{userProfile?.name || user.email}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {userProfile?.role}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Incidents"
            value={getActiveIncidentsCount().toString()}
            icon={<AlertTriangle className="h-8 w-8 text-red-500" />}
            trend={`${incidents.length} total incidents`}
          />
          <StatCard
            title="Available Teams"
            value={getAvailableTeamsCount().toString()}
            icon={<Users className="h-8 w-8 text-blue-500" />}
            trend="Response teams ready"
          />
          <StatCard
            title="Resources"
            value={resources.length.toString()}
            icon={<MapPin className="h-8 w-8 text-yellow-500" />}
            trend="Resource types available"
          />
          <StatCard
            title="System Status"
            value="Online"
            icon={<Activity className="h-8 w-8 text-green-500" />}
            trend="All systems operational"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Incidents
            </h2>
            <div className="space-y-4">
              {incidents.slice(0, 5).map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-gray-900">{incident.title || incident.type}</p>
                    <p className="text-sm text-gray-500">{incident.location}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      incident.severity === 'CRITICAL' || incident.severity === 'HIGH' ? 'bg-red-100 text-red-800' :
                      incident.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {incident.severity}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {incident.reportedAt?.toDate ? 
                        incident.reportedAt.toDate().toLocaleString() : 
                        new Date(incident.reportedAt).toLocaleString()
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ResourceManagement />
        </div>
      </main>

      {showIncidentForm && (
        <IncidentForm
          onSubmit={handleIncidentSubmit}
          onCancel={() => setShowIncidentForm(false)}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon, trend }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {icon}
      </div>
      <p className="text-xs text-gray-500 mt-2">{trend}</p>
    </div>
  );
}