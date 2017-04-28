function drawChartManually(data) {

console.log(data);

    var columns = data.columns;
    
    var dataG = new google.visualization.DataTable();

    array.forEach(function(element) {
        dataG.addColumn(element.type, element.title);
    }, columns);
    
        

    var chart_options = {
        title: data.title
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('myChart1'));
        chart.draw(dataG, chart_options);
}

function drawChart(data) {

console.log(data);

    var dataG = google.visualization.arrayToDataTable(data.dataArray);
    var chart_options = {
        title: data.title
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('myChart1'));
        chart.draw(dataG, chart_options);
}

function init() {
    // Load Charts and the corechart and barchart packages.
    google.charts.load('current', {'packages':['corechart']});

    // Draw the pie chart and bar chart when Charts is loaded.
    //google.charts.setOnLoadCallback(drawChart);
    
}

init();