/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const orderSchema = new mongoose.Schema(
  {
    type: {
      type1: {
        type: String,
      },
      type2: {
        type: String,
      },
      type3: {
        type: String,
      },
    },
    number : Number ,
    caption: {
      type: String,
      minlength: [4, 'Too short caption'],
      maxlength: [200, 'Too long caption'],
    },
    materialName: {
      type: String,
    },
    orderimg : String,
    donImgs : [String],
    State: {
      type: String,
      enum: ['accept','reject','onprase'],
      default: 'onprase',
      reason: {
        type : String,
        default : "تم رفظ الطلب"
      }
    },
    StateWork: {
      type :String,
      enum: ['acceptwork','startwork','endwork','reject','onprase'],
      default: 'onprase',
      reason: {
        type : String,
        default : "تم رفظ الطلب"
      }
    },
    StateDone : {
      type : String ,
      enum : ['onprase','accept']
    },
    group: [{
      type: mongoose.Schema.ObjectId,
      ref: 'group',
      default: 'onprase',
    }],
    users : [{
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null, // قيمة افتراضية تكون null لتحديد عدم وجود قيمة
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
      editedAt: { type: Date, default: Date.now },
      editedBy: { type: mongoose.Schema.ObjectId, ref: 'User' }, // استبدل 'User' باسم السكيما الخاصة بالمستخدمين
      action:   { type:String}
  }]
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

orderSchema.plugin(mongoosePaginate);
orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'group',
    select: 'name level inlevel', // Adjust the fields you want to populate
  });
  next();
});
orderSchema.pre(/^find/, function (next) {
  this.populate({
      path: 'createdBy',
      select: 'name userId school ',
  });
  next();
});
orderSchema.pre(/^find/, function (next) {
  this.populate({
      path: 'users',
      select: 'name userId school level inlevel',
  });
  next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order; // Export the Order model
