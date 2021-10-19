#!/bin/bash

echo "camera found, starting capture..."
GSTREAM_VER=$(gst-inspect-1.0 --gst-version | sed 's/^.*[^0-9]\([0-9]*\.[0-9]*\.[0-9]*\).*$/\1/')
cd /usr/src/app/gst-rtsp-server-${GSTREAM_VER}/examples
./test-launch --gst-debug=3 "( rpicamsrc bitrate=800000 awb-mode=tungsten preview=false ! video/x-h264, width=1280, height=720, framerate=30/1 ! h264parse ! rtph264pay name=pay0 pt=96 )" &

echo "rtsp-server is up, launching rtsp -> rtp"
gst-launch-1.0 rtspsrc \
	location=rtsp://127.0.0.1:8554/test latency=0 \
	! rtph264depay ! rtph264pay config-interval=1 pt=96 \
	! udpsink sync=false host=127.0.0.1 port=8004
# cd gst-rtsp-server/examples
# ./launch --gst-debug=3 "( rpicamsrc bitrate=8000000 awb-mode=tungsten preview=false ! video/x-h264, width=640, height=480, framerate=30/1 ! h264parse ! rtph264pay name=pay0 pt=96 )"
