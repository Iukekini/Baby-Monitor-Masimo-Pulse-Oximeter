var mongoose = require('mongoose');

var RADEventSchema = new mongoose.Schema({
	spo2: Number,
	bpm: Number,
	date: Date,
	serial_number: String,
	pi: Number,
	alarm: String,
	_id: mongoose.Schema.ObjectId
	
})

module.exports = mongoose.model('radevents', RADEventSchema);