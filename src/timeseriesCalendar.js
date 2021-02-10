var timeseriesCalendar = function (options) {

    "use strict";

    // Default options object
    var defaults = {
        url: "",
        el: "#timeseriesCalendar", 
        size: 900, 
        callback: (self, value) => { console.log(self); },  
        colors: ["#ededed", "#abe3f4", "#118cba", "#286096", "#8659a5", "#6a367a"], 
        breaks: [0.01, 8, 20, 35, 55, 100],
        units: "(\u00B5g/m\u00B3)"
    }

    // Set defaults to options object
    function setDefaults(options, defaults){
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
            let data = parseData(result)

            // Get the dates 
            let dates = data.map(d => {
                return d.date
            })

            // Create svg for each month of data
            let months = d3.timeMonth.range(dates[0], dates[dates.length - 1]);

            let elem = document.querySelector("div" + options.el);
            let view = elem.getBoundingClientRect();

            // Define the svg to draw on
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