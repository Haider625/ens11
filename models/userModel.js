const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        trim: true,
        required: [true, 'name required'],
      },
     
      userId: {
        type: String,
        required: [true, 'userId required'],
        unique: true,
        lowercase: true,
      },
      password: {
        type: String,
        required: [true, 'password required'],
        minlength: [6, 'Too short password'],
      },     
      jobTitle : {
        type: String,
        // required: [true, 'jobTitle required'],
        minlength: [4,'Too short job title']
      },
      school : {
        type: String,
        minlength: [4,'Too short job title']
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