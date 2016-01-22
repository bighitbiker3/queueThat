var mongoose = require('mongoose');
var Schema       = mongoose.Schema;

var songSchema = new Schema({
	artistName: String,
	titleName: String,
	songId: Number,
	songImg: String,
	queueTimes: {
		type: Number,
		default: 1
	},
	lastQueued: {
		type: Date,
		default: Date.now
	}

});

var Song = module.exports = mongoose.model('Song', songSchema);