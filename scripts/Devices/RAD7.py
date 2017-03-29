" This Module Imports data from a Masimo RAD 7 "

import logging
logger = logging.getLogger(__name__)
hdlr = logging.FileHandler('./pulsi.log')
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr)
logger.setLevel(logging.INFO)

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
        try:
            date = datetime.strptime(parsed_string[0] + " " + parsed_string[1], "%m/%d/%y %H:%M:%S")
        except ValueError:
            logger.error("Cannot convert '" + parsed_string[0] + " " + parsed_string[1] + "' to date")

		#get serial number
        try:
            serial_number = parsed_string[2].split("=")[1]
        except IndexError:
            logger.error("Index error: '" + parsed_string[2] + "'")

        #try and parse SPO2, this will fail when the value is "--%"
        spo2 = -1
        try:
            spo2 = int(parsed_string[3].split("=")[1].replace("%", ""))
        except (ValueError, IndexError):
            logger.error("Unknown conversion errror spo2: '"+ parsed_string[3] + "'")

		#try and parse BPM, this will fail when the value is "--%""
        beat_per_minute = -1
        try:
            beat_per_minute = int(parsed_string[4].split("=")[1])
        except (ValueError, IndexError):
            logger.error("Unable to parse BPM: '" + parsed_string[4] + "'")

		#try and parse PI, this will fail when the value is "--%"
        perfusion_index = -1
        try:
            perfusion_index = float(parsed_string[5].split("=")[1].replace("%", ""))
        except (ValueError, IndexError):
            logger.error("Unable to parse PI: '" + parsed_string[5] + "'")

        try:
            alarm = parsed_string[10].split("=")[1]
        except IndexError:
            logger.error("Unable to parse alarm: '" + parsed_string[10] + "'")

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
        logger.error("Malformed line: '" + str(line) + "'")
        return None
