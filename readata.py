# -*- coding: utf-8 -*-
import os
import minimalmodbus
import time
from pymongo import MongoClient
import json
import datetime


def mod():
    
    rs485 = minimalmodbus.Instrument('/dev/ttyUSB0', 1)
    rs485.serial.baudrate = 9600
    rs485.serial.bytesize = 8
    rs485.serial.parity = minimalmodbus.serial.PARITY_NONE
    rs485.serial.stopbits = 1
    rs485.serial.timeout = 1
    rs485.debug = False
    rs485.mode = minimalmodbus.MODE_RTU
    return rs485

##for i in mdir:
##    print i,mdir[i][1]
mdir=[[0,"V"], [6,"A"], [12,"W"], [18,"VA"], [24,"VAr"], [30,"-"], [36,"°"], [70,"Hz"], [72,"kwh"], [74,"kwh"], [76,"kvarh"], [78,"kvarh"], [342,"kwh"], [344,"kvarh"]]


meudir=[{
        "name": "Voltaje",
        "unit": "0",
        "value": 0},
    {
        "name": "Corriente",
        "unit": "0",
        "value": 0},
    {
        "name": "Potencia Activa",
        "unit": "0",
        "value": 0},
    {
        "name": "Potencia Aparente",
        "unit": "0",
        "value": 0},
    {
        "name": "Potencia Reactiva",
        "unit": "0",
        "value": 0},
    {
        "name": "Factor de Potencia",
        "unit": "0",
        "value": 0},
    {
        "name": "Angulo de fase",
        "unit": "0",
        "value": 0},
	{
        "name": "Frecuencia",
        "unit": "0",
        "value": 0},
    {
        "name": "I Energia Activa",
        "unit": "0",
        "value": 0},
    {
        "name": "E Energia Activa",
        "unit": "0",
        "value": 0},
    {	
        "name": "I Energia Reactiva",
        "unit": "0",
        "value": 0},
    {
        "name": "E Energia Reactiva",
        "unit": "0",
        "value": 0},
 	{
        "name": "Energia Activa Total",
        "unit": "0",
        "value": 0},
    {
        "name": "Energia Reactiva Total",
        "unit": "0",
        "value": 0}]
    
def reader(adress):
	return  mod().read_float(adress, functioncode=4, numberOfRegisters=2)   


def rhis(namefile, data):
	fd = open(namefile,'a')
	fd.write(str(json.dumps(data))+'\n')
	fd.close()

def history(start, data):
	date = datetime.datetime.now()
	if start.day == date.day:
		filename = "lastday.json"
		rhis(filename, data)
	if start.month == date.month:
		filename =	"lastmonth.json"
		rhis(filename, data)
	if start.year == date.year:
		filename = "lastyear.json"
		rhis(filename, data)

start = datetime.datetime.now()
os.system("rm lastday.json && rm lastmonth.json && rm lastyear.json" )
while True:
    try:
        for i  in range(13):
        	meudir[i]["value"]=reader(mdir[i][0])
        	meudir[i]["unit"]=mdir[i][1]
        print meudir
        fc = open("data.json",'w')
        fc.write(json.dumps(meudir))
        fc.close()
        history(start, meudir)

		
    except IOError:
        mod()
        print "Waiting for communication"
        
    
                
   	#	fc = open("output.json",'w')
	#	fc.write(json.dumps([{'corriente':0, 'voltaje':analogicout, 'potencia':0, 'tp':0, 'tv':0, 'tc':0}]))
	#	fc.close()   
        
        
        