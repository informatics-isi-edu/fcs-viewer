#!/usr/bin/env python
##
##
## Given a raw master FCS,
##   explode into multiple single-dataset FCS files
##   generate JSON files and statistic cvs files for visualization  
##
## usage: ./processRawFCS.py dir/exp_010214m.EP5.FCS outdir [ oneUp ]
##
##     will produce outdir/exp_010214m.EP5.FCS_sampleID.FCS
##     will produce outdir/exp_010214m.EP5.FCS_sampleID.json
##     will produce outdir/exp_010214m.EP5.FCS_sampleID.csv
##     will produce outdir/exp_010214m.EP5.FCS_sampleID_m.csv
##

import os
import sys
#import pdb
import json
import math

import matplotlib
matplotlib.use("Pdf")

from FlowCytometryTools import *
from pylab import *

import fcsparser

delimiter="/"

###########################################################
if(len(sys.argv) < 3) : 
  print "Usage: processRawFCS.py fcsfile outdir [ oneUp ]"
  exit()

datafile=sys.argv[1]
dfile=os.path.basename(datafile)
dirname=os.path.dirname(datafile)
oneOnly=False

if dfile.endswith('.FCS') or dfile.endswith('.fcs'):
  resultID = dfile[:-4]
else:
  print "needs a filename with .FCS ending"
  exit()

outdir=sys.argv[2]

if not os.path.exists(outdir):
  os.mkdir(outdir)

if(len(sys.argv) > 3):
  oneOnly=True

###########################################################
def processOne(target):
    subset, sample=getSampleSubset(resultID, target)
    genJsonFile(target, subset)
    genCSVStatisticsFile(target, sample)
    genCSVMetadataFile(target,sample)

###########################################################

def getStats(qq_data):
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
    return tt

def makeChannelList(channel_names):
    alist=[]
    for x in channel_names :
      if x.find('Time') != -1 :
        alist.append(x)
        continue
      if x.find('HLin') == -1 :
        continue
      alist.append(x)
    return alist;

def getSampleSubset(resultID, datafile):
    sample = FCMeasurement(ID=resultID, datafile=datafile)
    channel_names=sample.channel_names
    findlist=makeChannelList(channel_names);
    subset=sample.data[findlist]
    return subset,sample

################### write json channel file ###################
def genJsonFile(target, subset):
    f = open(target+".json", 'w')
    json_str =subset.to_json()
    json_obj=json.loads(json_str)
    f.write(json.dumps(json_obj))
    f.close()

################### write csv statistics file ###################
def genCSVStatisticsFile(target, sample):
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

    expr_gating=ThresholdGate(1.3,'Green Fluorescence (GRN-HLog)', region='above')

    gated_sample = sample.gate(Q1_gating)
    g1_data=gated_sample.data[['Green Fluorescence (GRN-HLog)']]
    gated_sample = sample.gate(Q2_gating)
    g2_data=gated_sample.data[['Green Fluorescence (GRN-HLog)']]
    gated_sample = sample.gate(Q3_gating)
    g3_data=gated_sample.data[['Green Fluorescence (GRN-HLog)']]
    gated_sample = sample.gate(Q4_gating)
    g4_data=gated_sample.data[['Green Fluorescence (GRN-HLog)']]
    
    gated_sample = sample.gate(expr_gating)
    expr_data=gated_sample.data[['Green Fluorescence (GRN-HLog)']]

#"--------NEDC------------"
    ss=getStats(g1_data)
    f.write(ss)
    f.write("\n")
#"--------EDC------------"
    ss=getStats(g2_data)
    f.write(ss)
    f.write("\n")
#"--------NELC------------"
    ss=getStats(g3_data)
    f.write(ss)
    f.write("\n")
#"--------ELC------------"
    ss=getStats(g4_data)
    f.write(ss)
    f.write("\n")
#"--------EXPR------------"
    ss=getStats(expr_data)
    f.write(ss)
    f.write("\n")
    f.close()

################### write csv metadata file ###################
def genCSVMetadataFile(target, sample):
    f = open(target+"_m.csv", 'w')
    meta=sample.meta
## remove __original__ and __header__
    del meta['__header__']
    del meta['__original__']
    k=sample.meta.keys()
    kk=delimiter.join(k)
    f.write(kk)
    f.write("\n")
    v=sample.meta.values()
## This is the 'internally edited' meta value set and so some are integers
    vv=delimiter.join(str(x) for x in v)
    f.write(vv)
    f.write("\n")
    f.close()

####################MAIN###################################
if __name__ == "__main__":
  if oneOnly :
      nextdata, newfile  = fcsparser.rewrite(datafile, outdir, dataset_start=0)
      processOne(newfile)
  else:
      n=0
      nextdata=-1
      file_size = os.path.getsize(datafile)
      while (nextdata != 0 and n < file_size):
          nextdata, newfile=fcsparser.rewrite(datafile, outdir, dataset_start=n)
          n=nextdata+n
          processOne(newfile)

