" This Module Imports data from a Masimo RAD 7 "

from datetime import datetime
def create_event_from_output(line):
    "Takes the output form the RAD7 and returns a event to loading into the database"

	#parse on " "
    parsed_string = line.split(" ")

	#make sure we got a full record before we continue.
	#The first record read can often be a partial record.
    if len(parsed_string) == 17:
        #cleanup nulls at the beginning of the line
        while parsed_string[0][0] == '\x00':
            parsed_string[0] = parsed_string[0][1:]

        #parse date time from first 2 parsed items
        date = datetime.strptime(parsed_string[0] + " " + parsed_string[1], "%m/%d/%y %H:%M:%S")
		#get serial number
        serial_number = parsed_string[2].split("=")[1]

        #try and parse SPO2, this will fail when the value is "--%"
        spo2 = -1
        try:
            spo2 = int(parsed_string[3].split("=")[1].replace("%", ""))
        except ValueError:
            print "unknown converstion errror spo2"

		#try and parse BPM, this will fail when the value is "--%""
        beat_per_minute = -1
        try:
            beat_per_minute = int(parsed_string[4].split("=")[1])
        except ValueError:
            print "Unable to parse BPM"

		#try and parse PI, this will fail when the value is "--%"
        perfusion_index = -1
        try:
            perfusion_index = float(parsed_string[5].split("=")[1].replace("%", ""))
        except ValueError:
            print "Unable to parse PI"

        alarm = parsed_string[10].split("=")[1]

        doc = {
            "date" : date,
            "serial_number" : serial_number,
            "spo2" : spo2,
            "bpm" : beat_per_minute,
            "pi" : perfusion_index,
            "alarm" : alarm
        }
        return doc
    else:
        return None
