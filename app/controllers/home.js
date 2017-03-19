var RadEvent = require('../models/RADEvent');
var Device = require('../models/pushNotificationDevice');
var settings = require('../config/settings');
var apn = require('apn')
/**
 * GET /
 * Home page.
 */
exports.index = function (req, res) {
    res.render('home', {
        title: 'Home'
    });
};


/**
 * GET /status
 * Live status page.
 */
exports.status = function (req, res) {
    res.render('status', {
        title: 'Status'
    });
};
/**
 * GET /historical
 * Historical SPO2 Graph Page
 */
exports.historical = function (req, res) {
    res.render('historical', {
        title: 'Historical'
    });
};
/**
 * GET /tags
 * Adding tags Page
 */
exports.tags = function (req, res) {
    res.render('tags', {
        title: 'Tags'
    });
};
/**
 * GET /pruned
 * Adding pruned Page
 */
exports.pruned = function (req, res) {
    res.render('pruned', {
        title: 'Pruned'
    });
};


/**
 * GET /data
 * Get the last record inserted into the Mongo db and returns it to the user.
 */
exports.data = function (req, res) {

    var deviceToken = req.params.deviceToken
    res.setHeader('Content-Type', 'application/json');
    var events = RadEvent.find({})
        .sort({ date: -1 })
        .limit(1)
    events.exec(function (e, docs) {
        res.send(docs);
    });
};

exports.pushNotification = function (req, res) {
    var basedir = __dirname;

    var options = {

        cert: basedir + "/../cert.pem",
        key: basedir + "/../key.pem",

    };

    var apnConnection = new apn.Connection(options);
    var iosDevices = Device.find({ active: true });

    iosDevices.exec(function (e, docs) {
        //send message
        docs.forEach(function (element) {
            var myDevice = new apn.Device(element._doc.deviceToken);
            var note = new apn.Notification();

            note.expiry = Math.floor(Date.now() / 1000) + 15; // Expires 1 hour from now.
            note.badge = 3;
            note.sound = "ping.aiff";
            note.alert = "🚨 " + req.params.message;
            note.payload = { 'messageFrom': 'Caroline' };

            apnConnection.pushNotification(note, myDevice);
        });
    });
};

exports.addDevice = function (req, res) {
    var deviceToken = req.params.deviceToken
    var searchDevices = Device.findOne({ deviceToken: deviceToken })
    searchDevices.exec(function (e, docs) {
        if (docs == null) {
            var newPushDevice = new Device(
                {
                    deviceToken: deviceToken,
                    active: true
                })
            newPushDevice.save(function (err) {
                if (err) return handleError(err);
            })
        }
    })
};
/**
 * GET /data
 * Get the last record inserted into the Mongo db and returns it to the user.
 */
exports.sampleData = function (req, res) {
    var skip = random(1, 100)
    res.setHeader('Content-Type', 'application/json');

    var events = RadEvent.find({})
        .sort({ date: -1 })
        .skip(skip)
        .limit(1)
    events.exec(function (e, docs) {
        res.send(docs);
    });
};

function random(low, high) {
    return Math.random() * (high - low) + low;
}



exports.SPO2Count = function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    //Group Events by Year/Month/Day/Minute/Alarm
    //Get the Average of the SPO2 for the group.
    if (req.query.start != null) {
        var startMS = parseFloat(req.query.start);
        var endMS = parseFloat(req.query.end);
        var start = new Date(startMS);
        var end = new Date(endMS);
        var duration = endMS - startMS;

         RadEvent
                .aggregate([
                    {
                        $match: {
                            spo2: { $ne: -1 },
                            pi: {$gte: 1},
                            date: {
                                $gte: start,
                                $lte: end
                            }
                        },

                    },
                    {
                        $group: {
                            _id: {

                                spo2: "$spo2"
                            },
                            count: { $sum: 1 }
                        },
                    }]

                , function (err, docs) {

                    var total = 0;
                    var results = [];
                     //For each Document Return Added it to either the SPO2 Graph resutls or the Alarm Results.
                    docs.forEach(function (element) {
                        total += element.count;
                    });

                    docs.forEach(function (element) {
                        results.push({
                            name: element._id.spo2,
                            y: (element.count / total) * 100
                        });
                    });
                    results = results.sort(namesort);
                    res.send(results);
                });
    }
}

/**
 * GET /historicalSPO2Data
 * Historical SPO2 Graph Data
 */
