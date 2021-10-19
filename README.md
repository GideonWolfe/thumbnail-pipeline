The components for this demonstration are as follows:


## rtsp

This `docker` container installs `gstreamer` and creates an `rtsp` feed, which is converted to rtp as well. This makes a feed from our camera available at `rtsp://127.0.0.1:8554/test`

## feed_handler

Currently, this takes the form of a `python` script. This script creates a camera object by using `opencv` and connecting to the `rtsp` server hosted by the `rtsp` container above. Additionally, it makes a connection to a local InfluxDB container instance.

This script is responsible for performing any tasks that should be constanly running against our video feed. Currently, it simply saves a thumbnail to a directory every second. But we could expand to add

* ML processing
* Youtube live streaming
* Save video chunks
* etc

Once the thumbnail has been written, the filepath is written as a datapoint into InfluxDB along with a timestamp and location of the camera (we would definitely want more metrics here)

## influxDB

InfluxDB is a time series database. For this demo I set up a "fathom" bucket with a measurement called "filepaths" to which the image filepaths are written by the `feed_handler`.

## backend

This is a simple `node.js` server that acts as our "API" that a client would query when asking for footage from their cameras.

A `GET` request to `/thumbnail?ts=<unixtimestamp>` should return a thumbnail where the timestamp is equal to the passed value. I want to enhance this to give the "closest" thumbnail to the passed timestamp, as it is unlikely that a user will get it exactly.

A `GET` request to `/thumnnailGroup?ts=<unixtimestamp>` should yeild a group of thumbails such that the timestamp is *greater* than the passed value, but by `X` minutes or less. This is so if we had, say, 10 minute video chunks, we would only be grabbing 10 minutes worth of thumbnails.

These requests are completed by taking in the URL parameters enumerated above and formulating a query string using InfluxDB's Flux query language.

## frontend

This is an example implementation of a dashboard that could contain multiple thumbnails representing video clips. Theoretically this could run anywhere (such as client servers) and make API requests to the pi. Since i'm running it off the pi, image requests are pretty quick.



