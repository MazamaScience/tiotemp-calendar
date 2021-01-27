var timeseriesCalendar = function() {

    
}

// var height = 800;
// var width = 800;

// let cellMargin = 2,
//     cellSize = width / (29 + 2 * cellMargin); // 29 days per row and padding

// function prepData(X) {

//     // Remap the colors
//     const colorMap = function (value) {
//         if (value === null) {
//             return "#F4F4F4";
//         } else {
//             return d3.scaleThreshold()
//                 .domain(X.breaks)
//                 .range(X.colors)(value);
//         }
//     };

//     // Remap the values
//     const valueMap = function (value) {
//         if (value === 0) {
//             return undefined;
//         } else {
//             return value;
//         }
//     };

//     // Load the data
//     const meta = HTMLWidgets.dataframeToD3(X.meta);
//     const data = HTMLWidgets.dataframeToD3(X.data);

//     let dateDomain = data.map(d => {
//         return d.datetime;
//     });
//     let sd = new Date(dateDomain.slice(1)[0]),
//         ed = new Date(dateDomain.slice(-1)[0]);

//     // Index IDs using passed in index str
//     const indexIds = meta.map(d => {
//         return d[X.index];
//     });

//     const dailyData = indexIds.map(id => {
//         return {
//             id: id,
//             label: meta.filter(d => {
//                 return d[X.index] == id;
//             })[0][X.label],
//             data: data.map(d => {
//                 return {
//                     date: d3.timeFormat("%Y-%m-%d")(d3.timeParse("%Y-%m-%dT%H:%M:%SZ")(d.datetime)),
//                     value: valueMap(+d[id]),
//                     color: colorMap(+d[id])
//                 };
//             }),
//             domain: {
//                 sd,
//                 ed
//             }
//         };
//     });
//     return dailyData;

// }

// if (width < 0) width = 0;
// if (height < 0) height = 0;

// // Create root canvas grid element
// let canvas = d3.select(el)
//     .append("div")
//     .attr("class", "grid-container")
//     .style("display", "grid")
//     .style("grid-template-columns", "auto auto auto auto")
//     .style("grid-template-rows", "auto auto auto")
//     .style("padding", "5px")
//     .selectAll("svg")
//     .attr("width", width)
//     .attr("height", height)
//     .attr("style", "background-color:white")
//     .classed("svg-content", true);

// // Create tooltip content div
// let tooltip = d3.select(".tooltip-calendar");
// if (tooltip.empty()) {
//     tooltip = d3.select("body")
//         .append("div")
//         .style("visibility", "hidden")
//         .attr("class", "tooltip-calendar")
//         .style("background-color", "#282b30")
//         .style("border", "solid")
//         .style("border-color", "#282b30")
//         .style("border-width", "2px")
//         .style("border-radius", "5px")
//         .style("width", width / 12)
//         .style("color", "#F4F4F4")
//         .style("position", "absolute");
// }