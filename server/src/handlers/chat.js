export const chatHandler = (socket, redis) => {
  socket.on('join-stream', async (streamId) => {
    socket.join(streamId);
    const chatHistory = await redis.lrange(`chat:${streamId}`, 0, 49);
    socket.emit('chat-history', chatHistory);
  });

  socket.on('chat-message', async (data) => {
    const { streamId, userId, message } = data;
    const chatMessage = JSON.stringify({
      userId,
      message,
      timestamp: Date.now()
    });


    await redis.lpush(`chat:${streamId}`, chatMessage);
    // Keep last 100 messages
    await redis.ltrim(`chat:${streamId}`, 0, 99); 
    
    socket.to(streamId).emit('new-message', {
      userId,
      message,
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', () => {
    // maybe
  });
};