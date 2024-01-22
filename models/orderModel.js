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
      reasonAccept: {
        type : String,
        default : "تم قبول الطلب"
      },
      reasonReject: {
        type : String,
        default : "تم رفظ الطلب"
      }
    },

    StateWork: {
      type :String,
      enum: ['acceptwork','startwork','endwork','reject','onprase'],
      default: 'onprase',
      reasonAccept: {
        type : String,
        default : "تم قبول الطلب"
      },
      reasonReject: {
        type : String,
        default : "تم رفظ الطلب"
      }
    },

    StateDone : {
      type : String ,
      enum : ['onprase','reject','accept'],
      default: 'onprase',
      reasonAccept: {
        type : String,
        default : "تم قبول الطلب"
      },
      reasonReject: {
        type : String,
        default : "تم رفظ الطلب"
      }
    },

    group: [{
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
      }
  }]

  },
  { timestamps: true, toJSON: { virtuals: true } }
);

orderSchema.plugin(mongoosePaginate);
orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'group',
    select: 'name level inlevel', // Adjust the fields you want to populate
  })
  this.populate({
    path: 'createdBy',
    select: 'name userId school group ',
    })
  this.populate({
   path: 'users',
   select: 'name userId school group ',
    });
  this.populate({
    path: 'history.editedBy',
    select: 'name userId school group ',
     });
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
