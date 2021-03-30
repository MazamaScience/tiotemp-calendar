import logo from './logo.svg';
import './App.css';

import React from 'react';
import * as d3 from 'd3';

const Cal = () => {

  const ref = React.useRef();

  React.useEffect(() => {
        const svgElement = d3.select(ref.current)
    svgElement.append("circle")
      .attr("cx", 150)
      .attr("cy", 70)
      .attr("r",  50)
  }, []);
  
  return (
    <svg
    ref = {ref}
    />
  );
}; 

function App() {

  return Cal();

}

export default App;
