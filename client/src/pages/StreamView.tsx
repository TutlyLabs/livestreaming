import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StreamPlayer } from '../components/StreamPlayer';
import { Chat } from '../components/Chat';
import { useAuth } from '../components/AuthProvider';
import { Stream } from '../types';

export const StreamView = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const { user } = useAuth();
  const [stream, setStream] = useState<Stream | null>(null);

  useEffect(() => {
    if (streamId) {
      fetchStreamDetails();
    }
  }, [streamId]);

  const fetchStreamDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3000/streams/${streamId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setStream(data.stream);
    } catch (error) {
      console.error('Error fetching stream details:', error);
    }
  };

  if (!stream) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <StreamPlayer streamId={streamId!} />
            <div className="p-4">
              <h1 className="text-2xl font-bold">{stream.title}</h1>
              <p className="text-gray-600 mt-2">{stream.description}</p>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">
                  LIVE
                </span>
                <span className="ml-2">{stream.viewers} watching</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow h-[600px]">
            {user ? (
              <Chat streamId={streamId!} userId={user.id} />
            ) : (
              <div className="p-4 text-center">
                Please log in to participate in chat
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};