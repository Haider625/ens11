const mongoose = require('mongoose');

const CompletedRequestSchema = new mongoose.Schema({

  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  },
  completionDate: {
    type: Date,
    default: Date.now,
  },
});

const CompletedRequest = mongoose.model('CompletedRequest', CompletedRequestSchema);

module.exports = CompletedRequest;
