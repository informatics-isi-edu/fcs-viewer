#!/usr/bin/env python

import os
import sys
import pdb
import json
import sys

import fcsparser

path='usc4/exp_021916kv.EP5.FCS'
#path='expGraph/exp_122115kv1.EP5.FCS'

def write_one_fcs(track_nextdata) :
  nextdata, newfname  = fcsparser.rewrite(path, '.',  dataset_start=track_nextdata)

  print newfname

  if (nextdata ==0 ):
    return -1;
  else:
    return track_nextdata+ nextdata

############ main ############################
file_size = os.path.getsize(path)

print "calling to extract just the first one.."
write_one_fcs(0)

print "calling to extract all of them.."
n=0
while (n != -1 and n < file_size):
    n=write_one_fcs(n)
