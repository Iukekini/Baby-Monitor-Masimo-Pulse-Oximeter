/**
     * Load new data depending on the selected min and max
     */
function afterSetExtremes() {

    var chart = $('#MAINGRAPH').highcharts();
    var piechart = $('#PIECHART').highcharts();
    var e = chart.xAxis[0].getExtremes();
    chart.showLoading('Loading data from server...');
//    $('#progressmodel').modal('show');
    $.getJSON('/historicalspo2data?start=' + Math.round(e.min) +
        '&end=' + Math.round(e.max), function (data) {

            chart.series[0].setData(data.spo2);
            chart.series[1].setData(data.spo2);
            chart.series[2].setData(data.alarms);
            chart.series[3].setData(data.bpm);
            chart.series[4].setData(data.pi);
            chart.hideLoading();
//            $('#progressmodel').modal('hide');
        });

         $.getJSON('/SPO2Count?start=' + Math.round(e.min) +
        '&end=' + Math.round(e.max), function (data) {
                piechart.series[0].setData(data);
        });

}


$(document).ready(function () {
    $('#progressmodel').modal('toggle');



    $('#PIECHART').highcharts({
        chart: {
            plotBorderWidth: 0,
            plotShadow: true
        },
        title: {
            text: 'O2 Levels<br> by Percent of time at each level',
            align: 'center',
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {

                startAngle: -90,
                endAngle: 90,
                center: ['50%', '75%']
            }
        },
        series: [{
            type: 'pie',
            name: 'O2',

        }]
    });



    $.getJSON('/historicalspo2data', function (data) {

        $('#MAINGRAPH').highcharts('StockChart', {

            chart: {
                zoomType: 'x'
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
                type: 'datetime',
                events: {
                    afterSetExtremes: afterSetExtremes
                }
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
    $('#progressmodel').modal('show');
        afterSetExtremes();
    $('#progressmodel').modal('hide');

    });
});
