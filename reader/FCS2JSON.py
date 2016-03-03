#!/usr/bin/env python
# usage: ./FCS2JSON.py dir/exp_010214m.EP5.FCS
##        will produce dir/exp_010214m.EP5.json
##
## usage: ./FCS2JSON.py dir/exp_010214m.EP5.FCS outdir
##        will produce  outdir/exp_010214m.EP5.json
##

import os
import sys
#import pdb
import json
import math

import matplotlib
#matplotlib.use("Pdf")

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

def stats(qq_data,ff):
#print qq_data.describe()
    p=qq_data.mean()[0]
    mean=int(pow(10,p))
    p=qq_data.median()[0]
    median=int(pow(10,p))
    p=qq_data.count()[0]
    percentTotal=int(round((p*100)/ float(2000)))
    max=round(qq_data.max()[0],3)
    min=round(qq_data.min()[0],3)
    count=qq_data.count()[0]
    t=[str(percentTotal),str(mean),str(median),str(max),str(min),str(count)]
    tt=",".join(t)
#    print tt
    ff.write(tt)
    ff.write("\n")

#pdb.set_trace()
sample = FCMeasurement(ID=resultID, datafile=datafile)

#print "=================="
#print "...sample.channel_names... "
channel_names=sample.channel_names
#print len(channel_names)
#print channel_names

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

################### write csv statistics file ###################
f = open(target+".csv", 'w')
t="percentTotal,mean,median,max,min,count"
f.write(t)
f.write("\n")

## gating
x1_gate = ThresholdGate(1.3,'Green Fluorescence (GRN-HLog)', region='below')
y1_gate = ThresholdGate(1.48, 'Red Fluorescence (RED-HLog)', region='above')

x2_gate = ThresholdGate(1.3,'Green Fluorescence (GRN-HLog)', region='above')
y2_gate = ThresholdGate(1.48, 'Red Fluorescence (RED-HLog)', region='above')

x3_gate = ThresholdGate(1.3,'Green Fluorescence (GRN-HLog)', region='below')
y3_gate = ThresholdGate(1.48, 'Red Fluorescence (RED-HLog)', region='below')

x4_gate = ThresholdGate(1.3,'Green Fluorescence (GRN-HLog)', region='above')
y4_gate = ThresholdGate(1.48, 'Red Fluorescence (RED-HLog)', region='below')


Q1_gating=x1_gate & y1_gate
Q2_gating=x2_gate & y2_gate
Q3_gating=x3_gate & y3_gate
Q4_gating=x4_gate & y4_gate

gated_sample = sample.gate(Q1_gating)
g1_data=gated_sample.data[['Green Fluorescence (GRN-HLog)']]
gated_sample = sample.gate(Q2_gating)
g2_data=gated_sample.data[['Green Fluorescence (GRN-HLog)']]
gated_sample = sample.gate(Q3_gating)
g3_data=gated_sample.data[['Green Fluorescence (GRN-HLog)']]
gated_sample = sample.gate(Q4_gating)
g4_data=gated_sample.data[['Green Fluorescence (GRN-HLog)']]

#print "--------NEDC------------"
stats(g1_data,f)
#print "--------EDC------------"
stats(g2_data,f)
#print "--------NELC------------"
stats(g3_data,f)
#print "--------ELC------------"
stats(g4_data,f)

f.close()

#figure();
#sample.plot('Yellow Fluorescence (YLW-HLog)');
#sample.plot('Green Fluorescence (GRN-HLin)');
#sample.plot(['Forward Scatter (FSC-HLog)']);
#sample.plot(['Red Fluorescence (RED-HLog)']);
#sample.plot(['Green Fluorescence (GRN-HLog)', 'Red Fluorescence (RED-HLog)']);
#gated_sample.plot(['Green Fluorescence (GRN-HLog)', 'Red Fluorescence (RED-HLog)']);
#sample.plot(['Forward Scatter (FSC-HLin)', 'Red Fluorescence (RED-HLin)']);
#sample.plot(['Green Fluorescence (GRN-HLin)', 'Red Fluorescence (RED-HLin)']);
#show();
