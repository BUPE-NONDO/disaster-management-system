'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, Filter, Search, Calendar, User, Shield, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/Toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProtectedRoute from '@/components/ProtectedRoute';

interface SecurityEvent {
  id: string;
  userId: string;
  eventType: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'EMAIL_VERIFICATION' | 'ROLE_CHANGE' | 'SUSPICIOUS_ACTIVITY';
  description: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export default function ActivityLogPage() {
  const { userProfile } = useAuth();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      // Mock data for demonstration
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          userId: 'user1',
          eventType: 'LOGIN',
          description: 'User logged in successfully',
          timestamp: new Date('2024-01-30T10:30:00'),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        {
          id: '2',
          userId: 'user2',
          eventType: 'SUSPICIOUS_ACTIVITY',
          description: 'Login from different IP address',
          timestamp: new Date('2024-01-30T09:15:00'),
          ipAddress: '203.0.113.1',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
          metadata: {
            previousIp: '192.168.1.100',
            currentIp: '203.0.113.1'
          }
        },
        {
          id: '3',
          userId: 'user1',
          eventType: 'PASSWORD_CHANGE',
          description: 'Password changed successfully',
          timestamp: new Date('2024-01-29T16:45:00'),
          ipAddress: '192.168.1.100'
        },
        {
          id: '4',
          userId: 'user3',
          eventType: 'EMAIL_VERIFICATION',
          description: 'Email address verified',
          timestamp: new Date('2024-01-29T14:20:00'),
          ipAddress: '192.168.1.101'
        },
        {
          id: '5',
          userId: 'user2',
          eventType: 'ROLE_CHANGE',
          description: 'User role changed from REPORTER to COORDINATOR',
          timestamp: new Date('2024-01-28T11:30:00'),
          metadata: {
            previousRole: 'REPORTER',
            newRole: 'COORDINATOR'
          }
        },
        {
          id: '6',
          userId: 'user1',
          eventType: 'LOGOUT',
          description: 'User logged out',
          timestamp: new Date('2024-01-28T18:00:00'),
          ipAddress: '192.168.1.100'
        }
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error('Error', 'Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = eventTypeFilter === 'ALL' || event.eventType === eventTypeFilter;
    const matchesDate = !dateFilter || event.timestamp.toDateString() === new Date(dateFilter).toDateString();
    
    return matchesSearch && matchesType && matchesDate;
  });

  const getEventIcon = (eventType: SecurityEvent['eventType']) => {
    switch (eventType) {
      case 'LOGIN':
        return <User className="h-4 w-4 text-green-600" />;
      case 'LOGOUT':
        return <User className="h-4 w-4 text-gray-600" />;
      case 'PASSWORD_CHANGE':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'EMAIL_VERIFICATION':
        return <Shield className="h-4 w-4 text-purple-600" />;
      case 'ROLE_CHANGE':
        return <Shield className="h-4 w-4 text-orange-600" />;
      case 'SUSPICIOUS_ACTIVITY':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventColor = (eventType: SecurityEvent['eventType']) => {
    switch (eventType) {
      case 'LOGIN':
        return 'bg-green-100 text-green-800';
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-800';
      case 'PASSWORD_CHANGE':
        return 'bg-blue-100 text-blue-800';
      case 'EMAIL_VERIFICATION':
        return 'bg-purple-100 text-purple-800';
      case 'ROLE_CHANGE':
        return 'bg-orange-100 text-orange-800';
      case 'SUSPICIOUS_ACTIVITY':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading activity logs..." />
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'COORDINATOR']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
            <p className="mt-2 text-gray-600">Monitor user activity and security events</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Events
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search events..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={eventTypeFilter}
                    onChange={(e) => setEventTypeFilter(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Events</option>
                    <option value="LOGIN">Login</option>
                    <option value="LOGOUT">Logout</option>
                    <option value="PASSWORD_CHANGE">Password Change</option>
                    <option value="EMAIL_VERIFICATION">Email Verification</option>
                    <option value="ROLE_CHANGE">Role Change</option>
                    <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Security Events ({filteredEvents.length})
                </h2>
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-500">Total: {events.length}</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getEventIcon(event.eventType)}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventColor(event.eventType)}`}>
                            {event.eventType.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.userId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {event.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.ipAddress || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.timestamp.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No events found matching your criteria
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
