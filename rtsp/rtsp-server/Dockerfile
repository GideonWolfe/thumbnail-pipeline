# FROM raspbian/stretch
FROM navikey/raspbian-buster

WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get install -y vim git build-essential wget \
    gstreamer1.0-plugins-bad gstreamer1.0-plugins-base gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-ugly gstreamer1.0-tools libgstreamer1.0-dev libgstreamer1.0-0-dbg \
    libgstreamer1.0-0 libgstreamer-plugins-base1.0-dev \
    autoconf automake autopoint libtool gtk-doc-tools v4l-utils jq \
    libraspberrypi-bin libraspberrypi-dev 
    #libgstrtspserver-1.0

RUN export GSTREAM_VER=$(gst-inspect-1.0 --gst-version | sed 's/^.*[^0-9]\([0-9]*\.[0-9]*\.[0-9]*\).*$/\1/') && \
    wget https://gstreamer.freedesktop.org/src/gst-rtsp-server/gst-rtsp-server-${GSTREAM_VER}.tar.xz && \
    tar -xf gst-rtsp-server-${GSTREAM_VER}.tar.xz && \
    cd gst-rtsp-server-${GSTREAM_VER} && \
    ./configure && \
    make && \
    sudo make install

RUN git clone https://github.com/thaytan/gst-rpicamsrc.git && \
    cd gst-rpicamsrc && \
    ./autogen.sh  --prefix=/usr --libdir=/usr/lib/arm-linux-gnueabihf && \
    make && \
    sudo make install

COPY . .

CMD ["/bin/bash", "/usr/src/app/start.sh"]