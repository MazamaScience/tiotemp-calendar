import React, {
    useEffect,
    useRef
} from 'react';
import * as d3 from 'd3';

import './index.css'

var tempData = [
    ['2001-01-01 00:00 PST', 1.0],
    ['2001-01-02 00:00 PST', 8.0],
    ['2001-01-03 00:00 PST', 8.0],
    ['2001-01-04 00:00 PST', 8.0],
    ['2001-01-05 00:00 PST', 3.0],
    ['2001-01-06 00:00 PST', 4.0],
    ['2001-01-07 00:00 PST', 11.0]
];

function TiotempCalendar(props) {

    "use strict";

    // Default options object
    var defaults = {
        url: "",
        el: "timeseriesCalendar",
        onclick: d => {
            console.log(d)
        },
        colors: ["#2ecc71", "#f1c40f", "#e67e22", "#e74c3c", "#9b59b6", "#8c3a3a"],
        breaks: [12, 35.5, 55.5, 150.5, 250.5],
        units: "(\u00B5g/m\u00B3)",
        fullYear: true,
        cellPadding: 4,
        monthPadding: 8,
        cellSize: 26,
        cellRadius: 6,
        columns: 3,
        showDay: true,
        inCell: undefined, // allow custom cell stuff
        inTooltip: undefined
    };

    // accept a data and options object
    const {
        data,
        options
    } = props;

    const ref = useRef();

    // Use hook that depends on data to redraw the calendar
    useEffect(() => {

        console.log(ref)

        // Draw the calendar component
        drawCal(tempData);

    }, [tempData]);

    // tiotemp calendar
    function drawCal(data) {

        let dates = getDatesStr(data);
        const data_monthly = getDateDomain(makeDate(dates));

        var h = 5 * (defaults.cellSize + defaults.cellPadding) + defaults.monthPadding;
        var w = 7 * (defaults.cellSize + defaults.cellPadding) + defaults.cellPadding;



        // Define react cal canvas 
        const canvas = d3.select(ref.current)
            .append("div")
            .attr("class", "grid-container")
            .style("display", "grid")
            .style("grid-template-columns", `repeat(${defaults.columns}, minmax(${w}px, ${h + 20}px))`)
            .style("grid-template-rows", "auto auto auto")
            .style("padding", "10px")
            .style("justify-self", "center")
            .selectAll("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("style", "background-color:white")
            .classed("svg-content", true);


        // Define the svg month-cells to draw on
        var svg = canvas
            .data(data_monthly)
            .enter()
            .append("svg")
            .attr("class", "month-cell")
            .attr("width", monthCellDim)
            .attr("height", monthCellDim);

        // Add the title of each svg month
        svg
            .append("text")
            .attr("class", "month-label")
            .attr("x", 0.5 * monthCellDim())
            .attr("y", "1em")
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", 0.5 * defaults.cellSize)
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
            .attr("width", defaults.cellSize)
            .attr("height", defaults.cellSize)
            .attr("rx", defaults.cellRadius) // round
            .attr("ry", defaults.cellRadius) // corners
            .attr("fill", "#F4F4F4") // Default colors
            .attr("date", d => {
                return d;
            })
            .style("opacity", 0.95)
            .attr("x", d => {
                return dayCellX(d);
            })
            .attr("y", d => {
                return dayCellY(d);
            });


        // Add the day text to each cell

        if (defaults.showDay) {
            svg
                .selectAll("g.day")
                .append("text")
                .attr("class", "day-text")
                .attr("text-anchor", "middle")
                .attr("font-family", "sans-serif")
                .attr("font-size", defaults.cellSize * 0.45)
                .style("opacity", 0.75)
                .text(d => {
                    return d3.timeFormat("%e")(d);
                })
                .attr("x", d => {
                    return dayCellX(d) + defaults.cellSize * 0.5;
                })
                .attr("y", d => {
                    return dayCellY(d) + (defaults.cellSize * 0.5 + defaults.cellSize * 0.3 / 2);
                });
        }

    }

    // Currently assuming an n-len array of 2-len arrays
    function getDatesStr(arr) {
        return arr.map(d => {
            return d[0];
        });
    }

    function getValStr(arr) {
        return arr.map(d => {
            return d[1];
        });
    }

    function makeDate(arr) {
        return arr.map(d => {
            return (new Date(d));
        });
    }

    function getDateDomain(dates) {
        // startdate, enddate
        let sd, ed;
        // check month-domain parameter
        if (defaults.fullYear) {
            // TODO: Check for errors with tz 
            sd = new Date('01-01-2000');
            ed = new Date('12-31-2000');
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
        return d3.timeMonths(sd, ed);
    }

    function monthCellDim() {
        return 7 * (defaults.cellSize + defaults.cellPadding) + defaults.cellPadding;
    }

    // Get svg positions of date 
    function dayCellX(date) {
        let n = d3.timeFormat("%w")(date);
        return n * (defaults.cellSize + defaults.cellPadding) + defaults.cellPadding;
    }

    function dayCellY(date) {
        let day1 = new Date(date.getFullYear(), date.getMonth(), 1);
        return (((d3.timeFormat("%U")(date) - d3.timeFormat("%U")(day1)) * defaults.cellSize) +
            ((d3.timeFormat("%U")(date) - d3.timeFormat("%U")(day1)) * defaults.cellPadding) +
            defaults.cellPadding + defaults.cellSize);
    }


    return (
        <div ref = {ref} id = 'tiotemp-cal' />
    );
}

export default TiotempCalendar;