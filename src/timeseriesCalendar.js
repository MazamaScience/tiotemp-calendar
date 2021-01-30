// const d3 = typeof require === "function" ? require("d3") : window.d3;
// const papa = require("papaparse");

var timeseriesCalendar = function () {

    "use strict";

    let el = "#timeseriesCalendar";

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
    var canvas = d3.select(el)
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

    var parseData = function (obj) {

        let data = obj.data.map(d => {
            return {
                date: d[0].split("T")[0],
                val: d[1]
            };
        });

        // Reduce the data object to its date group, the val sum of the date group, and average of date group
        let reduced = data.reduce((m, d) => {
            if (!m[d.date]) {
                m[d.date] = {
                    date: new Date(d.date),
                    mean: 0,
                    color: "",
                    sum: 0,
                    count: 1
                };
                return m;
            }
            m[d.date].sum += Number(d.val);
            m[d.date].count += 1;
            m[d.date].mean = m[d.date].sum / m[d.date].count;
            m[d.date].color = colorMap(m[d.date].mean);
            return m;
        });

        return Object.values(reduced).slice(2, -1);

    }


    var breaks = [0.01, 8, 20, 35, 55, 100];
    var colors = ["#ededed", "#abe3f4", "#118cba", "#286096", "#8659a5", "#6a367a"];

    // Remap the colors
    const colorMap = function (value) {
        if (value === null) {
            return "#F4F4F4";
        } else {
            return d3.scaleThreshold()
                .domain(breaks)
                .range(colors)(value);
        }
    };

    // For testing 
    var data_arr = Papa.parse("http://localhost:3000/test_data.csv", {
        download: true,
        complete: result => {

            let data = parseData(result)
            let dates = data.map(d => {
                return d.date
            })

            // Create svg for each month of data
            let months = d3.timeMonth.range(dates[0], dates[dates.length - 1]);

            let elem = document.querySelector("div" + el);
            let view = elem.getBoundingClientRect();

            let svg = canvas
                .data(months)
                .enter()
                .append("svg")
                .attr("class", "month-cell")
                .attr("width", view.width / 4) //(cellSize * 7) + (cellMargin * 8) + cellSize)
                .attr("height", () => {
                    let rows = 8;
                    return (cellSize * rows) + (cellMargin * (rows + 1));
                });

            // Add the title of each svg month
            svg
                .append("text")
                .attr("class", "month-label")
                .attr("x", ((cellSize * 7) + cellMargin * 8) / 2)
                .attr("y", "1em")
                .attr("text-anchor", "middle")
                .attr("font-family", "sans-serif")
                .attr("font-size", cellSize * 0.5)
                .text(d => {
                    console.log(d)
                    return d3.timeFormat("%B")(d);
                });

            // Add the g layer to each day to append rect and text to
            svg
                .selectAll("g.day")
                .data((d, i) => {
                    return d3.timeDays(d, new Date(d.getFullYear(), d.getMonth() + 1, 1));
                })
                .enter()
                .append("g")
                .attr("class", "day");

            // Add the default color fill
            svg
                .selectAll("g.day")
                .append("rect")
                .attr("class", "day-fill")
                .attr("width", cellSize)
                .attr("height", cellSize)
                .attr("rx", 3).attr("ry", 3) // round corners
                .attr("fill", "#F4F4F4") // Default colors
                .style("opacity", 0.95)
                .attr("x", d => {
                    let n = d3.timeFormat("%w")(d);
                    return ((n * cellSize) + (n * cellMargin) + cellSize / 2 + cellMargin);
                })
                .attr("y", d => {
                    let firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
                    return ((d3.timeFormat("%U")(d) - d3.timeFormat("%U")(firstDay)) * cellSize) +
                        ((d3.timeFormat("%U")(d) - d3.timeFormat("%U")(firstDay)) * cellMargin) + cellMargin + cellSize;
                });

            // Add the day text to each cell
            svg
                .selectAll("g.day")
                .append("text")
                .attr("class", "day-text")
                .attr("text-anchor", "middle")
                .attr("font-family", "sans-serif")
                .attr("font-size", cellSize * 0.45)
                .style("opacity", 0.75)
                .text(d => {
                    return d3.timeFormat("%e")(d);
                })
                .attr("x", d => {
                    let n = d3.timeFormat("%w")(d);
                    return ((n * cellSize) + (n * cellMargin) + cellSize + cellMargin);
                })
                .attr("y", d => {
                    let firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
                    return ((d3.timeFormat("%U")(d) - d3.timeFormat("%U")(firstDay)) * cellSize) +
                        ((d3.timeFormat("%U")(d) - d3.timeFormat("%U")(firstDay)) * cellMargin) + cellMargin + cellSize + (cellSize / 2 + cellSize * 0.45 / 2);
                });

            // Add the weekday text below title (mon, tues, etc)
            svg
                .selectAll("g.rect.day")
                .data((d, i) => {
                    return d3.timeDays(d, new Date(d.getFullYear(), d.getMonth() + 1, 1));
                })
                .enter()
                .append("text")
                .attr("class", "weekday-text")
                .attr("text-anchor", "middle")
                .attr("font-family", "sans-serif")
                .attr("font-size", cellSize * 0.33)
                .attr("width", cellSize)
                .attr("height", cellSize)
                .attr("x", (d, i) => {
                    if (i < 7) {
                        let n = d3.timeFormat("%w")(d);
                        return ((n * cellSize) + (n * cellMargin) + cellSize + cellMargin);
                    }
                })
                .attr("y", cellSize)
                .text((d, i) => {
                    if (i < 7) {
                        return d3.timeFormat("%a")(d);
                    }
                });

            // Fill colors
            d3.selectAll("rect.day-fill")
                .transition()
                .duration(500)
                .attr("fill", (d, i) => {
                    // console.log(d)
                    let fill = data.filter(h => {
                        return d3.timeFormat("%Y-%m-%d")(h.date) === d3.timeFormat("%Y-%m-%d")(d)
                    })[0];

                    if (typeof fill !== 'undefined') {
                        return fill.color;
                    } else {
                        return "#F4F4F4";
                    }

                });

        }
    });




};

timeseriesCalendar.prototype = {
    init: function () {
        console.log('Inited')
    }
};