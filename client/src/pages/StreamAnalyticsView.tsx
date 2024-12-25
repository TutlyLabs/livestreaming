import React from "react";
import { useParams } from "react-router-dom";
import { StreamAnalytics } from "../components/StreamAnalytics";
import { useAuth } from "../components/AuthProvider";

export const StreamAnalyticsView = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to view analytics.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <StreamAnalytics userId={user.id} selectedStreamId={streamId} />
    </div>
  );
}; 