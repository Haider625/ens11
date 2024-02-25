const mongoose = require('mongoose');

const archiveSchema = new mongoose.Schema({

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

archiveSchema.pre(/^find/, function (next) {
  this.populate([
    { 
      path: 'orderId',
        select: {
        '_id' : 1,
        'type1':1,
        'type2':1,
        'type3':1,
        'number':1,
        'caption' : 1,
        'group' : 0,
        'groups' : 0,
        'State' : 1,
        'StateWork' : 1,
        'StateDone' : 1,
        'users' : 0,
        'createdBy' : 0,
        'history' : 1,
      },
      options: { depth: 1 }
    },
  ])
    next();
  });
const CompletedRequest = mongoose.model('archive', archiveSchema);

module.exports = CompletedRequest;
