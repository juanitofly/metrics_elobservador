
downLoadFile = function (uri, fileName) {
    var link = document.createElement('a');        
    link.href = uri;
    link.download = fileName;
    document.body.appendChild(link);            
    link.click();
    document.body.removeChild(link);
}

clean = function () {
    $("#raw").html(""); 
    $("#rawInfo").html("");
    $("#loadingImg").hide();
    $("#myChart1").html("");
    
}

getDataFromServerByAjax = function(event) {
    event.preventDefault();

    clean();
    $("#loadingImg").show();

    $.ajax({
        method: "GET",
        url: $(this).data("url"),
        data: { 
            start_date: $("#start_date").val(), 
            end_date: $("#end_date").val(),
            csv: $("#csv")[0].checked,
        }
    })
    .done(function(data, status, xhr){ 
        
        if (status == 200 || status == "success") {

            $("#loadingImg").hide();

            if (xhr.getResponseHeader("content-type").indexOf("text/csv") >= 0) {
                var uri = 'data:application/csv;charset=UTF-8,' + encodeURIComponent(data);
                downLoadFile(uri, "result.csv");
                $("#rawInfo").html(JSON.stringify(
                    {
                        length: data.length
                    }
                )); 
            } else if (data.chart == true) {
                
                drawChart(data);

            } else {
                $("#loadingImg").hide();
                $("#raw").html("");
                $("#raw").html(JSON.stringify(data, 2, 4)); 
                $("#rawInfo").html(JSON.stringify(
                    {
                        length: data.length
                    }
                ));
            } 
        }
    });
};

init = function() {
    $("#leftColumn button").click(getDataFromServerByAjax);
    $(".dropdown-menu button").click(getDataFromServerByAjax);
    $(".dropdown-toggle").dropdown();
    $("#start_date").datetimepicker({
           format: 'YYYY-MM-DD'
        }
    );
    $("#end_date").datetimepicker({
           format: 'YYYY-MM-DD'
        }
    );


    $("#myChart1").onresize = function(){
        console.log("resizing");
    };
}


/*
* Initializing
*/
init();