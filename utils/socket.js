const socketIo = require('socket.io');



module.exports = (server) => {
  const io = socketIo(server);

  io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    // Receive notifications from client
    socket.on('sendNotification', (data) => {
      console.log('Received notification from client:', data);

    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

};
