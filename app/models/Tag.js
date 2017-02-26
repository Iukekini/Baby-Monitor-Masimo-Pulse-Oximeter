var mongoose = require('mongoose');

var TagSchema = new mongoose.Schema({
	text: String,
	date: Date,
	_id: mongoose.Schema.ObjectId

})

module.exports = mongoose.model('tags', TagSchema);
