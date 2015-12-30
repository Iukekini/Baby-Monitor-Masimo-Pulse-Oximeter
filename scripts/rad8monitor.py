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
	
	#parse on " "
	parsedString = x.split(" ")
	
	#make sure we got a full record before we continue. The first record read can often be a partial record.  
	if len(parsedString) == 12:
		try:
		
			#parse date time from first 2 parsed items
			date = datetime.strptime(parsedString[0] + " " + parsedString[1],"%m/%d/%y %H:%M:%S")
			#get serial number
			serial_number = parsedString[2].split("=")[1]
			
			#try and parse SPO2, this will fail when the value is "--%" 
			spo2 = -1
			try:
				spo2 = int(parsedString[3].split("=")[1].replace("%",""))
			except:
				print "Unable to parse SPO2"
			
			#try and parse BPM, this will fail when the value is "--%"	
			bpm = -1
			try:
				bpm = int(parsedString[4].split("=")[1])
			except:
				print "Unable to parse BPM";
			
			
			#try and parse PI, this will fail when the value is "--%"
			pi = -1
			try:
				pi = float(parsedString[5].split("=")[1].replace("%",""))
			except:
				print "Unable to parse PI"
				
			#Pares the Alarm Field
			alarm = parsedString[10].split("=")[1]
			if (alarm != "0000"):
				print parsedString
			
			#create json doc to load into mongodb
			doc = {
				"date" : date,
				"serial_number" : serial_number,
				"spo2" : spo2,
				"bpm" : bpm,
				"pi" : pi,
				"alarm" : alarm
			}
			
			#Insert Document
			db.radevents.insert(doc)
		except:
			print "Unable to insert event: :" + x
	