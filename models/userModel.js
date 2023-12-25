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
        required: [true, 'userId required'],
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
      profileImg: String,
     
      role: {
        type: String,
        enum: ['user', 'manger','admin'],
        default: 'user',
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
  
  const User = mongoose.model('User', userSchema);
  
  module.exports = User;