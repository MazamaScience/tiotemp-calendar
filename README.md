# tiotemp.js

***This module is still under development***

`tiotemp.js` is a small collection of useful javascript module visualizations for spatial and temporal air-quality data.

## Getting Started

1. Download the latest verison of `tiotemp.js` in your application.

2. Inlcude the `d3.js` and `PapaParse` libraries.

```html
<script src="https://d3js.org/d3.v5.min.js"></script>
<script src="https://unpkg.com/papaparse@5.3.0/papaparse.min.js"></script>charset="utf-8"></script>
```

3. Install `tiotemp.js` in your application by including the javascript and the css file

```html
<link rel="stylesheet" href="path/to/css/tiotemp.css" />
<script type="text/javascript" src="path/to/tiotemp.js"></script>
```

## Basic Usage

### Timeseries Calendar

```html
<div id="calendar"></div>
<script type="text/javascript">
    var cal = new timeseriesCalendar({url: URL_TO_CSV});
</script>
```

#### Testing

To test the Timeseries calendar with Node: 

1. Navigate to the root folder of the `tiotemp.js`

2. Run the included test script which sets up a simple `express.js` web server and hosts the `test_data.csv`.

```bash
npm test
```

3. Open a browser on `http://localhost:3000`.
