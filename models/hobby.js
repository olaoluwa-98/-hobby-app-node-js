const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create hobby schema and model
const HobbySchema  =  new Schema({
	title: {
		type: String,
		required: ['true', 'Title of hobby is required']
	},
	body: {
		type: String,
		required: ['true', 'Body of hobby is required']	
	},
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now },
});

const Hobby = mongoose.model('Hobby', HobbySchema);

module.exports = Hobby;