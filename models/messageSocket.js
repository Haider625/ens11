// messageModel.js

const mongoose = require('mongoose');

const messageSocketSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('Message', messageSocketSchema);

module.exports = Message;
