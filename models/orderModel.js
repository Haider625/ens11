/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { off } = require('./groupUser');

const orderSchema = new mongoose.Schema(
  {

    type1: {
       type: String,
       required: [true, 'type1 required'],
    },

    type2: {
      type: String,
      required: [true, 'type2 required'],
    },

    type3: {
      type: String,
      required: [true, 'type3 required'],
    },

    number :{
      type: Number,
      maxlength: [10, 'Too long caption'],
    },

    caption: {
      type: String,
      maxlength: [310, 'Too long caption'],
    },

    orderimg : String,

    donimgs : [String],

    // rejectimgs : [String],
    
  FastOrder :{ 
    type : Boolean ,
    default : false
  },

    State: {
      type: String,
      enum: ['accept','forword','reject','onprase'],
      default: 'onprase',

    },

  //   StateReasonAccept: {
  //     type : String,
  //     default : "تم قبول الطلب",
  //     select : '',
  //   },

  //   StateReasonReject: {
  //     type : String,
  //     default : "تم رفظ الطلب",
  // select : '',
  //   },

  //   StateReasonOnprase: {
  //     type : String,
  //     default : "تم تحويل الطلب",
  // select : '',
  //   },

    StateWork: {
      type :String,
      enum: ['acceptwork','startwork','endwork','confirmWork','reject','onprase'],
      default: 'onprase',

    },

  //   StateWorkReasonAccept: {
  //     type : String,
  //     default : "تم قبول الطلب",
  // select : '',
  //   },

  //   StateWorkReasonConfirmManger: {
  //     type : String,
  //     default : "تم اتمام الطلب",
  // select : '',
  //   },

  //   StateWorkReasonEndwork: {
  //     type : String,
  //     default : "تم اتمام الطلب",
  // select : '',
  //   },

  //   StateWorkReasonReject: {
  //     type : String,
  //     default : "تم رفظ الطلب",
  // select : '',
  //   },

    StateDone : {
      type : String ,
      enum : ['onprase','reject','accept'],
      default: 'onprase',

    },

  //   StateDoneReasonAccept: {
  //     type : String,
  //     default : "تم قبول الطلب",
  // select : '',
  //   },

  //   StateDoneReasonReject: {
  //     type : String,
  //     default : "تم رفظ الطلب",
  // select : '',
  //   },

    group : {
      type: mongoose.Schema.ObjectId,
      ref: 'group',
      // select : ''
      
    },

    groups: [{
      type: mongoose.Schema.ObjectId,
      ref: 'group',
      // select : ''
    }],

    users : {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null,
      set: function (userId) {
        return userId || this.user || null;
      },
    },

    usersGroup : {
      type : String,
      default: null,
      // select : ''
    },

    usersOnprase : [{
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      // select : ''
    }],

    archive : {
      type:Boolean,
      default : false,
      // select : '' 
    },

    createdBy :{
        type: mongoose.Schema.ObjectId,
        ref : 'User',
        // required: [true, 'Order must belong to a user']
     },
    
    createrGroupId : {
      type :String ,
      // default : 'null'
    },
    senderOrderId :{
      type :String ,
      // default : 'null'
    },
    senderOrder :{
      type :String ,
      // default : 'null'
    },
    
     history: [{
      editedAt: { 
        type: Date,
        default:Date.now(),
      },
      editedBy: {
        type: mongoose.Schema.ObjectId,
         ref: 'User'
        },
      action:   { 
        type:String,
      },
      reason :{ 
        type:String
      },
      imgDone : [String],
  }],

  createdAt: {
    type :Date,
    default:Date.now()
  },

  updatedAt: {
    type :Date,
    default:Date.now()
  },

  },
  {toJSON: { virtuals: true } }
);

orderSchema.plugin(mongoosePaginate);
orderSchema.pre(/^find/, function (next) {
  this.populate([
    { 
      path: 'group',
        select: 
        { 
        'id' : 1,
        'name':1,
        'level':1,
        'inlevel':1,
        'levelSend':0,
        'levelsReceive' : 0,
        'services' : 0,
        'forwordGroup':0
      },
      options: { depth: 1 }
    },
    { 
      path: 'groups',
        select: {
        'id' : 1,
        'name':1,
        'level':1,
        'inlevel':1,
        'levelSend':0,
        'levelsReceive' : 0,
        'services' : 0,
        'forwordGroup':0
      },
      options: { depth: 1 }
    },
    { 
      path: 'createdBy',
        select: {
          'id' :1,
          'name' :1,
          'userId' :1,
          'jobTitle' :1,
          'school' :1,
          'group' :1,
          // 'GroupscanViw' :1,
          // 'active' :1,
          'image' : 1,
      },
      options: { depth: 1 }
    },
    { 
      path: 'users',
        select: {
          '_id' :1,
          'name':1,
          'userId':1,
      },
      options: { depth: 1 }
    },
    {
      path : 'history.editedBy',
        select :{
          'id' :1,
          'name' :1,
          'userId' :1,
          'jobTitle' :1,
          'school' :1,
          'group' :1,
          'GroupscanViw' :0,
          'active' :1,
          'image' : 1
        },
        options:{depth :1}
    },
    {
      path : 'history.action.editedBy',
        select :{
          '_id' :0,
          'name' :1,
          'userId' :1,
          'jobTitle' :1,
          'school' :1,
          'group' :0,
          'GroupscanViw' :0,
          'active' :1,
          'image' : 1
        },
        options:{depth :1}
    },
    { 
      path: 'usersOnprase',
        select: {
          '_id' :1,
          'name':1,
          'userId':1,
          'group':1,
      },
      options: { depth: 1 }
    },
    {
      path : 'usersGroup',
      select : {}
    }

  ])
  next();
});


const setImageURL = (doc) => {
  if (doc.orderimg && !doc.orderimg.startsWith(process.env.BASE_URL)) {
    const imageUrl = `${process.env.BASE_URL}/orders/${doc.orderimg}`;
    doc.orderimg = imageUrl;
  }
  if (doc.donimgs && doc.donimgs.length > 0) {
    const imagesList = doc.donimgs.map((image) => image.startsWith(process.env.BASE_URL) ? image : `${process.env.BASE_URL}/orders/${image}`);
    doc.donimgs = imagesList;
  }
  if (doc.history && doc.history.length > 0) {
    doc.history.forEach(entry => {
      if (entry.imgDone && entry.imgDone.length > 0) {
        const imagesList = entry.imgDone.map((image) => image.startsWith(process.env.BASE_URL) ? image : `${process.env.BASE_URL}/orders/${image}`);
        entry.imgDone = imagesList;
      }
    });
  }
};

orderSchema.pre('findOne', function (next) {
  setImageURL(this);
  next();
});

orderSchema.pre('find', function (next) {
  this._conditions = this._conditions || {};
  setImageURL(this._conditions);
  next();
});

orderSchema.pre('update', function (next) {
  setImageURL(this._update);
  next();
});

orderSchema.pre('save', function (next) {
  setImageURL(this);
  next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order; 
