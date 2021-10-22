from threading import Thread
import cv2, time
from datetime import datetime
import os
from influxdb import InfluxDBClient
from pathlib import Path
import random


class ThreadedCamera(object):
    def __init__(self, src=0, imgdir="", dbcon=None):
        self.capture = cv2.VideoCapture(src)
        
        # example of passing in external data to camera
        print("image path is " + imgdir)

        # FPS = 1/X
        # X = desired FPS
        self.FPS = 1/30
        self.FPS_MS = int(self.FPS * 1000)

        # possible method of timing screenshot saves
        self.thumbCounter = 0

        # Start frame retrieval thread
        self.thread = Thread(target=self.update, args=())
        self.thread.daemon = True
        self.thread.start()

    def show_frame(self):
        cv2.imshow('frame', self.frame)
        cv2.waitKey(self.FPS_MS)

    def write_to_disk(self):
        unixtime = str(time.time()) # get string of current UNIX timestamp
        imgpath = imgdir+unixtime+".jpg"
        print(imgpath)
        imgsaved = cv2.imwrite(imgpath, self.frame) # will write image. Generate dynamic filename
        self.write_to_db(imgpath)
        time.sleep(1)

    def write_to_db(self, filepath):
        dbcon.write_to_db(filepath)

    # simply updates the self.frame attribute at a rate of FPS we choose
    def update(self):
        while True:
            if self.capture.isOpened():
                (self.status, self.frame) = self.capture.read()
                #  print("capturing frame")
                #  self.frame = cv2.cvtColor(self.frame, cv2.COLOR_YUV2BGR) # those are some strange colors lol
            time.sleep(self.FPS)





class DatabaseConnection():
    def __init__(self):
        # Make DB connection
        try:
            self.host = "127.0.0.1" # for running on the pi
            #self.host = "10.0.0.228" # for testing remotely
            self.port = "8086"
            self.client = InfluxDBClient(host=self.host, port=self.port)
        except:
            print("Error connecting to database")

        print("Success connecting to InfluxDB")

        # Check to see if fathom DB already exists (it should)
        current_dbs = self.client.get_list_database()
        if any("fathom" in dbname for dbname in current_dbs):
            print("database doesn't exist, creating it.")
            self.client.create_database("fathom")
        else:
            print("database found.")

        # Switch it to our active dtabase
        try:
            self.client.switch_database("fathom")
            print("switched to fathom DB")
        except:
            print("failed to switch to fathom DB")

    # takes a piece of JSON and writes it to our database
    def write_to_db(self, imgfilepath):
        print("[INFO] attempting to write "+imgfilepath+" to db")

        # this causes 204 response when successfull, but crashes program
        # JSON gets converted to line format anyways, I just prefer for readability
        #datum = {'points': [{
        #    "measurement":  "filepaths",
        #    "tags": {"location": "gamma"},
        #    "fields": {"filepath": imgfilepath},
        #}]}
        # also seems to ignore expected_response_code
        #res = self.client.write(datum, {'db':'fathom'}, expected_response_code=200, protocol='json')

        camLocation = "Tahiti"
        camId = 1827349
        # Construct our data based on inputs
        dataDict = ['filepaths,location='+camLocation+',filepath='+imgfilepath+' camId='+str(camId)]

        
        #unix_timestamp = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')     
        unix_timestamp = int(time.time() * 1000)
        dataString = "{measurement},location={location},filepath={filepath} camId={camId} {timestamp}".format(
                measurement="filepaths",
                filepath=imgfilepath,
                location=camLocation,
                camId=camId,
                timestamp=unix_timestamp
                )
        print(dataString)


        #res = self.client.write(dataDict,{'db':'fathom'},204,'line')
        res = self.client.write([dataString],{'db':'fathom'},204,'line')

        if not res:
            print("[ERROR] Could not write to database")
        else:
            print("[SUCCESS] wrote "+imgfilepath+" to db")


if __name__ == '__main__':

    # Global config values
    clientname = "fathom"

    src = 'rtsp://10.0.0.228:8554/test' # PUT THE ADDRESS OF YOUR PI HERE
    #  src = 'rtsp://127.0.0.1:8554/test'

    # Where photos from stream will be saved
    imgdir = os.getcwd()+"/"+clientname+"/images/"
    Path(imgdir).mkdir(parents=True, exist_ok=True)

    dbcon = DatabaseConnection()
    threaded_camera = ThreadedCamera(src, imgdir, dbcon)

    while True:
        try:
            #threaded_camera.show_frame() # displays feed
            time.sleep(1)
            threaded_camera.write_to_disk()
        except AttributeError:
            pass
