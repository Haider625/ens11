const mongoose = require('mongoose');

const cardOrderSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.ObjectId,
            ref: 'order',
            required: [true, 'cardOrder must be belong to order'],
          },
        user:{
            type : mongoose.Schema.ObjectId,
            ref:'User',
            required: [true, 'cardOrder must be belong to user'],
            
        },
        accept:{
            type : String,
            enum : ['accept'],
            
        },
        rejuct :{
            type : String,
            enum : ['rejuct']
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
      select: 'title State type -_id ',
    });
    next();
  });



module.exports = mongoose.model('cardOrder',cardOrderSchema);
