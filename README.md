# tiotemp.js

***This module is still under development***

`tiotemp.js` is a small collection of useful javascript module visualizations for spatial and temporal air-quality data.

## Getting Started

1. Download the latest verison of `tiotemp.js` in your application.

2. Inlcude the d3.js library.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js" charset="utf-8"></script>
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
    var cal = new timeseriesCalendar();
    cal.init({});
</script>
```
