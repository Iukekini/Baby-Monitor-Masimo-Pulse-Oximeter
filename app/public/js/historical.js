$(document).ready(function () {
  
    $(function () {
        $.getJSON('/historicalspo2data', function (data) {

            $('#MAINGRAPH').highcharts('StockChart',{
                
                title: {
                    text: 'Kaleo O2 Levels'
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
                    }
                },
                legend: {
                    enabled: false
                },
            rangeSelector : {
                buttons : [{
                    type : 'hour',
                    count : 1,
                    text : '1h'
                }, {
                    type : 'day',
                    count : 1,
                    text : '1D'
                }, , {
                    type : 'week',
                    count : 1,
                    text : '1W'
                }, {
                    type : 'all',
                    count : 1,
                    text : 'All'
                }],
                selected : 1,
                inputEnabled : false
            },

                series: [{
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
