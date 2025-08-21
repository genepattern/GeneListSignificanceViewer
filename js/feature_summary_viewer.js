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
    for (var i = 0; data["Feature Name"].length > i; i++) {
        var sample = data["Feature Name"][i];
        var true_class = data["Description"][i];
        var predicted_class = data["Count"][i];
        

        var row = $("<tr>");

        row.append(
            $("<td></td>")
                .append(sample)
        );
        row.append(
            $("<td></td>")
                .append(true_class)
        );
        row.append(
            $("<td></td>")
                .append(predicted_class)
        );
     

        tbody.append(row);
    }

    
    table_div.show();
}




function addPlotData(data, Plotly) {
    $("#plot-div").empty();

    var layout = {
        xaxis: {
            title: "Feature Name",
            showgrid: true,
            showline: true
        },
        yaxis: {
            title: "Count",
            showgrid: true,
            showline: true
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

    // Create a simple bar chart
    var barChart = {
        x: data["Feature Name"],
        y: data["Count"],
        type: 'bar',
        text: data["Description"],
        hoverinfo: 'x+y+text'
    };

    // Plot the data
    var plot_data = [barChart];
    Plotly.newPlot('plot-div', plot_data, layout, config);
    
    document.getElementById('plot-div').on('plotly_click', function(data) {
        var featureName = data.points[0].x;
        highlightTableRow(featureName, Plotly); // Pass Plotly to the function
    });
    
    setTimeout(function() {
        var plotSVG = $("#plot-div").find(".main-svg:first");
        plotSVG.attr("height", 425);
        plotSVG.css("height", 425);
        plotSVG.parent().css("height", 400);
        addDownloadButton();
    }, 10);
}

function highlightTableRow(featureName, plotlyObj) {
    // Search for the feature in the table and toggle its selection
    var found = false;
    $("#table-div tbody tr").each(function() {
        var rowFeatureName = $(this).find("td:first").text().trim();
        if (rowFeatureName === featureName) {
            // Toggle the selected class
            $(this).toggleClass("selected");
            found = true;

            // If this row isn't visible (due to pagination), use search instead
            if (!$(this).is(":visible")) {
                var searchField = $("#table-div_filter input");
                searchField.val(featureName).trigger("keyup");
            }

            // Scroll to the row if needed
            $(this)[0].scrollIntoView({behavior: "smooth", block: "center"});
            return false; // Break the loop
        }
    });

    // Get all selected feature names
    var selectedFeatures = [];
    $("#table-div tbody tr.selected").each(function() {
        selectedFeatures.push($(this).find("td:first").text().trim());
    });
    
    // Update plot highlighting
    updatePlotHighlighting(selectedFeatures, plotlyObj);
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
    a.setAttribute('download', 'PredictionResults.png');
    a.setAttribute('href', imgURI);
    a.setAttribute('target', '_blank');

    a.dispatchEvent(evt);
}

// Function to add selection functionality to the table and update the chart
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

        // Get all selected feature names
        var selectedFeatures = [];
        $("#table-div tbody tr.selected").each(function() {
            selectedFeatures.push($(this).find("td:first").text().trim());
        });

        // Update plot highlighting - pass Plotly to the function
        updatePlotHighlighting(selectedFeatures, Plotly);
    });
}

// Update the plot to highlight selected bars
function updatePlotHighlighting(selectedFeatures, Plotly) {
    // Get the plot div
    var plotDiv = document.getElementById('plot-div');

    // Exit if there's no plot
    if (!plotDiv || !plotDiv._fullData || plotDiv._fullData.length === 0) return;

    // Access the plot data correctly
    var plotData = plotDiv._fullData[0];
    var xValues = plotData.x;

    // Create new colors array
    var colors = [];
    for (var i = 0; i < xValues.length; i++) {
        if (selectedFeatures.includes(xValues[i])) {
            colors.push('rgba(255, 165, 0, 0.8)'); // Highlighted color (orange)
        } else {
            colors.push('rgba(31, 119, 180, 0.7)'); // Default color
        }
    }

    // Update the marker colors
    Plotly.restyle('plot-div', {'marker.color': [colors]});
}

function processData(data) {
   
    var feature_objects = [];
    for (var i = 0; data["Feature Name"].length > i; i++) {
        feature_objects.push({
            "Feature Name": data["Feature Name"][i],
            "Count": data["Count"][i],
            "Description": data["Description"][i]
        });
    }

    // Sort objects by modified confidence
    feature_objects.sort(function(a, b) {
        if (a.Count < b.Count) return 1;
        if (a.Count > b.Count) return -1;
        // If counts are equal, sort by Feature Name
        return a["Feature Name"].localeCompare(b["Feature Name"]);
    });

    // Create new arrays and assign back to data
    var features = [];
    var descriptions = [];
    var counts =[];
  
    for (var i = 0; feature_objects.length > i; i++) {
        var obj = feature_objects[i];
        features.push(obj["Feature Name"]);
        descriptions.push(obj["Description"]);
        counts.push(obj["Count"]);
    }
    data["Feature Name"] = features;
    data["Description"] = descriptions;
    data["Count"] = counts;
    
    

    return data;
}

requirejs(["jquery", "plotly", "gp_util", "gp_lib", "DataTables/datatables.min", "jquery-ui", "js.cookie"],
    function($, Plotly, gpUtil, gpLib, datatables) {

    var requestParams = gpUtil.parseQueryString();

    // Verify necessary input
    if (requestParams["feature.filename"] === undefined) {
        // Show error message
        $("#error-message")
            .append("Required input <i>feature.filename</i> not defined.")
            .dialog();
        return;
    }

    var url = requestParams["feature.filename"][0];

    // Load the prediction results ODF
    loadOdfFile({
        url: url,
        gpLib: gpLib,
        success: function(raw_data) {
            // Parse the data
            var data = gpLib.parseODF(raw_data, "Prediction Features");

            // Process the data
            data = processData(data);

            // Hide the loading screen
            $("#loading").hide();

            // Assemble the plot
            addPlotData(data, Plotly, 0);

           
            // Assemble the table
            addTableData(data, 0);
            $("#table-div table").DataTable({
                "pageLength": 50,
                "order": [
                    [2, "desc"], // Primary sort: Count column in descending order
                    [0, "asc"]   // Secondary sort: Feature Name column in ascending order
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