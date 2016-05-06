import time
import serial
import ConfigParser
from pymongo import MongoClient
from datetime import datetime

#config
Config = ConfigParser.ConfigParser()
Config.read('secrets.ini')

#setup connection to MongoDB
#TODO Move to secert file. 

client = MongoClient(Config.get('MongoDB','ConnectionString'))
db = client.rad8mongodb

#setup serial connection to RAD8 Unit
ser = serial.Serial(
	
	port=Config.get('Serial','Device'),
	baudrate = 9600,
	parity=serial.PARITY_NONE,
	stopbits=serial.STOPBITS_ONE,
	bytesize=serial.EIGHTBITS,
	timeout=2
)

#additional Serial connection, Needed to make sure that flow control was off. 
ser.xonxoff = False     #disable software flow control
ser.rtscts = False     #disable hardware (RTS/CTS) flow control
ser.dsrdtr = False       #disable hardware (DSR/DTR) flow control

#loop while connection is active. 
while 1:	
	#read from Serial 
	x=ser.readline()
	print x
    
    