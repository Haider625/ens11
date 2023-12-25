const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        title:{
            type :String,
           
        },
        caption :{
            type : String
        },
        materialName : {
            type : String
        },
        type :{
            type : ['Service','Material'],
            State : String ,
            number :String
        },
        State :{
            type : String,
            enum : ['accept', 'reject', 'onprase'],
            default : 'onprase'
        },
        image : String,
        user : {
            type : mongoose.Schema.ObjectId,
            ref:'User',
            // required: [true, 'Order must be belong to user']
        }
    },
    { timestamps: true }
)
orderSchema.pre(/^find/, function (next) {
    this.populate({
      path: 'user',
      select: 'name userId school ',
    });
    next();
  });
module.exports = mongoose.model('order',orderSchema);