exports.historicalSPO2Data = function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    //Group Events by Year/Month/Day/Minute/Alarm
    //Get the Average of the SPO2 for the group.
    if (req.query.start != null) {
        var startMS = parseFloat(req.query.start);
        var endMS = parseFloat(req.query.end);
        var start = new Date(startMS);
        var end = new Date(endMS);
        var duration = endMS - startMS;

        if (duration <= 3600000) {
            RadEvent
                .aggregate([
                    {
                        $match: {
                            spo2: { $ne: -1 },
                            pi: {$gte: 1},
                            date: {
                                $gte: start,
                                $lte: end
                            }
                        },

                    },
                    {
                        $group: {
                            _id: {
                                second: { $second: "$date" },
                                minute: { $minute: "$date" },
                                hour: { $hour: "$date" },
                                month: { $month: "$date" },
                                day: { $dayOfMonth: "$date" },
                                year: { $year: "$date" },
                                alarm: "$alarm"
                            },
                            value: { $avg: "$spo2" },
                            std: { $stdDevPop: "$spo2" },
                            bpmValue: { $avg: "$bpm" },
                            piValue: { $avg: "$pi" },
                            min: { $min: "$spo2" },
                            max: { $max: "$spo2" }
                        },
                    }]

                , function (err, docs) {
                    if (err) console.trace(err)
                    RenderData(docs, res);
                });
        } else {

            RadEvent
                .aggregate([
                    {
                        $match: {
                            spo2: { $ne: -1 },
                            pi: {$gte: 1},
                            date: {
                                $gte: start,
                                $lte: end
                            }
                        },

                    },
                    {
                        $group: {
                            _id: {
                                minute: { $minute: "$date" },
                                hour: { $hour: "$date" },
                                month: { $month: "$date" },
                                day: { $dayOfMonth: "$date" },
                                year: { $year: "$date" },
                                alarm: "$alarm"
                            },
                            value: { $avg: "$spo2" },
                            bpmValue: { $avg: "$bpm" },
                            piValue: { $avg: "$pi" },
                            min: { $min: "$spo2" },
                            max: { $max: "$spo2" }
                        },
                    }]

                , function (err, docs) {
                    if (err) console.trace(err)
                    RenderData(docs, res);
                });
        }
    } else {


        RadEvent
            .aggregate([
                { $match: { spo2: { $ne: -1 }, pi: {$gte: 1} } },
                {
                    $group: {
                        _id: {
                            hour: { $hour: "$date" },
                            month: { $month: "$date" },
                            day: { $dayOfMonth: "$date" },
                            year: { $year: "$date" },
                            alarm: "$alarm"
                        },
                        value: { $avg: "$spo2" },
                        bpmValue: { $avg: "$bpm" },
                        piValue: { $avg: "$pi" },
                        min: { $min: "$spo2" },
                        max: { $max: "$spo2" }
                    },
                }]

            , function (err, docs) {
                if (err) console.trace(err)
                RenderData(docs, res);
            });
    }
};

function RenderData(docs, res) {

    //Sucess from Mongo.
    var results = [];
    var bpm = [];
    var pi = [];
    var alarms = [];
    var offset = (1000 * 60 * 60 * 8);
    var SkipOffset = 1000 * 60;
    if (docs.length > 0) {


        //For each Document Return Added it to either the SPO2 Graph resutls or the Alarm Results.
        docs.forEach(function (element) {
            var id = element._id;
            //Calcuate the date time from the group.
            var eventDate;

            if (id.minute == null) {
                id.minute = 0;
                id.second = 0;
                SkipOffset = 1000 * 60 * 60;
            }
            else if (id.second == null) {
                id.second = 0;
                SkipOffset = 1000 * 60;
            } else {
                SkipOffset = 1000;
            }


            eventDate = new Date(Date.UTC(id.year, id.month - 1, id.day, id.hour, id.minute, id.second, 0));

            if (element.value < 70)
                element.value = null;
            //Add to SPO2 results.
            results.push(
                {
                    //Get date and add the timezone offset so that it shows correct on the graph.
                    x: eventDate.getTime(),
                    y: element.value,
                    low: element.min,
                    high: element.max
                });
            bpm.push({
                x: eventDate.getTime(),
                y: element.bpmValue
            });
            pi.push({
                x: eventDate.getTime(),
                y: element.piValue
            });

            if (id.alarm != "0000") {
                //we have an alarm.

                var alarmTitle = "Alarm"
                //Check to see if the alarm is now silenced. Change Title to reflect.
                if (id.alarm == "0020") {
                    alarmTitle = "Alarm Silenced"
                }

                alarms.push(
                    {
                        x: eventDate.getTime(),
                        y: element.value,
                        o2: element.value,
                        bpm: element.bpmValue,
                        pi: element.piValue
                    });
            }

        }, this);

        //Sort the SPO2 Results.
        results = sortandnormalize(results, SkipOffset);
        //Sort the bpm Results.
        bpm = sortandnormalize(bpm, SkipOffset);
        //Sort the pi Results.
        pi = sortandnormalize(pi, SkipOffset)

       //Sort the Alarms Results(no normalization )
        alarms = alarms.sort(timesort);

        //Create json object to return.
        var graphData = { alarms: alarms, spo2: results, bpm: bpm, pi: pi };
        res.send(graphData);
    }
}

function timesort(a, b) {
    return a.x - b.x;
}
function namesort(a, b) {
    return a.name - b.name;
}

function sortandnormalize(list, SkipOffset) {
    list = list.sort(timesort);

    var lastDate = list[0].x;
    list.forEach(function (element) {

        while ((lastDate + SkipOffset) < element.x) {
            lastDate = lastDate + SkipOffset;
            list.push(
                {
                    x: lastDate,
                    y: null,
                    low: null,
                    high: null,
                });

        }
        list.push(element);
        lastDate = element.x
    }, this);

    list = list.sort(timesort);
    return list;
}
