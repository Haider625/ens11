// socketConnection.js
const socketIo = require('socket.io');
const User = require('../models/userModel'); 

module.exports = (server) => {
  const io = socketIo(server);

  io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  // دالة لإرسال الإشعارات إلى جميع المستخدمين في الكروب المعني
  const sendNotificationToGroup = async (groupId, notification) => {
    const usersInGroup = await User.find({ 'group._id': groupId });

    usersInGroup.forEach(user => {
      io.to(user.socketId).emit('notification', notification); 
        });
  };

  return { io, sendNotificationToGroup }; // تصدير io والدالة المخصصة
};
