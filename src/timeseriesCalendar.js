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
        el: "#timeseriesCalendar",
        size: 900,
        callback: (self, value) => {
            console.log(self);
        },
        colors: ["#ededed", "#abe3f4", "#118cba", "#286096", "#8659a5", "#6a367a"],
        breaks: [0.01, 8, 20, 35, 55, 100],
        units: "(\u00B5g/m\u00B3)",
        fullYear: false
    }

    // Set defaults to options object
    function setDefaults(options, defaults) {
        return Object.assign({}, defaults, options);
    }
    options = setDefaults(options, defaults);

    // Define h and w 
    var height = options.size;
    var width = options.size;

    // Padding between each cell
    const cellMargin = 2;
    // 29 days per row + padding
    const cellSize = width / (29 + 2 * cellMargin);

    // Define calendar canvas
    var canvas = d3.select(options.el)
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

    // Parse the data and average it 
    var parseData = function (obj) {

        // store header data
        let head = obj.data[0];
        console.log(obj)

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
    const colorMap = function (value) {
        if (value === null) {
            return "#F4F4F4";
        } else {
            return d3.scaleThreshold()
                .domain(options.breaks)
                .range(options.colors)(value);
        }
    };

    // Stream the data and draw the calendar
    Papa.parse(options.url, {
        download: true,
        complete: result => {

            // Parse and aggregate the data
            const data = parseData(result)
            console.log(data)

            // Get the dates 
            const dates = data.map(d => {
                return d.date
            })

            // startdate, enddate
            var sd, ed;

            // check month-domain parameter
            if (options.fullYear) {
                // TODO: Check for errors with tz 
                sd = new Date('January 1, 1976 23:15:30');
                ed = new Date('December 31, 1976 23:15:30');
                sd.setFullYear(dates[0].getFullYear());
                ed.setFullYear(dates[dates.length - 1].getFullYear());
            } else {
                if (dates[0].getMonth() === dates[dates.length - 1].getMonth()) {
                    sd = (new Date(dates[0])).setMonth(dates[0].getMonth() - 1);
                } else {
                    sd = dates[0];
                }
                ed = dates[dates.length - 1];
            }

            // Create n-month range
            const data_monthly = d3.timeMonths(sd, ed);

            let elem = document.querySelector("div" + options.el);
            let view = elem.getBoundingClientRect();

            // Define the svg to draw on
            let svg = canvas
                .data(data_monthly)
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
                                return "NA";
                            }

                        })
                        .style("text-anchor", "middle")
                        .style("font-family", "sans-serif")
                        .style("font-size", "0.7em");

                    d3.select(this)
                        .select("rect.day-fill")
                        .style("stroke", "#2D2926")
                        .style("stroke-width", cellMargin);
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
                    options.callback(this, val);
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
        }

    });

};

timeseriesCalendar.prototype = {
    init: function () {
        console.log('Inited')
    }
};