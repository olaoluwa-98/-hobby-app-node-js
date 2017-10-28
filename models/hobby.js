const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create hobby schema and model
const HobbySchema  =  new Schema({
	title: {
		type: String,
		maxlength: [30, 'Title of hobby longer is than 30 characters'],
		required: ['true', 'Title of hobby is required']
	},
	body: {
		type: String,
		maxlength: [140, 'The twitter way, not more than 140 chars'],
		required: ['true', 'Body of hobby is required']	
	},
	favorite: {
		type: Boolean,
		default: false,
	},
	user_id: {
		type: Schema.Types.ObjectId,
		required: ['true', 'User ID of this hobby is required'],
		ref: 'User'
	},
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now },
});

HobbySchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

module.exports = mongoose.model('Hobby', HobbySchema);