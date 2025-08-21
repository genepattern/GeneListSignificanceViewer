function loadOdfFile(pObj) {
    var odfURL = pObj['url'];
    var successCallback = pObj['success'];
    var errorCallback = pObj['error'];
    var gpLib = pObj['gpLib'];
    var headers = {};

    

    gpLib.rangeRequestsAllowed(odfURL, {
        successCallBack: function(acceptRanges) {
            if(acceptRanges) {
                gpLib.getDataAtUrl(odfURL, {
                    headers: headers,
                    successCallBack: successCallback,
                    failCallBack: errorCallback
                });
            }
            else {
                gpLib.getDataAtUrl(odfURL, {
                    headers: headers,
                    successCallBack: successCallback,
                    failCallBack: errorCallback
                });
            }
        },
        failCallBack: function() {
            gpLib.getDataAtUrl(odfURL, {
                headers: headers,
                successCallBack: successCallback,
                failCallBack: errorCallback
            });
        }
    });
}


function addTableData(data, callThreshold) {
    var table_div = $("#table-div");
    var tbody = table_div.find("tbody");

    // Loop
    for (var i = 0; data["Feature"].length > i; i++) {
        var rank = data["Row"][i];
        var feature = data["Feature"][i];
        var description = data["Description"][i];
        var score = data["Score"][i];
        

        var row = $("<tr>");

        row.append(
            $("<td></td>")
                .append(rank)
        );
        row.append(
            $("<td></td>")
                .append(feature)
        );
        row.append(
            $("<td></td>")
                .append(description)
        );
        row.append(
            $("<td></td>")
                .append(score)
        );
     

        tbody.append(row);
    }

    
    table_div.show();
}




