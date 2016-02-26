#!/usr/bin/env python

## usage: ./FCS2JSON.py dir/exp_010214m.EP5.FCS
##        will produce dir/exp_010214m.EP5.json
##
## usage: ./FCS2JSON.py dir/exp_010214m.EP5.FCS outdir
##        will produce  outdir/exp_010214m.EP5.json
##

import os
import sys
#import pdb
import json

import matplotlib
matplotlib.use("Pdf")

from FlowCytometryTools import *
from pylab import *

if(len(sys.argv) < 2) : 
  print "needs a filename.."
  exit()

datadir = './'
datafile=sys.argv[1]

dfile=os.path.basename(datafile)
dirname=os.path.dirname(datafile)

if dfile.endswith('.FCS') or dfile.endswith('.fcs'):
  resultID = dfile[:-4]
else:
  print "needs a filename with .FCS ending"
  exit()

if(len(sys.argv) > 2):
  outdir=sys.argv[2]
else:
  outdir=dirname

#pdb.set_trace()
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
#pdb.set_trace()

##http://stackoverflow.com/questions/12065885/how-to-filter-the-dataframe-rows-of-pandas-by-within-in
#subset's type is <class 'pandas.core.frame.DataFrame'>
#print type(subset)
#print subset[:2]

target=os.path.join(outdir,resultID)

#f = open(target+".csv", 'w')
#csv =subset.to_csv()
#f.write(csv)
#f.close()


f = open(target+".json", 'w')
json_str =subset.to_json()
#print type(json_str)
json_obj=json.loads(json_str)

#meta_str=json.dumps(sample.meta);
#json_obj['meta']= meta_str;
#print type(json_obj)

f.write(json.dumps(json_obj))
f.close()

#figure();
#sample.plot('Yellow Fluorescence (YLW-HLog)');
#sample.plot('Green Fluorescence (GRN-HLin)');
#sample.plot(['Forward Scatter (FSC-HLog)']);
#sample.plot(['Red Fluorescence (RED-HLog)']);
#sample.plot(['Forward Scatter (FSC-HLin)', 'Red Fluorescence (RED-HLin)']);
#sample.plot(['Green Fluorescence (GRN-HLin)', 'Red Fluorescence (RED-HLin)']);
#show();



