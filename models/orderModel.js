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

    orderimg : [String],

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


    StateWork: {
      type :String,
      enum: ['acceptwork','startwork','endwork','confirmWork','reject','onprase'],
      default: 'onprase',

    },


    StateDone : {
      type : String ,
      enum : ['onprase','reject','accept'],
      default: 'onprase',

    },

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
      // default: null,
      // set: function (userId) {
      //   return userId || this.user || null;
      // },
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
createrGroupName :{
  type :String
},
    senderGroupId :{
      type :String ,
      // default : 'null'
    },
    senderGroupName :{
      type :String ,
      // default : 'null'
    },
    timeSinceLastRefresh : {
      days: {
         type: Number
        },
      hours: {
         type: Number
        },
      minutes: {
         type: Number
        },
      seconds: {
         type: Number
        }
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
      operationTime : {
         days: {
         type: Number
         },
         hours: {
         type: Number
         },
         minutes: {
         type: Number
         },
         seconds: {
         type: Number
         }
   } ,
      
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

  TimeReceive : {
    type : Date ,
    default : Date.now() 
  }

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
        'forwordGroup':0,
        'jobTitle' : 1
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
        'forwordGroup':0,
        'jobTitle' : 1
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
          'group' :0,
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
orderSchema.pre('aggregate',function (next) {
    const pipeline = this.pipeline();
  
  pipeline.push(
 
    { $unwind: '$history' },
    {
    $lookup:{
    from: 'users',
    let: { editedById: '$history.editedBy' },
    pipeline: [
      { $match: { $expr: { $eq: ['$_id', '$$editedById'] } } },
      { $project: {
          id: 1,
          name: 1,
          userId: 1,
          jobTitle: 1,
          school: 1,
          image: 1,
          // اضف الحقول التي ترغب في استرجاعها فقط من history.editedBy
        }
      }
    ],
    as: 'history.editedBy',
    }
    },

 {
    $addFields: {
      'history.editedAt': '$history.editedAt',
      'history.action': '$history.action',
      'history.reason': '$history.reason',
      'history.operationTime': '$history.operationTime',
      'history.imgDone': '$history.imgDone',
    }
  },
    { $unwind: '$createdBy' },
    {
    $lookup:{
    from: 'users',
    let: { editedById: '$createdBy' },
    pipeline: [
      { $match: { $expr: { $eq: ['$_id', '$$editedById'] } } },
      { $project: {
          id: 1,
          name: 1,
          userId: 1,
          jobTitle: 1,
          school: 1,
          image: 1,
          // اضف الحقول التي ترغب في استرجاعها فقط من history.editedBy
        }
      }
    ],
    as: 'createdBy',
    }
    },
{
  $addFields: {
    'createdBy': {
      $map: {
        input: '$createdBy',
        as: 'creator',
        in: {
          $mergeObjects: [
            '$$creator',
            {
              image: {
                $cond: {
                  if: { $ne: [{ $type: '$$creator.image' }, 'missing'] },
                  then: { $concat: [process.env.BASE_URL, '/users/', '$$creator.image'] },
                  else: '$$creator.image'
                }
              }
            }
          ]
        }
      }
    }
  }
},
{
  $addFields: {
    'history.editedBy': {
      $map: {
        input: '$history.editedBy',
        as: 'editor',
        in: {
          $mergeObjects: [
            '$$editor',
            {
              image: { $concat: [process.env.BASE_URL, '/users/', '$$editor.image'] }
            }
          ]
        }
      }
    }
  }
},
    // Group back to reconstruct the document
    {
      $group: {
        _id: '$_id',
        timeSinceLastRefresh: { $first: '$timeSinceLastRefresh' },
        type1: { $first: '$type1' }, 
        type2: { $first: '$type2' }, 
        type3: { $first: '$type3' },
        number: { $first: '$number' },
        caption: { $first: '$caption' },
        orderimg: { $first: '$orderimg' },
        donimgs: { $first: '$donimgs' }, 
        State: { $first: '$State' }, 
        StateWork: { $first: '$StateWork' },
        StateDone: { $first: '$StateDone' },
        group: { $first: '$group' },
        users: { $first: '$users' },
        groups: { $first: '$groups' }, 
        usersOnprase: { $first: '$usersOnprase' }, 
        archive: { $first: '$archive' },
        FastOrder: { $first: '$FastOrder' },
        // Collect all history details back into an array
        history: { $push: '$history' },
        createdBy: { $first: '$createdBy' },
        createrGroupId: { $first: '$createrGroupId' },
        createrGroupName: { $first: '$createrGroupName' },      
        senderGroupId: { $first: '$senderGroupId' },
        senderGroupName: { $first: '$senderGroupName' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        TimeReceive: { $first: '$TimeReceive' },

        
      }
    }
  );

  next();
})


const setImageURL = (doc) => {
  // if (doc.orderimg && !doc.orderimg.startsWith(process.env.BASE_URL)) {
  //   const imageUrl = `${process.env.BASE_URL}/orders/${doc.orderimg}`;
  //   doc.orderimg = imageUrl;
  // }
  if (doc.orderimg && doc.orderimg.length > 0) {
    const imagesList = doc.orderimg.map((image) => image.startsWith(process.env.BASE_URL) ? image : `${process.env.BASE_URL}/orders/${image}`);
    doc.orderimg = imagesList;
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



// orderSchema.pre('aggregate', function (next) {
//   this.lookup({
//     from: 'groups',
//     let: { groupId: '$group' },
//     pipeline: [
//       { $match: { $expr: { $eq: ['$_id', '$$groupId'] } } },
//       { $project: {
//           id: 1,
//           name: 1,
//           level: 1,
//           inlevel: 1,
//           jobTitle: 1,
//           // اضف الحقول التي ترغب في استرجاعها فقط من group
//         }
//       }
//     ],
//     as: 'group',
//   }).lookup({
//     from: 'groups',
//     let: { groupsId: '$groups' },
//     pipeline: [
//       { $match: { $expr: { $in: ['$_id', '$$groupsId'] } } },
//       { $project: {
//           id: 1,
//           name: 1,
//           level: 1,
//           inlevel: 1,
//           jobTitle: 1,
//           // اضف الحقول التي ترغب في استرجاعها فقط من groups
//         }
//       }
//     ],
//     as: 'groups',
//   }).lookup({
//     from: 'users',
//     let: { createdByUserId: '$createdBy' },
//     pipeline: [
//       { $match: { $expr: { $eq: ['$_id', '$$createdByUserId'] } } },
//       { $project: {
//           id: 1,
//           name: 1,
//           userId: 1,
//           jobTitle: 1,
//           school: 1,
//           group: 1,
//           image: 1,
//           // اضف الحقول التي ترغب في استرجاعها فقط من createdBy
//         }
//       }
//     ],
//     as: 'createdBy',
//   }).lookup({
//     from: 'users',
//     let: { usersId: '$users' },
//     pipeline: [
//       { $match: { $expr: { $in: ['$_id', '$$usersId'] } } },
//       { $project: {
//           _id: 1,
//           name: 1,
//           userId: 1,
//           // اضف الحقول التي ترغب في استرجاعها فقط من users
//         }
//       }
//     ],
//     as: 'users',
//   }).lookup({
//     from: 'users',
//     let: { editedById: '$history.editedBy' },
//     pipeline: [
//       { $match: { $expr: { $in: ['$_id', '$$editedById'] } } },
//       { $project: {
//           id: 1,
//           name: 1,
//           userId: 1,
//           jobTitle: 1,
//           school: 1,
//           active: 1,
//           image: 1,
//           // اضف الحقول التي ترغب في استرجاعها فقط من history.editedBy
//         }
//       }
//     ],
//     as: 'history.editedBy',
//   }).lookup({
//     from: 'users',
//     let: { actionEditedById: '$history.action.editedBy' },
//     pipeline: [
//       { $match: { $expr: { $in: ['$_id', '$$actionEditedById'] } } },
//       { $project: {
//           name: 1,
//           userId: 1,
//           jobTitle: 1,
//           school: 1,
//           active: 1,
//           image: 1,
//           // اضف الحقول التي ترغب في استرجاعها فقط من history.action.editedBy
//         }
//       }
//     ],
//     as: 'history.action.editedBy',
//   }).lookup({
//     from: 'users',
//     let: { usersOnpraseId: '$usersOnprase' },
//     pipeline: [
//       { $match: { $expr: { $in: ['$_id', '$$usersOnpraseId'] } } },
//       { $project: {
//           _id: 1,
//           name: 1,
//           userId: 1,
//           group: 1,
//           // اضف الحقول التي ترغب في استرجاعها فقط من usersOnprase
//         }
//       }
//     ],
//     as: 'usersOnprase',
//   })
//   // .lookup({
//   //   from: 'users',
//   //   let: { usersGroupId: '$usersGroup' },
//   //   pipeline: [
//   //     { $match: { $expr: { $in: ['$_id', '$$usersGroupId'] } } },
//   //     { $project: {
        
//   //       }
//   //     }
//   //   ],
//   //   as: 'usersGroup',
//   // });

//   next();
// });

// orderSchema.pre('aggregate', function (next) {
//   // this.lookup({
//   //   from: 'groups',
//   //   let: { groupId: '$group' },
//   //   pipeline: [
//   //     { $match: { $expr: { $eq: ['$_id', '$$groupId'] } } },
//   //     { $project: {
//   //         id: 1,
//   //         name: 1,
//   //         level: 1,
//   //         inlevel: 1,
//   //         jobTitle: 1,
//   //         // اضف الحقول التي ترغب في استرجاعها فقط من group
//   //       }
//   //     }
//   //   ],
//   //   as: 'group',
//   // })
//   this.lookup({
//     from: 'users',
//     let: { createdByUserId: '$createdBy' },
//     pipeline: [
//       { $match: { $expr: { $eq: ['$_id', '$$createdByUserId'] } } },
//       { $project: {
//           id: 1,
//           name: 1,
//           userId: 1,
//           jobTitle: 1,
//           school: 1,
//           group: 1,
//           image: 1,
//           // اضف الحقول التي ترغب في استرجاعها فقط من createdBy
//         }
//       }
//     ],
//     as: 'createdBy',
//   })
//   // .lookup({
//   //   from: 'users',
//   //   let: { usersId: '$users' },
//   //   pipeline: [
//   //     { $match: { $expr: { $in: ['$_id', { $ifNull: ['$$usersId', []] }] } } },
//   //     { $project: {
//   //         _id: 1,
//   //         name: 1,
//   //         userId: 1,
//   //         // اضف الحقول التي ترغب في استرجاعها فقط من users
//   //       }
//   //     }
//   //   ],
//   //   as: 'users',
//   // })
//   .lookup({
//     from: 'users',
//     let: { editedById: '$history.editedBy' },
//     pipeline: [
//       { $match: { $expr: { $in: ['$_id', { $ifNull: ['$$editedById', []] }] } } },
//       { $project: {
//           id: 1,
//           name: 1,
//           userId: 1,
//           jobTitle: 1,
//           school: 1,
//           active: 1,
//           image: 1,
//           // اضف الحقول التي ترغب في استرجاعها فقط من history.editedBy
//         }
//       }
//     ],
//     as: 'history.editedBy',
//   }).lookup({
//     from: 'users',
//     let: { actionEditedById: '$history.action.editedBy' },
//     pipeline: [
//       { $match: { $expr: { $in: ['$_id', { $ifNull: ['$$actionEditedById', []] }] } } },
//       { $project: {
//           name: 1,
//           userId: 1,
//           jobTitle: 1,
//           school: 1,
//           active: 1,
//           image: 1,
//           // اضف الحقول التي ترغب في استرجاعها فقط من history.action.editedBy
//         }
//       }
//     ],
//     as: 'history.action.editedBy',
//   })
//   // .lookup({
//   //   from: 'order',
//   //   let: { actionEditedById: '$history' },
//   //   pipeline: [
//   //     { $match: { $expr: { $in: ['$_id', { $ifNull: ['$$actionEditedById', []] }] } } },
//   //     { $project: {
//   //       editedAt:1,
//   //       editedBy:1,

//   //         // اضف الحقول التي ترغب في استرجاعها فقط من history.action.editedBy
//   //       }
//   //     }
//   //   ],
//   //   as: 'history',
//   // })
  
  
  
  
//   .lookup({
//     from: 'users',
//     let: { usersOnpraseId: '$usersOnprase' },
//     pipeline: [
//       { $match: { $expr: { $in: ['$_id', { $ifNull: ['$$usersOnpraseId', []] }] } } },
//       { $project: {
//           _id: 1,
//           name: 1,
//           userId: 1,
//           group: 1,
//           // اضف الحقول التي ترغب في استرجاعها فقط من usersOnprase
//         }
//       }
//     ],
//     as: 'usersOnprase',
//   })
//   // .lookup({
//   //   from: 'users',
//   //   let: { usersGroupId: '$usersGroup' },
//   //   pipeline: [
//   //     { $match: { $expr: { $in: ['$_id', { $ifNull: ['$$usersGroupId', []] }] } } },
//   //     { $project: {
//   //         // اضف الحقول التي ترغب في استرجاعها فقط من usersGroup
//   //       }
//   //     }
//   //   ],
//   //   as: 'usersGroup',
//   // });

//   next()
// });

