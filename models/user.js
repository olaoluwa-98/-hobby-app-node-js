const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');
const sha1 = require('sha1');
// const uniqueValidator = require('mongoose-unique-validator');

// define the schema for our user model
const UserSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        trim: true,
        required: ['true', 'Email of the user is required']
    },

    phone_no: {
        type: String,
        trim: true,
        minlength: [11, 'Nigerian numbers should be of length 11'],
        maxlength: [11, 'Nigerian numbers should be of length 11'],
        required: ['true', 'Phone number of the user is required']
    },

    email_token: {
        type: String,
        required: ['true', 'Email token of the user is required']
    },

    reset_token: {
        type: String,
        default: null
    },

    username: {
        type: String,
        unique: true,
        trim: true,
        required: ['true', 'Username of the user is required']
    },

    password: {
        type: String,
        required: ['true', 'Password of the user is required']
    },

    first_name: {
        type: String,
        trim: true,
        required: ['true', 'First Name of the user is required']
    },

    last_name: {
        type: String,
        trim: true,
        required: ['true', 'Last Name of the user is required']
    },

    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});


// methods ======================
// generating a hash
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// generate token to validate their email
UserSchema.methods.generateEmailToken = function(email) {
    return sha1(email);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

UserSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

// UserSchema.plugin(uniqueValidator);

UserSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'));
  } else {
    next(error);
  }
});

UserSchema.on('index', function (err) {
  if (err) {
    console.error(err);
  }
});

module.exports = mongoose.model('User', UserSchema);