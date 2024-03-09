const mongoose = require('mongoose');

const groupUserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            minlength: [3, 'Too short name'],
            maxlength: [32, 'Too long name'],
            required: [true, 'name required'],
            unique: true,
            lowercase: true,
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
        levelSend : {
            type : mongoose.Schema.ObjectId,
            ref:'group',
        },
        levelsReceive : [{
            type : mongoose.Schema.ObjectId,
            ref:'group',
        }],
        forwordGroup :[{
            type : mongoose.Schema.ObjectId,
            ref:'group',
        }],
        services : [{
           type :mongoose.Schema.ObjectId,
           ref : 'typeText2'
        }],
        createdAt: {
            type :Date,
            default:Date.now()
        },
    },
);   
groupUserSchema.pre(/^find/, function (next) {
    this.populate([
        { path: 'services',
            select: {
                'name':1,
                'typeText3':1
            },
             options: { depth: 1 }
        },
        { path: 'levelSend',
            select: { 
                '_id':1,
                'name': 1,
                'levelSend': 0 ,
                'levelsReceive': 0,
                'forwordGroup' : 0,
                'services':0 
            }, 
            options: { depth: 1 }
        }, 
        {
        path: 'levelsReceive',
            select: {
                '_id':1,
                'name': 1,
                'levelSend': 0,
                'levelsReceive': 0,
                'forwordGroup' : 0,
                'services':0
            },
            options: { depth: 1 } 
        },
        {
        path: 'forwordGroup',
        select: {
            '_id':1,
            'name': 1,
            'levelSend': 0,
            'levelsReceive': 0,
            'forwordGroup' : 0,
            'services':0,

        },
        options: { depth: 1 } 
    },
    ]);
    next();
});


module.exports = mongoose.model('group', groupUserSchema);