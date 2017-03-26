var RadEvent = require('../models/RADEvent');
var Device = require('../models/pushNotificationDevice');
var settings = require('../config/settings');
var apn = require('apn')



/**
 * GET /SPO2Data
 * Historical SPO2 Graph Data
 */
exports.SPO2Data = function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    //Group Events by Year/Month/Day/Minute/Alarm
    //Get the Average of the SPO2 for the group.

        var startMS = parseFloat(req.query.start);
        var endMS = parseFloat(req.query.end);
        var start = new Date(startMS);
        var end = new Date(endMS);
        var duration = endMS - startMS;


        var events = RadEvent.find({
              spo2: { $ne: -1 },
           //   pi: {$gte: 1},
              date: {
                  $gte: start,
                  $lte: end
                    }
                },
               {
                date : 1,
                spo2:  1,
                bpm:   1,
                pi:    1,
                alarm: 1
              }
              )
              .sort({ date: 1 })
        events.exec(function (err, docs) {
               if (err) console.trace(err)
               else RenderData(docs, res);
                });


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

            if (element.spo2 < 70)
                element.spo2 = null;
            //Add to SPO2 results.
            results.push(
                {
                    //Get date and add the timezone offset so that it shows correct on the graph.
                    x: element.date.getTime(),
                    y: element.spo2,
                    low: element.spo2,
                    high: element.spo2
                });
            bpm.push({
                x: element.date.getTime(),
                y: element.bpm
            });
            pi.push({
                x:  element.date.getTime(),
                y: element.pi
            });

            if (element.spo2 <=88) {
                //we have an alarm.

                var alarmTitle = "Alarm"
                //Check to see if the alarm is now silenced. Change Title to reflect.
                if (id.alarm == "0020") {
                    alarmTitle = "Alarm Silenced"
                }

                alarms.push(
                    {
                        x:  element.date.getTime(),
                        y: element.spo2,
                        o2: element.spo2,
                        bpm: element.bpm,
                        pi: element.pi
                    });
            }

        }, this);

        //Sort the SPO2 Results.
  //      results = sortandnormalize(results, SkipOffset);
        //Sort the bpm Results.
//        bpm = sortandnormalize(bpm, SkipOffset);
        //Sort the pi Results.
    //    pi = sortandnormalize(pi, SkipOffset)

       //Sort the Alarms Results(no normalization )
  //      alarms = alarms.sort(timesort);

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
