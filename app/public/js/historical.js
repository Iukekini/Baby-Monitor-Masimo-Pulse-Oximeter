$(document).ready(function () {
  
    $(function () {
        $.getJSON('/historicalspo2data', function (data) {

            $('#MAINGRAPH').highcharts('StockChart',{
                
                title: {
                    text: 'Historical Oxygen Levels'
                },
                subtitle: {
                    text: document.ontouchstart === undefined ?
                        'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
                },
                xAxis: {
                    type: 'datetime'
                },
                yAxis: {
                    title: {
                        text: 'SPO2 %'
                    },
                    floor: 70
                },
                legend: {
                    enabled: false
                },
    plotOptions: {
        line: {
            connectNulls: false
        }
    },
            rangeSelector : {
                buttons : [{
                    type : 'hour',
                    count : 1,
                    text : '1H'
                },{
                    type : 'hour',
                    count : 6,
                    text : '6H'
                },{
                    type : 'hour',
                    count : 12,
                    text : '12H'
                }, {
                    type : 'day',
                    count : 1,
                    text : '1D'
                },],
                selected : 1,
                inputEnabled : true
            },

                series: [{
                    type: 'columnrange',
                    name: 'O2%',
                    data: data.spo2,
                    connectNulls: false,
                    turboThreshold: 0
                },{
                    type: 'spline',
                    name: 'O2%',
                    id: 'spo2',
                    data: data.spo2,
                    turboThreshold: 0
                },
                {
                    type: 'scatter',
                    name: 'Alarm',
                    color: "rgba(178,34,34,0.5)",
                    fillColor: 'rgba(178,34,34,0.5)',
                    data: data.alarms,
                    onSeries: 'spo2',
                    showInLegend: false,
                    tooltip: {
                        headerFormat: '<b>{series.name}</b><br>',
                        pointFormat: ('{point.y} O2%')
                    }
                }]
            });
        });
    });
});
