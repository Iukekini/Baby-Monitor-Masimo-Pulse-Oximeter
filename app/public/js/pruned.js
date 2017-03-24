dt_start = new Date(Date.UTC(2017, 2 - 1, 18,19, 0, 0, 0));  //20170218 19:00:00
ms_start=dt_start.getTime();
ms_end=ms_start+ 17*60*60*1000 ;



$(document).ready(function () {



    $.getJSON('/SPO2data?start=' + Math.round(ms_start) +
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
                adaptToUpdatedData: true
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

           //,  crosshair: false

            },

            legend: {
                enabled: true
            },
            plotOptions: {
                line: {
                    connectNulls: false
                },
                columnrange: {
                    pointPadding: -0.25,
                    dataGrouping: {
                        groupPixelWidth: 50
                    }
                  }
            },




            tooltip: {
                valueDecimals: 2
            },
            rangeSelector: {
                buttons: [
                    {
                        type: 'minute',
                        count: 1,
                        text: '1M'
                    },
                    {
                        type: 'minute',
                        count: 10,
                        text: '10M'
                    },
                    {
                        type: 'hour',
                        count: 1,
                        text: '1H'
                    },
                    {
                        type: 'all',
                        text: 'All'
                    }
                ],
                selected: 3,
                inputEnabled: true
            },

            series: [
                {
                    type: 'columnrange',
                    name: 'O2%',
                    data: data.spo2,
                    turboThreshold: 0,
                    pointPlacement: "between"
                },
                {
                    type: 'spline',
                    name: 'O2%',
                    id: 'spo2',
                    data: data.spo2,
                    turboThreshold: 0,
                    pointPlacement: "between"
                },
                {
                    type: 'scatter',
                    name: 'Alarm',
                    color: "rgba(178,34,34,0.5)",
                    fillColor: 'rgba(178,34,34,0.5)',
                    data: data.alarms,
                    onSeries: 'spo2',
                    turboThreshold: 0,
                    showInLegend: true
                    // tooltip: {
                    //     headerFormat: '<b>{series.name}</b><br>',
                    //     pointFormat: ('{point.y} O2%</br>{point.bpm} BPM</br>{point.pi} PI')
                    // },
                    // dataGrouping: {
                    //     forced: true,
                    //     smoothed: false
                    // }
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


function prev_day(){
  ms_start=ms_start-24*60*60*1000;
  ms_end=ms_end-24*60*60*1000;
  load_day();
  };
function next_day(){
  ms_start=ms_start+24*60*60*1000;
  ms_end=ms_end+24*60*60*1000;
  load_day();
  };

function load_day() {
  var chart = $('#MAINGRAPHPRUNED').highcharts();
    chart.showLoading('Loading data from server...');

    $.getJSON('/SPO2data?start=' + Math.round(ms_start) +
        '&end=' + Math.round(ms_end), function (data)  {
            chart.series[0].setData(data.spo2,false);
            chart.series[1].setData(data.spo2,false);
            chart.series[2].setData(data.alarms,false);
            chart.series[3].setData(data.bpm,false);
            chart.series[4].setData(data.pi,false);

            chart.redraw();


            chart.hideLoading();
            chart.rangeSelector.clickButton(3, true);

        });
}
