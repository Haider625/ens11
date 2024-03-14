// socketHandler.js

const socketIo = require('socket.io');

const User = require('../models/userModel')

let io;

module.exports = {
    initializeSocket: function (server) {
        io = socketIo(server);

        io.on('connection', async (socket) => {
            console.log('A user connected', socket.id);

            socket.on('userId', async (userId) => {
              const user = await User.findById(userId);
              if (user) {
                  const groupName = user.group.name;
                  const roomUser = user.userId;
                  socket.join(roomUser) 
                  socket.join(groupName);
                  console.log(`User ${roomUser} joined group ${groupName}`);
              } else {
                  console.log('User not found or missing group');
              }
          });
            socket.on('disconnect', () => {
                console.log('User disconnected');
            });
        });
    },

  sendNotificationToUser: function (roomUser, message) {
    console.log(roomUser)
    if (io.sockets.adapter.rooms.has(roomUser)) {
      io.to(roomUser).emit('notification', message);
  } else {
      console.log('roomUser does not exist');
  }
},

    sendNotificationToRoom: function (roomgroup, message) {
      console.log(roomgroup)
      if (io.sockets.adapter.rooms.has(roomgroup)) {
        io.to(roomgroup).emit('notification', message);
    } else {
        console.log('roomgroup does not exist');
    }
  }
};