function addPlotData(data, Plotly) {
    $("#plot-div").empty();

    var layout = {
        xaxis: {
            title: "Score",
            showgrid: true,
            showline: true,
            zeroline: false
        },
        yaxis: {
            title: "Gene Rank",
            showgrid: true,
            showline: true,
            zeroline: false
        },
        margin: {
            l: 70,
            r: 10,
            b: 100,
            t: 10
        },
        height: 350,
        hovermode: 'closest',
        autosize: true,
        margin: {l: 50, r: 30, b: 150, t: 30, pad: 4},
        height: 500
    };

    var config = {
        responsive: true,
        displayModeBar: false,
        modeBarButtonsToRemove: ['sendDataToCloud', 'zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'autoScale2d', 'resetScale2d'],
        displaylogo: false,
        showTips: true
    };

    var hoverText = [];
    for (var i = 0; i < data["Feature"].length; i++) {
        hoverText.push(data["Feature"][i] + "<br>" + data["Description"][i]);
    }
    
    // Create a simple bar chart
    var barChart = {
        x: data["Score"],
        y: data["Row"],
        type: 'scatter',
        mode: 'markers',
        marker: {
            size: 10,
            color: 'rgba(255, 0, 0, 0.7)'
        },
        text: hoverText ,
        hoverinfo: 'x+y+text'
    };

    // Plot the data
    var plot_data = [barChart];
    Plotly.newPlot('plot-div', plot_data, layout, config);
    
    
    setTimeout(function() {
        var plotSVG = $("#plot-div").find(".main-svg:first");
        plotSVG.attr("height", 425);
        plotSVG.css("height", 425);
        plotSVG.parent().css("height", 400);
        addDownloadButton();
    }, 10);
}

function displaySummary(data) {
    // Find the middle div
    const middleDiv = document.getElementById('middle-div');

    // Clear any existing content
    middleDiv.innerHTML = '';

    // Create table element
    const summaryTable = document.createElement('table');
    summaryTable.style.width = '80%';
    summaryTable.style.margin = '0 auto'; // Center the table
    summaryTable.style.borderCollapse = 'collapse';
    summaryTable.style.border = '1px solid #ddd';

    // Create header row with title spanning 2 columns
    const headerRow = document.createElement('tr');
    const headerCell = document.createElement('th');
    headerCell.textContent = 'Summary';
    headerCell.colSpan = 2;
    headerCell.style.textAlign = 'center';
    headerCell.style.border = '1px solid #ddd';
    headerCell.style.padding = '8px';
    headerRow.appendChild(headerCell);
    summaryTable.appendChild(headerRow);

    // Add row for Select Method and Gene Name
    const row1 = document.createElement('tr');
    
    const cell1 = document.createElement('td');
    cell1.innerHTML = 'Select Method:  ' + data.MarkerSelectionMethod;
    cell1.style.border = '1px solid #ddd';
    cell1.style.padding = '8px';
    
    const cell2 = document.createElement('td');
    cell2.innerHTML = 'Gene Name:  ' + data.GeneName;
    cell2.style.border = '1px solid #ddd';
    cell2.style.padding = '8px';
    
    row1.appendChild(cell1);
    row1.appendChild(cell2);
    summaryTable.appendChild(row1);

    // Add row for Distance Function and Num Neighbors
    const row2 = document.createElement('tr');
    
    const cell3 = document.createElement('td');
    cell3.innerHTML = 'Distance Function:  ' + data.DistanceFunction;
    cell3.style.border = '1px solid #ddd';
    cell3.style.padding = '8px';
    
    const cell4 = document.createElement('td');
    cell4.innerHTML = 'Num Neighbors:  ' + data.NumNeighbors;
    cell4.style.border = '1px solid #ddd';
    cell4.style.padding = '8px';
    
    row2.appendChild(cell3);
    row2.appendChild(cell4);
    summaryTable.appendChild(row2);

    // Add the table to the middle div
    middleDiv.appendChild(summaryTable);
}

function addDownloadButton() {
    var plotDiv = $("#plot-div");

    // Add the button
    var downloadButton = $('<button><i class="fa fa-download" aria-hidden="true"></i> PNG</button>')
        .css("position", "absolute")
        .css("right", 10)
        .css("z-index", 64000)
        .click(function() {
            var svg = $("#plot-div").find(".main-svg:first")[0];
            var canvas = document.getElementById('download-canvas');
            var ctx = canvas.getContext('2d');
            var data = (new XMLSerializer()).serializeToString(svg);
            var DOMURL = window.URL || window.webkitURL || window;

            var img = new Image();
            var svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
            var url = DOMURL.createObjectURL(svgBlob);

            canvas.width = 1300;
            canvas.height = 475;

            img.onload = function () {
                ctx.drawImage(img, 0, 0);
                DOMURL.revokeObjectURL(url);

                var imgURI = canvas
                    .toDataURL('image/png')
                    .replace('image/png', 'image/octet-stream');

                triggerDownload(imgURI);
            };

            img.src = url;
        });
    plotDiv.prepend(downloadButton);

    // Add the canvas
    var downloadCanvas = $('<canvas></canvas>')
        .attr("id", "download-canvas")
        .css("width", $(document).width() - 150)
        .css("height", 550)
        .hide();
    plotDiv.append(downloadCanvas);
}

function triggerDownload (imgURI) {
    var evt = new MouseEvent('click', {
        view: window,
        bubbles: false,
        cancelable: true
    });

    var a = document.createElement('a');
    a.setAttribute('download', 'GeneListSignificanceResults.png');
    a.setAttribute('href', imgURI);
    a.setAttribute('target', '_blank');

    a.dispatchEvent(evt);
}


// Update the selection functionality to store row numbers correctly
function addSelectionFunctionality(Plotly) {
    // Add CSS for selected rows
    $("<style>")
        .prop("type", "text/css")
        .html("#table-div tbody tr.selected { background-color: rgba(255, 165, 0, 0.3) !important; }")
        .appendTo("head");

    // Add click handler to table rows
    $("#table-div tbody").on("click", "tr", function() {
        // Toggle selected class
        $(this).toggleClass("selected");

        // Get all selected row numbers (ranks)
        var selectedRows = [];
        $("#table-div tbody tr.selected").each(function() {
            selectedRows.push(parseInt($(this).find("td:first").text().trim()));
        });

        // Update plot highlighting
        updatePlotHighlighting(selectedRows, Plotly);
    });
}

// Fix the plot highlighting function to correctly match row numbers
function updatePlotHighlighting(selectedRows, Plotly) {
    // Get the plot div
    var plotDiv = document.getElementById('plot-div');

    // Exit if there's no plot
    if (!plotDiv || !plotDiv._fullData || plotDiv._fullData.length === 0) return;

    // Access the plot data correctly
    var plotData = plotDiv._fullData[0];
    var yValues = plotData.y; // These are the row numbers (ranks)

    // Create horizontal line shapes for selected rows
    var shapes = [];
    for (var i = 0; i < yValues.length; i++) {
        if (selectedRows.includes(yValues[i])) {
            shapes.push({
                type: 'line',
                x0: 0,
                x1: 1,
                xref: 'paper',
                y0: yValues[i],
                y1: yValues[i],
                line: {
                    color: 'yellow',
                    width: 4,
                    opacity: 0.9
                }
            });
        }
    }

    // Update the plot layout with new shapes
    Plotly.relayout('plot-div', {shapes: shapes});
}

function processData(data) {
   var descField = "Description";
    if (!data["Description"] && data["Desc"]) {
        descField = "Desc";
    }
    
    var feature_objects = [];
    for (var i = 0; data["Feature"].length > i; i++) {
        feature_objects.push({
            "Row": i,
            "Feature": data["Feature"][i],
            "Score": data["Score"][i],
             "Description": data[descField] ? data[descField][i] : ""
        });
    }

    // Sort objects by row
    feature_objects.sort(function(a, b) {
        if (a.Row > b.Row) return 1;
        if (a.Row < b.Row) return -1;
        // If counts are equal, sort by Feature Name
        return 0;
    });

    // Create new arrays and assign back to data
    var features = [];
    var descriptions = [];
    var scores =[];
    var rows =[];
  
    for (var i = 0; feature_objects.length > i; i++) {
        var obj = feature_objects[i];
        features.push(obj["Feature"]);
        descriptions.push(obj["Description"]);
        scores.push(obj["Score"]);
        rows.push(i)
    }
    data["Feature"] = features;
    data["Description"] = descriptions;
    data["Score"] = scores;
    data["Row"] = rows;
    
    return data;
}

requirejs(["jquery", "plotly", "gp_util", "gp_lib", "DataTables/datatables.min", "jquery-ui", "js.cookie"],
    function($, Plotly, gpUtil, gpLib, datatables) {

    var requestParams = gpUtil.parseQueryString();

    // Verify necessary input
    if (requestParams["inputfilename"] === undefined) {
        // Show error message
        $("#error-message")
            .append("Required input <i>inputfilename</i> not defined.")
            .dialog();
        return;
    }

    var url = requestParams["inputfilename"][0];

    // Load the prediction results ODF
    loadOdfFile({
        url: url,
        gpLib: gpLib,
        success: function(raw_data) {
            // Parse the data
            var data = gpLib.parseODF(raw_data, "Gene List");

            // Process the data
            data = processData(data);

            // Hide the loading screen
            $("#loading").hide();

            // Assemble the plot
            addPlotData(data, Plotly, 0);
            displaySummary(data) 
           
            // Assemble the table
            addTableData(data, 0);
            $("#table-div table").DataTable({
                "pageLength": 50,
                "order": [
                   
                    [0, "asc"]   // sort by the first column (Row) in ascending order
                ]
            });
            addSelectionFunctionality(Plotly);
        },
        error: function(message) {
            $("#loading").hide();
            $("#error-message")
                .append("Failed to load data: " + message)
                .dialog();
        }
    });
});