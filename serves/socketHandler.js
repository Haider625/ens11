const socketIo = require('socket.io');
const notifier = require('node-notifier');

const sendNotificationToGroup = (io, groupName, message) => {
  io.to(groupName).emit('sendNotification', { message });
};

module.exports = { sendNotificationToGroup };