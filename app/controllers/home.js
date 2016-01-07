var RadEvent = require('../models/RADEvent');

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
 * GET /data
 * Get the last record inserted into the Mongo db and returns it to the user. 
 */
exports.data = function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var events = RadEvent.find({})
        .sort({ date: -1 })
        .limit(1)
    events.exec(function (e, docs) {
        res.send(docs);
    });
};



/**
 * GET /historicalSPO2Data
 * Historical SPO2 Graph Data
 */
exports.historicalSPO2Data = function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    
    //Group Events by Year/Month/Day/Minute/Alarm
    //Get the Average of the SPO2 for the group.
    RadEvent
        .aggregate(
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
                },
            }

            , function (err, docs) {
            
                //Sucess from Mongo. 
                var results = [];
                var alarms = [];
                
                //For each Document Return Added it to either the SPO2 Graph resutls or the Alarm Results. 
                docs.forEach(function (element) {
                    var id = element._id;
                    //Calcuate the date time from the group. 
                    var eventDate = new Date(id.month + "/" + id.day + "/" + id.year + " " + id.hour + ":" + id.minute + ".00")
                    
                    var minDate = new Date('12/18/2015');
                    if (minDate <= eventDate)
                    {
                        
                    
                        var value = element.value;
                        if (value < 70)
                            value = null;
                        //Add to SPO2 results. 
                        results.push(
                            {
                                //Get date and add the timezone offset so that it shows correct on the graph. 
                                x: eventDate.getTime() + eventDate.getTimezoneOffset(),
                                y: value
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
                                        x: eventDate.getTime() + eventDate.getTimezoneOffset(),
                                        y: element.value                                });
                        }
                    }
                }, this);
                
                //Sort the SPO2 Results. 
                results = results.sort(function (a, b) {
                    return a.x - b.x;
                })

                var addResults = [];
                var lastDate = results[0].x;
                results.forEach(function(element) {
                    
                    while(lastDate < element.x){
                        lastDate = lastDate + (180*1000);
                        addResults.push(
                            {
                                x: lastDate, 
                                y: null
                            });
                    }
                    addResults.push(element);
                    lastDate = element.x
                }, this);

                //Create json object to return. 
                var graphData = { alarms: alarms, spo2: addResults };
                res.send(graphData);
            })

};