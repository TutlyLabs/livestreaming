import React, { useState, useEffect } from 'react';
import { Stream } from '../types';
import { Link } from 'react-router-dom';

interface Props {
  userId: string;
}

const RTMP_SERVER_URL = "rtmp://localhost:1935/live";

export const StreamDashboard: React.FC<Props> = ({ userId }) => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const createStream = async () => {
    try {
      const response = await fetch('http://localhost:3000/streams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          title,
          description,
        }),
      });
      const data = await response.json();
      setStreams([...streams, data.stream]);
    } catch (error) {
      console.error('Error creating stream:', error);
    }
  };

  useEffect(() => {
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

    fetchStreams();
    const interval = setInterval(fetchStreams, 30000);
    return () => clearInterval(interval);
  }, []);

  const copyStreamUrl = (streamKey: string) => {
    const fullUrl = `${RTMP_SERVER_URL}/${streamKey}`;
    navigator.clipboard.writeText(fullUrl);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Create New Stream</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Stream Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Stream Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={createStream}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Stream
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Your Streams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {streams.map((stream) => (
            <div key={stream.id} className="border rounded p-4">
              <h3 className="font-bold">{stream.title}</h3>
              <p className="text-gray-600">{stream.description}</p>
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <p className="text-sm">Stream URL: {RTMP_SERVER_URL}</p>
                  <button
                    onClick={() => copyStreamUrl(stream.streamKey)}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm">Stream Key: {stream.streamKey}</p>
                <p>Status: {stream.isLive ? "Live" : "Offline"}</p>
                <p>Viewers: {stream.viewers}</p>
                <div className="flex space-x-2 mt-2">
                  <Link
                    to={`/stream/${stream.id}`}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                  >
                    {stream.isLive ? "Watch Stream" : "View Details"}
                  </Link>
                  {stream.isLive && (
                    <Link
                      to={`/stream/${stream.id}/analytics`}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
                    >
                      Analytics
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};