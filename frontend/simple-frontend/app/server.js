const {InfluxDB, FluxTableMetaData} = require('@influxdata/influxdb-client')
const path = require('path')

// influx DB setup
const url = 'http://influxdb:8086'
const org = 'fathom' // this SHOULD be ignored in influx 1.x
const bucket = 'fathom' // should be the database name
const queryApi = new InfluxDB({url}).getQueryApi(org, bucket)
// in influx container, I can do
// use fathom
// INSERT test_vals,my_tag=heyther value=1234
// SELECT * FROM "test_vals"
// this will show value
// const testQuery = 'SELECT * FROM "test_vals"' // influxdb1


// set up server
var express = require('express')
var app = express()

// freddi fish demo URL
app.get('/freddi', function(req,res){
    res.sendFile(path.join(__dirname+'/index.html'));
});

// start server listening
app.listen(8080, (err) => {
  if (err) throw err
  console.log('Server started at port 7878')
})
