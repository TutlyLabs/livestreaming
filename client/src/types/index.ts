export interface Stream {
  id: string;
  userId: string;
  streamKey: string;
  title: string;
  description?: string;
  isLive: boolean;
  startedAt?: Date;
  endedAt?: Date;
  recordingUrl?: string;
  viewers: number;
}