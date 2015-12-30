$(document).ready(function () {

    $('#HRGRAPH').highcharts({
        chart: {
            type: 'spline',
            marginRight: 10,
            backgroundColor: '#303030',
            animation: Highcharts.svg, // don't animate in old IE

        },
        title: {
            text: 'Kaleo Heart Rate'
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150
        },
        yAxis: {
            title: {
                text: 'BPM'
            },
            max: 210,
            min: 70,
            lineWidth: 5,
            plotBands: [{ //Danger Low
                from: 0,
                to: 100,
                color: 'rgba(255, 0, 0, 0.1)',
                label: {
                    text: 'Danger Low',
                    style: {
                        color: '#606060'
                    }
                }
            }, { //Sleepy Baby
                    from: 100,
                    to: 130,
                    color: 'rgba(0, 0, 255, 0.1)',
                    label: {
                        text: 'Sleepy Baby',
                        style: {
                            color: '#606060'
                        }
                    }
                }, { // Angry Baby
                    from: 180,
                    to: 200,
                    color: 'rgba(255, 255, 0, 0.1)',
                    label: {
                        text: 'Angry Baby',
                        style: {
                            color: '#606060'
                        }
                    }
                }, { // Good Baby
                    from: 130,
                    to: 180,
                    color: 'rgba(0, 255, 0, 0.1)',
                    label: {
                        text: 'Good',
                        style: {
                            color: '#606060'
                        }
                    }
                }, { // High Alarm
                    from: 200,
                    to: 250,
                    color: 'rgba(255, 0, 0, 0.1)',
                    label: {
                        text: 'High Alarm',
                        style: {
                            color: '#606060'
                        }
                    }
                }]
        },

        series: [{
            name: 'BPM',
            data: (function () {
                // generate an array of random data
                var data = [],
                    time = (new Date()).getTime(),
                    i;

                for (i = -60; i <= 0; i += 1) {
                    data.push({
                        x: (time + i * 1000),
                        y: 0
                    });
                }
                return data;
            } ())
        }]
    });


    $('#SP02GRAPH').highcharts({
        chart: {
            type: 'spline',
            marginRight: 10,
            animation: Highcharts.svg, // don't animate in old IE

        },
        title: {
            text: 'Kaleo O2%'
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150
        },
        yAxis: {
            title: {
                text: 'SPO2'
            },
            min: 70,
            max: 100,
            plotBands: [{ // Danger Low
                from: 0,
                to: 84,
                color: 'rgba(255, 0, 0, 0.1)',
                label: {
                    text: 'Danger Low',
                    style: {
                        color: '#606060'
                    }
                }
            }, { // OK
                    from: 84,
                    to: 93,
                    color: 'rgba(255, 255, 0, 0.1)',
                    label: {
                        text: 'OK',
                        style: {
                            color: '#606060'
                        }
                    }
                }, { // Good
                    from: 93,
                    to: 100,
                    color: 'rgba(0, 255, 0, 0.1)',
                    label: {
                        text: 'Good',
                        style: {
                            color: '#606060'
                        }
                    }
                }]
        },

        series: [{
            name: 'SPO2',
            data: (function () {
                // generate an array of random data
                var data = [],
                    time = (new Date()).getTime(),
                    i;

                for (i = -60; i <= 0; i += 1) {
                    data.push({
                        x: (time + i * 1000),
                        y: 0
                    });
                }
                return data;
            } ())
        }]
    });
    
    $('#MAINGRAPH').highcharts({
        chart: {
            zoomType: 'xy',
            animation: Highcharts.svg, // don't animate in old IE
        },
        title: {
            text: 'Total Data'
        },
        subtitle: {
        },
        xAxis: [{
            type: 'datetime',
            tickPixelInterval: 150
        }],
        yAxis: [{ // Heart Rate
            labels: {
                format: '{value}',
                
            },
            title: {
                text: 'Heart Rate',
                
            },
            opposite: true

        }, { // SPO2
            gridLineWidth: 0,
            title: {
                text: 'SPO2',
                
            },
            labels: {
                format: '{value} %',
                
            }

        }],
        tooltip: {
            shared: true
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            x: 80,
            verticalAlign: 'top',
            y: 55,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        series: [{
            name: 'BPM',
            type: 'spline',
           data: (function () {
                // generate an array of random data
                var data = [],
                    time = (new Date()).getTime(),
                    i;

                for (i = -60; i <= 0; i += 1) {
                    data.push({
                        x: (time + i * 1000),
                        y: 0
                    });
                }
                return data;
            } ())

        }, {
            name: 'SPO2',
            type: 'spline',
            yAxis: 1,
            data: (function () {
                // generate an array of random data
                var data = [],
                    time = (new Date()).getTime(),
                    i;

                for (i = -60; i <= 0; i += 1) {
                    data.push({
                        x: (time + i * 1000),
                        y: 0
                    });
                }
                return data;
            } ()),
            marker: {
                enabled: false
            },
            dashStyle: 'shortdot',
            tooltip: {
                valueSuffix: ' %'
            }

        }]
    });
   


    var lastDate
    setInterval(function () {
        $.ajax({
            url: "/data",
        })
            .done(function (data) {
                var row = data[0];

                var chart = $('#HRGRAPH').highcharts()
                var charto2 = $('#SP02GRAPH').highcharts()
                var mainChart = $('#MAINGRAPH').highcharts()
                var bpmgauge = $('#BPMGAUGE').highcharts()
                
                var jsdate = (new Date()).getTime()
                if (lastDate != row.date) {
                    lastDate = row.date;
                    
                    if (row.bpm != -1){
                        $('#BPM').html(row.bpm)
                        chart.series[0].addPoint([jsdate, row.bpm], true, true);
                        mainChart.series[0].addPoint([jsdate, row.bpm], true, true);
                    }
                    else{
                        $('#BPM').html("---")
                    }
                        
                    if (row.spo2 != -1){
                        $('#SP02').html(row.spo2 + "%")
                        charto2.series[0].addPoint([jsdate, row.spo2], true, true)
                        mainChart.series[1].addPoint([jsdate, row.spo2], true, true)
                    }
                    else{
                        $('#SP02').html("--%")
                        
                    }
                    if (row.pi != -1){
                        $('#PI').html(row.pi + "%")
                      
                    
                    }else{
                        $('#PI').html("--%")
                    }
                    
                    if (row.alarm == "0000"){
                        $('#message').html("Normal")
                        $('#messagediv').removeClass('alert-danger alert-success alert-warning alert-info').addClass('alert-success')
                    }else if (row.alarm == "0012"){
                         $('#message').html("ALERT")
                        $('#messagediv').removeClass('alert-danger alert-success alert-warning alert-info').addClass('alert-danger')
                    }else if (row.alarm == "0020"){
                         $('#message').html("ALERT SILENCED")
                        $('#messagediv').removeClass('alert-danger alert-success alert-warning alert-info').addClass('alert-info')
                    }else{
                         $('#message').html(row.alarm)
                        $('#messagediv').removeClass('alert-danger alert-success alert-warning alert-info').addClass('alert-info')
                    }
                    
                } else {
                    $('#BPM').html("--")
                    $('#SP02').html("--%")
                    $('#PI').html("--%")
                    $('#message').html("No Connection")
                    $('#messagediv').removeClass('alert-danger alert-success alert-warning alert-info').addClass('alert-warning')

                }
                    chart.redraw()

            });
    }, 1000);


});