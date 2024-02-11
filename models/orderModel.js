/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const orderSchema = new mongoose.Schema(
  {
    type1: {
       type: String,
    },

    type2: {
      type: String,
    },

    type3: {
      type: String,
    },

    number : Number ,

    caption: {
      type: String,
      minlength: [4, 'Too short caption'],
      maxlength: [300, 'Too long caption'],
    },

    orderimg : String,

    donimgs : [String],

    State: {
      type: String,
      enum: ['accept','reject','onprase'],
      default: 'onprase',

    },

    StateReasonAccept: {
      type : String,
      default : "تم قبول الطلب"
    },
    StateReasonReject: {
      type : String,
      default : "تم رفظ الطلب"
    },
    StateReasonOnprase: {
      type : String,
      default : "تم تحويل الطلب"
    },

    StateWork: {
      type :String,
      enum: ['acceptwork','startwork','endwork','reject','onprase'],
      default: 'onprase',

    },
    StateWorkReasonAccept: {
      type : String,
      default : "تم قبول الطلب"
    },
    StateWorkReasonReject: {
      type : String,
      default : "تم رفظ الطلب"
    },

    StateDone : {
      type : String ,
      enum : ['onprase','reject','accept'],
      default: 'onprase',

    },

    StateDoneReasonAccept: {
      type : String,
      default : "تم قبول الطلب"
    },
    StateDoneReasonReject: {
      type : String,
      default : "تم رفظ الطلب"
    },
    group : {
      type: mongoose.Schema.ObjectId,
      ref: 'group',
    },

    groups: [{
      type: mongoose.Schema.ObjectId,
      ref: 'group',
     
    }],

    users : [{
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null,
      set: function (userId) {
        return userId || this.user || null;
      },
    }],

    createdBy :{
        type :mongoose.Schema.ObjectId,
        ref : 'User',
        required: [true, 'Order must belong to a user']
     },

     history: [{
      editedAt: { 
        type: Date,
         default: Date.now
         },
      editedBy: {
         type: mongoose.Schema.ObjectId,
          ref: 'User'
         }, // استبدل 'User' باسم السكيما الخاصة بالمستخدمين
      action:   { 
        type:String
      },
      reason :{ 
        type:String
      }
  }]

  },
  { timestamps: true, toJSON: { virtuals: true } }
);

orderSchema.plugin(mongoosePaginate);
orderSchema.pre(/^find/, function (next) {
  this.populate([
    { 
      path: 'group',
        select: {
        '_id' : 1,
        'name':1,
        'level':1,
        'inlevel':1,
        'levelSend':1,
        'services' : 1
      },
      options: { depth: 1 }
    },
    { 
      path: 'groups',
        select: {
        '_id' : 1,
        'name':1,
        'level':1,
        'inlevel':1,
        'levelSend':1,
        'services' : 0
      },
      options: { depth: 1 }
    },
    { 
      path: 'createdBy',
        select: {
          '_id' :1,
          'name':1,
          'userId':1,
          'group':1,
      },
      options: { depth: 1 }
    },
    { 
      path: 'users',
        select: {
          '_id' :1,
          'name':1,
          'userId':1,
          'group':1,
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
          '_id' :0,
          'name' :1,
          'userId' :1,
          'image' : 1
        },
        options:{depth :1}
    }

  ])
  // this.populate({
  //   path: 'createdBy',
  //   select: 'name userId',
  //   })
  // this.populate({
  //  path: 'users',
  //  select: 'name userId school group ',
  //   });
//   this.populate({
//     path: 'history.editedBy',
//     select: 'name userId',
//      });
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
};

// findOne, findAll, and update
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

// create
orderSchema.pre('save', function (next) {
  setImageURL(this);
  next();
});
const Order = mongoose.model('Order', orderSchema);
module.exports = Order; // Export the Order model
