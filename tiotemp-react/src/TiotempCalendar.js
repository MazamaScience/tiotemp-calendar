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
    ['2001-01-05 00:00 PST', 8.0]
];

function TiotempCalendar(props) {

    // accept a data and options object
    const {
        data,
        options
    } = props;

    const ref = useRef();

    console.log(props)

    // Use hook that depends on data to redraw the calendar
    useEffect(() => {
        console.log(ref)
        // Draw the calendar component
        drawCal();

    }, []);

    // tiotemp calendar
    function drawCal() {

        // Define react cal canvas 
        const canvas = d3.select(ref.current)
            .append("div")
            .attr("class", "grid-container")
            .style("display", "grid")
            .style("grid-template-columns", `repeat(${3}, minmax(${100}px, ${100 + 20}px))`)
            .style("grid-template-rows", "auto auto auto")
            .style("padding", "10px")
            .style("justify-self", "center")
            .selectAll("svg")
            .attr("width", 100)
            .attr("height", 100)
            .attr("style", "background-color:white")
            .classed("svg-content", true);
    }

    return <div ref = {ref} id = 'tiotemp-cal'/>

}

export default TiotempCalendar;