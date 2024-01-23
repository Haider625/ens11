const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        trim: true,
        minlength: [3,'Too short name'],
        maxlength : [32,'Too long name'],
        required: [true, 'name required'],
      },
      userId: {
        type: String,
        // required: [true, 'userId required'],
        minlength: [4,'Too short userId'],
        maxlength : [16,'Too long userId'],
        unique: true,
        lowercase: true,
      },
      password: {
        type: String,
        required: [true, 'password required'],
        minlength: [6, 'Too short password'],
        maxlength: [16, 'Too long password'],
      },     
      jobTitle : {
        type: String,
        // required: [true, 'jobTitle required'],
        minlength: [4,'Too short job title'],
        maxlength: [32,'Too long job title']
      },
      school : {
        type: String,
        minlength: [4,'Too short school'],
        maxlength: [32,'Too long school']
      },
      phone: String,
      image: String,
      group : {
        type : mongoose.Schema.ObjectId,
        ref:'group',
        required: [true, 'user must be belong to grop']
      },
      Permission: {
        canViwOneOrder :{
          type: Boolean,
          default: false,
        },
        canViwsOrder :  {
          type: Boolean,
          default: false,
        },
        canEidtOrder :  {
          type: Boolean,
          default: false,
        },
        canCreatOrder : {
          type: Boolean,
          default: false,
        },
        canDeletOrder : {
          type: Boolean,
          default: false,
        },

        canViwOneUser :{
          type: Boolean,
          default: false,
        },
        canViwsUser :  {
          type: Boolean,
          default: false,
        },
        canEidtUser :  {
          type: Boolean,
          default: false,
        },
        canCreatUser : {
          type: Boolean,
          default: false,
        },
        canDeletUser : {
          type: Boolean,
          default: false,
        },

        canForword: {
          type: Boolean,
          default: false,
        },
        canAcceptOrder : {
          type: Boolean,
          default: false,
        },
        canAcceptWork : {
          type: Boolean,
          default: false,
        },
        canRejectOrder : {
          type: Boolean,
          default: false,
        },
        canRejectWork : {
          type: Boolean,
          default: false,
        },

        canViwOneWordtext :{
          type: Boolean,
          default: false,
        },
        canViwsWordtext :  {
          type: Boolean,
          default: false,
        },
        canCreatWordtext : {
          type: Boolean,
          default: false,
        },
        canDeletWordtext : {
          type: Boolean,
          default: false,
        },
        canEditWordtext :  {
          type: Boolean,
          default: false,
        },

        canViwOnetypeText1 :{
          type: Boolean,
          default: false,
        },
        canViwstypeText1 :  {
          type: Boolean,
          default: false,
        },
        canCreattypeText1 : {
          type: Boolean,
          default: false,
        },
        canDelettypeText1 : {
          type: Boolean,
          default: false,
        },
        canEdittypeText1 :  {
          type: Boolean,
          default: false,
        },

        canViwOnetypeText2 :{
          type: Boolean,
          default: false,
        },
        canViwstypeText2 :  {
          type: Boolean,
          default: false,
        },
        canCreattypeText2: {
          type: Boolean,
          default: false,
        },
        canDelettypeText2 : {
          type: Boolean,
          default: false,
        },
        canEdittypeText2 :  {
          type: Boolean,
          default: false,
        },

        canViwOnetypeText3 :{
          type: Boolean,
          default: false,
        },
        canViwstypeText3 :  {
          type: Boolean,
          default: false,
        },
        canCreattypeText3 : {
          type: Boolean,
          default: false,
        },
        canDelettypeText3 : {
          type: Boolean,
          default: false,
        },
        canEdittypeText3 :  {
          type: Boolean,
          default: false,
        },

        canViwOneArchive :{
          type: Boolean,
          default: false,
        },
        canViwsArchive :  {
          type: Boolean,
          default: false,
        },
        canEidtArchive :  {
          type: Boolean,
          default: false,
        },
        canCreatArchive : {
          type: Boolean,
          default: false,
        },
        canDeletArchive : {
          type: Boolean,
          default: false,
        },

        canViwOneGroup :{
          type: Boolean,
          default: false,
        },
        canViwsGroup :  {
          type: Boolean,
          default: false,
        },
        canEidtGroup :  {
          type: Boolean,
          default: false,
        },
        canCreatGroup : {
          type: Boolean,
          default: false,
        },
        canDeletGroup : {
          type: Boolean,
          default: false,
        },

        canViwGroupsViw : {
          type: Boolean,
          default: false,
        },
        canViwsGroupsViw : {
          type: Boolean,
          default: false,
        },
        canEidGroupsViw : {
          type: Boolean,
          default: false,
        },
        canCreatGroupsViw :{
          type: Boolean,
          default: false,
        },
        canDeletGroupsViw :{
          type: Boolean,
          default: false,
        },
      },
      GroupscanViw : [{
        type : mongoose.Schema.ObjectId,
        ref:'group',
      }],
      levelSend : [{
        type : mongoose.Schema.ObjectId,
        ref:'group',
        required: [true, 'levelSend required'],
      }],
      levelsReceive : [{
        type : mongoose.Schema.ObjectId,
        ref:'group',
      required: [true, 'levelsReceive required'],
      }],
      forwordLevels : [{
        type : mongoose.Schema.ObjectId,
        ref:'group',
      }],
      role: {
        type: String,
        enum: ['user', 'manger','admin'],
        default: 'admin',
      },
      active: {
        type: Boolean,
        default: true,
      },
    },
    { timestamps: true }
  );
  
  userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    // Hashing user password
    this.password = await bcrypt.hash(this.password, 12);
    next();
  });
  userSchema.pre(/^find/, function (next) {
    this.populate({
      path: 'group',
      select: 'name level inlevel',
    })
    .populate({
      path: 'GroupscanViw',
      select: 'name level inlevel',
    })
    .populate({
      path: 'levelSend',
      select: 'name level inlevel',
    })
    .populate({
      path: 'levelsReceive',
      select: 'name level inlevel',
      })
      .populate({
        path: 'forwordLevels',
        select: 'name level inlevel',
        })
    next();
  });
  // const setImageURL = (doc) => {
  //   if (doc.image) {
  //     const imageUrl = `${process.env.BASE_URL}/users/${doc.image}`;
  //     doc.image = imageUrl;
  //   }
  // };
  // // findOne, findAll and update
  // userSchema.post('init', (doc) => {
  //   setImageURL(doc);
  // });
  
  // // create
  // userSchema.post('save', (doc) => {
  //   setImageURL(doc);
  // });

  const setImageURL = (doc) => {
    if (doc.image && !doc.image.startsWith(process.env.BASE_URL)) {
      const imageUrl = `${process.env.BASE_URL}/users/${doc.image}`;
      doc.image = imageUrl;
    }
  };
  
  userSchema.post('init', (doc) => {
    setImageURL(doc);
  });
  
  // create
  userSchema.post('save', (doc) => {
    setImageURL(doc);
  });
  userSchema.methods.getGroupscanViwData = async function () {
    // تأكيد وجود GroupscanViw في Permission
    if (this.Permission && this.Permission.GroupscanViw && this.Permission.GroupscanViw.length > 0) {
      // جلب بيانات المجموعات المفصلة
      const groupscanViwData = await mongoose.model('group').find({ '_id': { $in: this.Permission.GroupscanViw } }, 'name level inlevel');
      return groupscanViwData;
    } 
      return [];
    
  };
  const User = mongoose.model('User', userSchema);
  module.exports = User;