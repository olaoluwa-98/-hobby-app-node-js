var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: ['true', 'Email of the user is required']
    },

    email_token: {
        type: String,
        required: ['true', 'Email token of the user is required']
    },

    username: {
        type: String,
        unique: true,
        required: ['true', 'Username of the user is required']
    },
    password: {
        type: String,
        required: ['true', 'Password of the user is required']
    },
    first_name: {
        type: String,
        required: ['true', 'First Name of the user is required']
    },
    last_name: {
        type: String,
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

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', UserSchema);