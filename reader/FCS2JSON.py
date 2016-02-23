#!/usr/bin/env python

## usage: ./FCS2JSON.py exp_010214m.EP5.FCS_s3673_13480_1.FCS
##
## will produce exp_010214m.EP5.FCS_s3673_13480_1.json, 
##        and   exp_010214m.EP5.FCS_s3673_13480_1.csv
##

import os
import sys
import pdb

import matplotlib
matplotlib.use("Pdf")

from FlowCytometryTools import *
from pylab import *

if(len(sys.argv) < 2) : 
  print "needs a filename.."
  exit()

datadir = './'
datafile=sys.argv[1]

if datafile.endswith('.FCS') or datafile.endswith('.fcs'):
  resultID = datafile[:-4]
else:
  print "needs a filename with .FCS ending"
  exit()
  
sample = FCMeasurement(ID=resultID, datafile=datafile)

#print "=================="
#print "...sample.channel_names... "
channel_names=sample.channel_names
#print len(channel_names)
print channel_names

findlist=[]
for x in channel_names :
  if x.find('Time') != -1 :
    findlist.append(x)
    continue
  if x.find('HLin') == -1 :
    continue
  findlist.append(x)

#print findlist

subset=sample.data[findlist]

##http://stackoverflow.com/questions/12065885/how-to-filter-the-dataframe-rows-of-pandas-by-within-in
#subset's type is <class 'pandas.core.frame.DataFrame'>
#print type(subset)
#print subset[:2]

#f = open(resultID+".csv", 'w')
#csv =subset.to_csv()
#f.write(csv)
#f.close()

f = open(resultID+".json", 'w')
json =subset.to_json()
f.write(json)
f.close()

#figure();
#sample.plot('Yellow Fluorescence (YLW-HLog)');
#sample.plot('Green Fluorescence (GRN-HLin)');
#sample.plot(['Forward Scatter (FSC-HLog)']);
#sample.plot(['Red Fluorescence (RED-HLog)']);
#sample.plot(['Forward Scatter (FSC-HLin)', 'Red Fluorescence (RED-HLin)']);
#sample.plot(['Green Fluorescence (GRN-HLin)', 'Red Fluorescence (RED-HLin)']);
#show();



