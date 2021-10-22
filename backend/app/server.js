const {InfluxDB, FluxTableMetaData} = require('@influxdata/influxdb-client')
const path = require('path')
const cors = require('cors')

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
app.use(express.static('public'))
app.use(cors())

// Timestamps don't work :(
// main route to fetch thumbnail filepath
// would be used to load preview as page is loading
app.get('/thumbnail', (req, res, next) => {

  // get query params from URL
  const queryParams = req.query.ts
  const funcQuery = 'from(bucket: "fathom") |> range(start: 0) |> filter(fn: (r) => r.location == "'+queryParams+'")'
  //const funcQuery = 'from(bucket: "fathom") |> range(start: 0) |> filter(fn: (r) => r._time >= "'+queryParams+'")'

  // returns a promise
  return queryApi
  .collectRows(funcQuery /*, you can specify a row mapper as a second arg */)
  .then(data => {
    data.forEach(x => console.log(JSON.stringify(x)))
    console.log('Collect ROWS SUCCESS')
    return res.status(200).send(data)
  })
  .catch(error => {
    console.error(error)
    console.log('Collect ROWS ERROR')
    return res.status(500).send(error)
  })

})

// Timestamps don't work :(
// endpoint that returns group of filepaths
// Input a range to get range of filepaths within timestamp
app.get('/thumbnailGroup', (req, res, next) => {

  // get query params from URL and convert and create date objects
  var minTime = req.query.ts // this is the STARTING timestamp
  var minDate  = new Date(parseInt(minTime))
  const endDate = new Date(minDate.getTime() + 5*60000)
  console.log("min date is "+minDate)
  console.log("end date is "+endDate)
  
  // filters to the measurement of interest (filepaths to us)
  // time range doesn't throw errors but doesn't seem to work
  //const funcQuery = 'from(bucket: "fathom") |> range(start: '+minDate.getTime()+', stop: '+endDate.getTime()+') |> filter(fn: (r) => r._measurement == "filepaths")'
  console.log('query: '+funcQuery)

  // returns a promise
  return queryApi
  .collectRows(funcQuery /*, you can specify a row mapper as a second arg */)
  .then(data => {
    //data.forEach(x => console.log(JSON.stringify(x))) //uncomment to print data
    console.log('Collect ROWS SUCCESS')
    return res.status(200).send(data)
  })
  .catch(error => {
    console.error(error)
    console.log('Collect ROWS ERROR')
    return res.status(500).send(error)
  })

})


// Timestamps don't work :(
// same as above, but has a replacement step to fix filepaths.
// removes absolute path before /images/ so they can be served by express
app.get('/thumbnailGroupReplaced', (req, res, next) => {

  // get query params from URL and convert and create date objects
  // This is the buggy part I think since InfluxDB complains about timestamps
  var minTime = req.query.ts // this is the STARTING timestamp
  var minDate  = new Date(parseInt(minTime))
  const endDate = new Date(minDate.getTime() + 5*60000)
  console.log("min date is "+minDate)
  console.log("end date is "+endDate)
  
  // filters to the measurement of interest (filepaths to us)
  // time range doesn't throw errors but doesn't seem to work
  //const funcQuery = 'from(bucket: "fathom") |> range(start: '+minDate.getTime()+', stop: '+endDate.getTime()+') |> filter(fn: (r) => r._measurement == "filepaths")'
	// test query to debug
  const queryParams = req.query.ts
  const funcQuery = 'from(bucket: "fathom") |> range(start: 0) |> filter(fn: (r) => r.location == "'+queryParams+'")'
  console.log('query: '+funcQuery)

  // returns a promise
  return queryApi
  .collectRows(funcQuery /*, you can specify a row mapper as a second arg */)
  .then(data => {
    //console.log(data)
    const filePathsAsUrls = data.map(item => {
	return {
    	    ...item,
    	    filepath: item.filepath.replace('/home/pi/docker-pipeline/feed_handler/fathom', '')
  	}
    })
    console.log(filePathsAsUrls)
    return res.status(200).send(filePathsAsUrls)
  })
  .catch(error => {
    console.error(error)
    console.log('Collect ROWS ERROR')
    return res.status(500).send(error)
  })

})

// this was a function given to me that uses await
// I want to try and use it
//function async getThumbsFetchPromiseAllAsync(){
  // test array with one request
//  const urls = ['backend/thumbnailGroup?ts=1633803677170']
//  const responses = await Promise.all(urls.map(fetch))
//  const points = await Promise.all(responses.map(u => u.text()))
//  const responseData = JSON.parse(points)
//}


// start server listening
app.listen(8080, (err) => {
  if (err) throw err
  console.log('Server started at port 8787')
})

