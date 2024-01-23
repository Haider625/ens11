const mongoose = require('mongoose');

const groupUserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            minlength: [3, 'Too short name'],
            maxlength: [32, 'Too long name'],
            required: [true, 'name required'],
        },
        level : {
            type : Number,
            // unique: true,
            // maxlength: [6, 'Too long level'],
            // required: [true, 'level required'],
        },
        inlevel : {
            type : Number,
        },
        services : [{
           type :mongoose.Schema.ObjectId,
           ref : 'typeText2'
        }]
    },
    { timestamps: true }
);   
groupUserSchema.pre(/^find/, function (next) {
    this.populate({
      path: 'services',
      select: 'name typeText3',
    })

    next();
});
module.exports = mongoose.model('group', groupUserSchema);