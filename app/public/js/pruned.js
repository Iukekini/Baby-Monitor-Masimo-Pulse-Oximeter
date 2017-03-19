

$(document).ready(function () {

 dt_start = new Date(Date.UTC(2017, 2 - 1, 19, 0, 0, 0, 0));  //20170219
 ms_start=dt_start.getTime();
 ms_end=ms_start+ 1*60*60*1000 ;





    $.getJSON('/historicalspo2data?start=' + Math.round(ms_start) +
        '&end=' + Math.round(ms_end), function (data) {

        $('#MAINGRAPHPRUNED').highcharts('StockChart', {

            chart: {
                zoomType: 'x'
            },
            loading: {
                style: {
                    backgroundColor: 'silver'
                },
                labelStyle: {
                    color: 'black'
                }
            },
            navigator: {
                adaptToUpdatedData: false,
                series: {
                    data: data.spo2
                }
            },
            scrollbar: {
                liveRedraw: false
            },
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

            legend: {
                enabled: true
            },
            plotOptions: {
                line: {
                    connectNulls: false
                }
            },
            rangeSelector: {
                buttons: [
                    {
                        type: 'hour',
                        count: 6,
                        text: '6H'
                    },
                    {
                        type: 'hour',
                        count: 12,
                        text: '12H'
                    },
                    {
                        type: 'day',
                        count: 1,
                        text: '1D'
                    },
                    {
                        type: 'all',
                        text: 'All'
                    }
                ],
                selected: 1,
                inputEnabled: true
            },

            series: [
                {
                    type: 'columnrange',
                    name: 'O2%',
                    data: data.spo2,
                    turboThreshold: 0
                },
                {
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
                    turboThreshold: 0,
                    showInLegend: false,
                    tooltip: {
                        headerFormat: '<b>{series.name}</b><br>',
                        pointFormat: ('{point.y} O2%</br>{point.bpm} BPM</br>{point.pi} PI')
                    }
                },
                {
                    type: 'spline',
                    name: 'BPM',
                    id: 'bpm',
                    data: data.bpm,
                    turboThreshold: 0,
                    visible: false
                },
                {
                    type: 'spline',
                    name: 'PI',
                    id: 'pi',
                    data: data.pi,
                    turboThreshold: 0,
                    visible: false
                }]
        });


    });
});
