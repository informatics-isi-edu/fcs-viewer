# fcs-viewer

Plotly based viewer for FCS data (converted to json from FCS file format with https://github.com/informatics-isi-edu/fcsparser)

## Overview

fcs-viewer takes a json file as an input and additional parameters and creates an interactive plot using plot.ly JavaScript plotting routines.

## Download and Run 

You can clone the source repository with Git by running:

  git clone https://github.com/informatics-isi-edu/fcs-viewer.git

and invoke the viewer as in **Examples**


## File Formats

The viewer assumes a simple json file format.  File is specified by a URL.

sample format:
```
{"Forward Scatter (FSC-HLin)":{"0":1739.2248535156,"1":2656.79296875,"2":1583.3237304688,"3":1781.1076660156,...},
"Side Scatter (SSC-HLin)":{"0":530.9240722656,"1":1181.3438720703,"2":634.9689941406,"3":524.6041870117,...},
"Green Fluorescence (GRN-HLin)":{"0":19.0221328735,"1":21.1541976929,"2":13.9483947754,"3":84.3982086182,...},
"Yellow Fluorescence (YLW-HLin)":{"0":1.184753418,"1":1.2171630859,"2":1.184753418,"3":1.1866760254,...},
"Red Fluorescence (RED-HLin)":{"0":1.0,"1":3.4778060913,"2":8.3005981445,"3":1.9571151733,...},
"Time":{"0":1196.0,"1":1218.0,"2":3200.0,"3":3347.0,"4":3372.0,"5":3936.0,"6":4069.0,"7":4204.0,...}}
```

## Invoking fcs-viewer

Paremeters may be passed to fcs-viewer as a URL query parameter.  

| Parameter | Value | Description |
| --- | --- | --- |
| **url** | URL | url of a json datafiles |
| **gateX** | int | set initial X gate value to log(gateX), default log(20) |
| **gateY** | int | set initial Y gate value to log(gateY), default log(30) |

## Examples 

Plotting a single data file with default gates

```
view.html?
   http://localhost/data/exp_010214m.EP5.FCS_s3673_13480_1.json
or
view.html?
   url=http://localhost/data/exp_010214m.EP5.FCS_s3673_13480_1.json

```

Plotting a single data file with user defined gates

```
view.html?
   url=http://localhost/data/exp_010214m.EP5.FCS_s3673_13480_1.json&
   gateX=100&
   gateY=10
```

Sample plot is in sample.png

