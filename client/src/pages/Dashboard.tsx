import React from 'react';
import { StreamDashboard } from '../components/StreamDashboard';
import { StreamAnalytics } from '../components/StreamAnalytics';
import { useAuth } from '../components/AuthProvider';

export const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <StreamDashboard userId={user.id} />
          <StreamAnalytics userId={user.id} />
        </div>
      </div>
    </div>
  );
};