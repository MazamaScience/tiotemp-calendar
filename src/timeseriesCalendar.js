/* 
 * timeseriesCalendar.js
 *
 * A javascript module to support the independent usage of 
 * the tiotemp visualization library.
 *
 * Mazama Science 
 */

var timeseriesCalendar = function (options) {

    "use strict";

    // Default options object
    var defaults = {
        url: "",
        el: "timeseriesCalendar",
        onclick: (self, value) => {
            console.log(self);
        },
        colors: ["#2ecc71", "#f1c40f", "#e67e22", "#e74c3c", "#9b59b6", "#8c3a3a"], 
        breaks: [12, 35.5, 55.5, 150.5, 250.5], 
        units: "(\u00B5g/m\u00B3)",
        fullYear: false,
        cellPadding: 4,
        monthPadding: 8,
        cellSize: 26,
        cellRadius: 6, 
        columns: 3
    }; 

    // Set defaults to options object
    function setDefaults(options, defaults) {
        return Object.assign({}, defaults, options);
    }; 
    options = setDefaults(options, defaults);

    // Define h and w pf grif-container (month cell)
    var height = (options.cellSize + options.cellPadding) * 5 - options.monthPadding;
    var width = (options.cellSize + options.cellPadding) * 7 - options.monthPadding;
    
    // Define calendar canvas
    var canvas = d3.select('#' + options.el)
        .append("div")
        .attr("class", "grid-container")
        .style("display", "grid")
        .style("grid-template-columns", `repeat(${options.columns}, minmax(${width}px, ${width + 20}px))`)
        .style("grid-template-rows", "auto auto auto")
        .style("padding", "10px")
        .style("justify-self", "center")
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
            .style("color", "#F4F4F4")
            .style("position", "absolute")
            .style("z-index", 100);
    }

    // Parse the data and average it 
    function parse (obj) {

        // store header data
        let head = obj.data[0];
        //console.log(obj)

        // test header contains a header with date and/or time string
        if (/date|time/.test(head)) {
            var date_ax = head.findIndex(s => /date|time/.test(s));
            var val_ax = head.findIndex(s => /(?<!\date|time)$/.test(s));
        } else {
            stop("No axis detected!")
        }

        // if the datetime of the val is equal to the day-object, add it to the day-object
        // otherwise create a new date-object for day 
        // [{date: YYYY-mm-dd[i], date-object[i]}, {date: YYYY-mm-dd[i+1], date-object[i+1]}, ...]
        let data = obj.data
            .filter(d => {
                return !/date|time|^\s*$/.test(d)
            })
            .map(d => {
                return {
                    // store local-date string for grouping
                    date: (new Date(d[date_ax])).toLocaleDateString(),
                    // store primitive time 
                    time: (new Date(d[date_ax])).getTime(),
                    // handle NaNs
                    val: (isNaN(Number(d[val_ax])) ? 0 : Number(d[val_ax]))
                };
            })
            .reduce((m, d) => {
                if (!m[d.date]) { // if date object dne create one 
                    m[d.date] = {
                        date: new Date(d.time),
                        mean: d.val,
                        color: "",
                        sum: d.val,
                        count: 1,
                        data: [
                            [d.time, d.val]
                        ]
                    };
                } else { // add date properties
                    m[d.date].sum += d.val;
                    m[d.date].count += 1;
                    m[d.date].mean = m[d.date].sum / m[d.date].count;
                    m[d.date].color = colorMap(m[d.date].mean);
                    m[d.date].data.push([d.time, d.val]);
                }
                return m;
            }, {});

        return Object.values(data);

    }

    // Remap the colors
    function colorMap (value) {

        if (value === null) {
            return "#F4F4F4";
        } else {
            return d3.scaleThreshold()
                .domain(options.breaks)
                .range(options.colors)(value);
        }

    };

    // Quantum-month domain from Date array
    function getDomain (arr) { 
        
        // startdate, enddate
        var sd, ed;
        // check month-domain parameter
        if (options.fullYear) {
            // TODO: Check for errors with tz 
            sd = new Date('01-01-2000');
            ed = new Date('12-31-2000');
            sd.setFullYear(arr[0].getFullYear());
            ed.setFullYear(arr[arr.length - 1].getFullYear());
        } else {
            if (arr[0].getMonth() === arr[arr.length - 1].getMonth()) {
                sd = (new Date(arr[0])).setMonth(arr[0].getMonth() - 1);
            } else {
                sd = arr[0];
            }
            ed = arr[arr.length - 1];
        }
        return d3.timeMonths(sd, ed);

    };

    // Draw Calendar
    function drawCal (data) {

        // Get the dates 
        const dates = data.map(d => {
            return d.date
        }); 

        var data_monthly = getDomain(dates);

        var elem = document.querySelector("div#" + options.el);
        const view = elem.getBoundingClientRect();

        // Month Cell properties
        function monthCellWidth () { 
            return 7 * (options.cellSize + options.cellPadding) + options.cellPadding; 
        };
        function monthCellHeight () { 
            return (7 * options.cellSize) + (8 * options.cellPadding);
        };

        // Day Cell X, Y pos
        function dayCellX (date) { 
            let n = d3.timeFormat("%w")(date);
            return n * (options.cellSize + options.cellPadding) + options.cellPadding;
        };
        function dayCellY (date) {
            let day1 =  new Date(date.getFullYear(), date.getMonth(), 1); 
            return (((d3.timeFormat("%U")(date) - d3.timeFormat("%U")(day1)) * options.cellSize) + 
                ((d3.timeFormat("%U")(date) - d3.timeFormat("%U")(day1)) * options.cellPadding) + 
                options.cellPadding + options.cellSize);
        };

        // Define the svg month-cells to draw on
        let svg = canvas
            .data(data_monthly)
            .enter()
            .append("svg")
            .attr("class", "month-cell")
            .attr("width", monthCellWidth())
            .attr("height", monthCellHeight());

        // Add the title of each svg month
        svg
            .append("text")
            .attr("class", "month-label")
            .attr("x", monthCellWidth() * 0.5 )
            .attr("y", "1em")
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", options.cellSize * 0.5)
            .text(d => {
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
            .attr("width", options.cellSize)
            .attr("height", options.cellSize)
            .attr("rx", options.cellRadius) // round
            .attr("ry", options.cellRadius) // corners
            .attr("fill", "#F4F4F4") // Default colors
            .style("opacity", 0.95)
            .attr("x", d => {
                return dayCellX(d);
            })
            .attr("y", d => {
                return dayCellY(d);
            });

        // Add the day text to each cell
        svg
            .selectAll("g.day")
            .append("text")
            .attr("class", "day-text")
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", options.cellSize * 0.45)
            .style("opacity", 0.75)
            .text(d => {
                return d3.timeFormat("%e")(d);
            })
            .attr("x", d => { 
                return dayCellX(d) + options.cellSize * 0.5; 
            })
            .attr("y", d => {
                return dayCellY(d) + (options.cellSize * 0.5 + options.cellSize * 0.3 / 2);
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
            .attr("font-size", options.cellSize * 0.33)
            .attr("width", options.cellSize)
            .attr("height", options.cellSize)
            .attr("x", (d, i) => {
                if (i < 7) { 
                    return dayCellX(d) + options.cellSize * 0.5;
                }
            })
            .attr("y", options.cellSize)
            .text((d, i) => {
                if (i < 7) {
                    return d3.timeFormat("%a")(d);
                }
            });

        // Make the day cell tooltip/highlight
        d3.selectAll("g.day")
            .on("mouseover", function (d) {
                tooltip
                    .style("visibility", "visible")
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY + 10}px`)
                    .text(() => {
                        let cell = (data.filter(h => {
                            return d3.timeFormat("%Y-%m-%d")(h.date) === d3.timeFormat("%Y-%m-%d")(d);
                        }))[0];
                        if (typeof cell !== "undefined") {
                            return cell.mean.toFixed(1) + " " + options.units;
                        } else {
                            return "No data";
                        }
                    })
                    .style("text-anchor", "middle")
                    .style("font-family", "sans-serif")
                    .style("font-size", "0.7em");

                d3.select(this)
                    .select("rect.day-fill")
                    .style("stroke", "#605e5d")
                    .style("stroke-width", 2);
            })
            .on("mouseout", function (d) {
                d3.select(this)
                    .select("rect.day-fill")
                    .style("stroke", "transparent");

                tooltip
                    .style("visibility", "hidden")
                    .text(""); // Erase the text on mouse out
            });

        // Callback method on cell click
        d3.selectAll("g.day")
            .on("click", function (d) {
                let val = data.filter(h => {
                    return d3.timeFormat("%Y-%m-%d")(h.date) === d3.timeFormat("%Y-%m-%d")(d);
                })[0];
                options.onclick(this, val);
            });

        // Fill colors
        d3.selectAll("rect.day-fill")
            .transition()
            .duration(500)
            .attr("fill", (d, i) => {
                // console.log(d)
                let fill = data.filter(h => {
                    return d3.timeFormat("%Y-%m-%d")(h.date) === d3.timeFormat("%Y-%m-%d")(d);
                })[0];

                if (typeof fill !== 'undefined') {
                    return fill.color;
                } else {
                    return "#F4F4F4";
                }
            });

    };

    // Stream the data and draw the calendar
    Papa.parse(options.url, {
        download: true,
        complete: result => {

            // Parse and aggregate the data
            const data = parse(result)

            // Draw the calendar 
            drawCal(data);
            
        }

    });

};

// TODO: implement object protoype
timeseriesCalendar.prototype = {
    init: function () {
        console.log('Inited')
    }
};