
const socketIo = require('socket.io');


module.exports = (server) => {
  const io = socketIo(server);

  io.on('connection', async(socket) => {
    console.log('A user connected', socket.id);

    io.emit('conn', "hii every one");

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });

  });
  return io;
};
