// messageModel.js

const mongoose = require('mongoose');

const messageSocketSchema = new mongoose.Schema({
  room: {
    type: String,
  },
  
  message: mongoose.Schema.Types.Mixed,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('messageSocket', messageSocketSchema);

module.exports = Message;
