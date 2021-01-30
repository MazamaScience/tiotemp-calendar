const express = require('express')
const path = require('path')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/test_data.csv', (req, res) => {
  res.sendFile(path.join(__dirname + '/test_data.csv'));
});

app.use(express.static(__dirname + '/../src'));

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})