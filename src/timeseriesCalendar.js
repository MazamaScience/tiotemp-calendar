var d3 = typeof require === "function" ? require("d3") : window.d3;

var timeseriesCalendar = function () {

    "use strict";

    var self = this;

    // this.options = {
    //     start: new Date(), 
    //     minDate: null, 
    //     maxDate: null, 
    //     data: ""
    // }; 

    // Define h and w 
    var height = 800;
    var width = 800;

    // Padding between each cell
    const cellMargin = 2;
    // 29 days per row + padding
    const cellSize = width / (29 + 2 * cellMargin);

    // Define calendar canvas
    var canvas = d3.select('#timeseriesCalendar')
        .append("div")
        .attr("class", "grid-container")
        .style("display", "grid")
        .style("grid-template-columns", "auto auto auto auto")
        .style("grid-template-rows", "auto auto auto")
        .style("padding", "5px")
        .selectAll("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("style", "background-color:white")
        .classed("svg-content", true);
    
    // Create tooltip content div
    var tooltip = d3.select(".tooltip-calendar");
    if (tooltip.empty()) {
      tooltip = d3.select("body")
        .append("div")
        .style("visibility", "hidden")
        .attr("class", "tooltip-calendar")
        .style("background-color", "#282b30")
        .style("border", "solid")
        .style("border-color", "#282b30")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("width", width / 12)
        .style("color", "#F4F4F4")
        .style("position", "absolute");
    }

    // parse the data
    var parseData = function (data) {
        return {
            date: d3.csv(data, d => { return d.datetime; })
        }
        // var dateDomain = d.map(d => { return d.datetime });
    };

    // For testing 
    var d = parseData('test_data.csv');
    console.log(d);
    



};

timeseriesCalendar.prototype = {
    init: function () {
        console.log('Inited')
    }
};
