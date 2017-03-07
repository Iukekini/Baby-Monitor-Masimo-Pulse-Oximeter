"Read Data from the Pulse Ox and Send it to the Database"
import ConfigParser
import sys
from pymongo import MongoClient
import serial

#devices
import Devices.RAD8
import Devices.RAD7

from datetime import datetime

def read_and_parse_monitor_data():
    "Read from Serial port and parse depending on what device is selected"
    #config
    config = ConfigParser.ConfigParser()
    config.read('secrets.ini')

    mongo_client = MongoClient(config.get('MongoDB', 'ConnectionString'))

    event_database = mongo_client.pluseoxdata

    device_type = config.get('Device', 'Name')

    #setup serial connection to RAD8 Unit
    serial_connection = serial.Serial(port=config.get('Serial', 'Device'),
                                      baudrate=int(config.get('Serial', 'Baud_Rate')),
                                      parity=serial.PARITY_NONE,
                                      stopbits=serial.STOPBITS_ONE,
                                      bytesize=serial.EIGHTBITS,
                                      timeout=int(config.get('Serial', 'Timeout')))

    #additional Serial connection, Needed to make sure that flow control was off.
    serial_connection.xonxoff = False  #disable software flow control
    serial_connection.rtscts = False   #disable hardware (RTS/CTS) flow control
    serial_connection.dsrdtr = False   #disable hardware (DSR/DTR) flow control

    #loop while connection is active.
    while 1:
	#read from Serial
        device_output = serial_connection.readline()
        print ('%s  -->%s' % (str(datetime.now()),device_output))
        try:
            event = None
            if device_type == "RAD8":
                event = Devices.RAD8.create_event_from_output(device_output)
            elif device_type == "RAD7":
                event = Devices.RAD7.create_event_from_output(device_output)

            if event != None:
                event_database.radevents.insert(event)
        except():
            print "Unexpected error:", sys.exc_info()[0]


read_and_parse_monitor_data()
