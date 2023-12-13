const mongoose = require('mongoose');

const cardOrderSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.ObjectId,
            ref: 'order',
            //  required: [true, 'cardOrder must be belong to order'],
          },
        user:{
            type : mongoose.Schema.ObjectId,
            ref:'User',
            
        },
        accept:{
            type :Boolean,
            default : true
        },
        rejuct :{
            type : String
        },
        forword : {
            type : String
        },
       
        image : String
    },
    { timestamps: true }
)
cardOrderSchema.pre(/^find/, function (next) {
    this.populate({
      path: 'order',
      select: 'title -_id - State - type -',
    });
    next();
  });

  
module.exports = mongoose.model('cardOrder',cardOrderSchema);