var mongoose = require('mongoose');
var Schema       = mongoose.Schema;

var userSchema = new Schema({
	id: String,
	created: Date,
	token: String,
	rToken: String,
	displayName: String,
	permalink: String

});

var User = module.exports = mongoose.model('User', userSchema);