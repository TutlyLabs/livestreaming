import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Stream } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  userId: string;
  selectedStreamId?: string;
}

interface Analytics {
  peakViewers: number;
  totalViews: number;
  averageViewTime: number;
  viewerTrends: { timestamp: string; viewers: number }[];
  geographicDistribution: { country: string; viewers: number }[];
  deviceStats: { device: string; count: number }[];
}

export const StreamAnalytics: React.FC<Props> = ({ userId, selectedStreamId }) => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedStream, setSelectedStream] = useState<string>('');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    fetchStreams();
  }, [userId]);

  useEffect(() => {
    if (selectedStreamId) {
      setSelectedStream(selectedStreamId);
    }
  }, [selectedStreamId]);

  useEffect(() => {
    if (selectedStream) {
      fetchAnalytics(selectedStream);
    }
  }, [selectedStream]);

  const fetchStreams = async () => {
    try {
      const response = await fetch(`http://localhost:3000/streams/user/${userId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setStreams(data.streams);
    } catch (error) {
      console.error('Error fetching streams:', error);
    }
  };

  const fetchAnalytics = async (streamId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/streams/${streamId}/analytics`, {
        credentials: 'include'
      });
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const viewerTrendData = {
    labels: analytics?.viewerTrends.map(trend =>
      new Date(trend.timestamp).toLocaleTimeString()
    ) || [],
    datasets: [
      {
        label: "Viewers",
        data: analytics?.viewerTrends.map(trend => trend.viewers) || [],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
    ],
  };

  const geoData = {
    labels: analytics?.geographicDistribution.map(geo => geo.country) || [],
    datasets: [
      {
        label: "Viewers by Country",
        data: analytics?.geographicDistribution.map(geo => geo.viewers) || [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
        ],
      },
    ],
  };

  const deviceData = {
    labels: analytics?.deviceStats.map(stat => stat.device) || [],
    datasets: [
      {
        label: "Viewers by Device",
        data: analytics?.deviceStats.map(stat => stat.count) || [],
        backgroundColor: [
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 99, 132, 0.5)",
          "rgba(255, 206, 86, 0.5)",
        ],
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Stream Analytics</h2>

      <div className="mb-6">
        <select
          value={selectedStream}
          onChange={(e) => setSelectedStream(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select a stream</option>
          {streams.map((stream) => (
            <option key={stream.id} value={stream.id}>
              {stream.title}
            </option>
          ))}
        </select>
      </div>

      {selectedStream && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="text-lg font-semibold">Peak Viewers</h3>
              <p className="text-3xl font-bold text-blue-600">
                {analytics.peakViewers}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <h3 className="text-lg font-semibold">Total Views</h3>
              <p className="text-3xl font-bold text-green-600">
                {analytics.totalViews}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <h3 className="text-lg font-semibold">Avg. View Time</h3>
              <p className="text-3xl font-bold text-purple-600">
                {Math.round(analytics.averageViewTime / 60)} mins
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Viewer Trends</h3>
            <div className="h-64">
              <Line
                data={viewerTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Geographic Distribution</h3>
              <div className="h-64">
                <Line
                  data={geoData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: "y" as const,
                  }}
                />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Device Statistics</h3>
              <div className="h-64">
                <Line
                  data={deviceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: "y" as const,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};