var mongoose = require('mongoose');

var pushNotificationDeviceSchema = new mongoose.Schema({
	
    deviceToken: String,
    active: Boolean
	
})

module.exports = mongoose.model('pushNotificationDevices', pushNotificationDeviceSchema);