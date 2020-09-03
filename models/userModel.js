const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name']
  },
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // in validator function we return true or false
      // ... if the return value is false we're gonna get a validation error
      // This only gonna work on CREATE and SAVE!!!!
      validator: function (el) {
        return el === this.password;
        // if password confirm is ABC
        // ... and password also ABC then this will return true
      },
      message: 'Passwords are not the same'
    }
  }
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  // we want to set our current password basically to encrypt
  // ... this version of the original password with a cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the passwordConfirm field
  // With this, we encrypted our pasword and now in the end
  // ... what we need to do delete the confirm password
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPasssword
) {
  return await bcrypt.compare(candidatePassword, userPasssword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
