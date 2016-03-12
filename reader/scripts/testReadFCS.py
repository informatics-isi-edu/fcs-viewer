#!/usr/bin/env python
import os
import sys

import fcsparser
path='usc4/exp_021916kv.EP5.FCS'
#path='expGraph/exp_122115kv1.EP5.FCS'

def get_one_fcs(track_nextdata) :
  meta, data = fcsparser.parse(path, dataset_start=track_nextdata, reformat_meta=False)
  print "sampleID:",meta['GTI$SAMPLEID']

  if (meta['$NEXTDATA'] == 0):
    return -1;
  else:
    return track_nextdata+ meta['$NEXTDATA']

############ main ############################
file_size = os.path.getsize(path)

print "calling to extract just the first one.."
get_one_fcs(0)

print "calling to extract all of them.."
n=0
while (n != -1 and n < file_size):
    n=get_one_fcs(n)

