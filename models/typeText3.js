const mongoose = require('mongoose');

const typeText3Schema = new mongoose.Schema(
    {
        name: {
            type: String,
            minlength: [1, 'Too short name'],
            maxlength: [150, 'Too long name'],
            required: [true, 'name required'],
        },
        typeText2 :[{
            type : mongoose.Schema.ObjectId,
            ref : 'typeText2',
        }],
        createdAt: {
            type :Date,
            default:Date.now()
          },
    },
 
);   
typeText3Schema.pre(/^find/, function (next) {
    this.populate({
      path: 'typeText2',
      select: 'name ',
    })
    next();
});

module.exports = mongoose.model('typeText3', typeText3Schema);
