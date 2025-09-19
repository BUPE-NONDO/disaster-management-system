'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Users, MapPin, Activity, Plus } from 'lucide-react';
import IncidentForm from '@/components/IncidentForm';

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [resources, setResources] = useState([]);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [incidentsRes, resourcesRes] = await Promise.all([
        fetch('/api/incidents'),
        fetch('/api/resources')
      ]);

      const incidentsData = await incidentsRes.json();
      const resourcesData = await resourcesRes.json();

      setIncidents(incidentsData.incidents || []);
      setResources(resourcesData.resources || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncidentSubmit = async (incidentData: any) => {
    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(incidentData),
      });

      if (response.ok) {
        setShowIncidentForm(false);
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        console.error('Error creating incident:', error);
      }
    } catch (error) {
      console.error('Error submitting incident:', error);
    }
  };

  const getActiveIncidentsCount = () => {
    return incidents.filter((incident: any) => 
      incident.status === 'REPORTED' || incident.status === 'RESPONDING'
    ).length;
  };

  const getAvailableTeamsCount = () => {
    const personnelResource = resources.find((r: any) => r.type === 'PERSONNEL');
    return personnelResource ? personnelResource.available : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
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
              <span className="text-sm text-gray-500">Emergency Operations Center</span>
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
              {incidents.slice(0, 5).map((incident: any) => (
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
                      {new Date(incident.reportedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resource Allocation
            </h2>
            <div className="space-y-4">
              {resources.map((item: any) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className="text-sm text-gray-500">{item.available}/{item.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(item.available / item.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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