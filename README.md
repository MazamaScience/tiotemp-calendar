# tiotemp-calendar

***This module is still under development***

`tiotemp-calendar` is a small collection of useful javascript module visualizations for spatial and temporal air-quality data.

## Getting Started

1. Download the latest verison of `tiotemp-calendar` in your application.

2. Inlcude the `d3.js` and `PapaParse` libraries.

```html
<script src="https://d3js.org/d3.v5.min.js"></script>
<script src="https://unpkg.com/papaparse@5.3.0/papaparse.min.js"></script>charset="utf-8"></script>
```

3. Install `tiotemp-calendar` in your application by including the javascript file.

```html
<script type="text/javascript" src="path/to/tiotemp-calendar"></script>
```

## Basic Usage

### Timeseries Calendar

```html
<div id="calendar"></div>
<script type="text/javascript">
    var cal = new timeseriesCalendar({url: URL_TO_CSV, ...});
</script>
```

`tiotemp-calendar` requires a csv, remote or local. The csv can be of any timeseries data that has at least one column with the name `time` or `date`, or combination of both (e.g. `datetime`). The csv should also contained a named column of the timeseries data to be used for aggregation and visualization. 

i.e the data should appear similar to:

|    datetime   |     value     |
| ------------- | ------------- |
| 2001-01-01 12:53 PST  |  1.0  |
| 2001-01-01 15:36 PST  |  8.0  |
|      ...      |     ...       |


### Options

* url 

#### `timeseriesCalendar({url})`

_string_ The URL pointing to the CSV file. Remote or local should work.

* el 

#### `timeseriesCalendar({el})`

_string_ What element to append the svg-calendar-canvas to.

* callback 

#### `timeseriesCalendar({callback})`

_function_ Allow user to input custom callback features for date-cell clicks. 

* colors

#### `timeseriesCalendar({color})`

_array (string)_ Specify the color palette for the calendar date-cells.

* breaks

#### `timeseriesCalendar({breaks})`

_array (numeric)_ Specify the color-breaks for the defined color palette. Note: must be same array length of the color palette. 

* fullYear

#### `timeseriesCalendar({fullYear})`

_boolean_ `true` or `false` to show the full calendar year (12 months), regardless of data provided. 

* cellSize 

#### `timeseriesCalendar({cellSize})`

_numeric_ The size of each date-cell. Numeric, in pixels.

* cellPadding

#### `timeseriesCalendar({cellSize})`

_numeric_ The size of each date-cell padding. Numeric, in pixels.

* cellRadius

#### `timeseriesCalendar({cellRadius})`

_numeric_ The size of each date-cell corner radius. For circles, `cellRadius = cellSize`.  Numeric, in pixels. 

* columns

#### `timeseriesCalendar({columns})`

_numeric_ The number of columns the calendar should display. `'auto-fill` for automatic columns based on window and month-cell widths. Numeric otherwise.

### Testing

To test the Timeseries calendar with Node: 

1. Navigate to the root folder of the `tiotemp.js`

2. Run the included test script which sets up a simple `express.js` web server and hosts the `test_data.csv`.

```bash
npm test
```

3. Open a browser on `http://localhost:3000`.
