//
// fcs-viewer
//
// This is very user/dataset specific information
// for, USC

// to be use to display on the plot
// KEYLIST['full key']='shorten key'
var KEYLIST= { "Forward Scatter (FSC-HLin)": "Forward Scatter",
               "Side Scatter (SSC-HLin)": "Side Scatter",
               "Green Fluorescence (GRN-HLin)": "Green Fluorescence",
               "Yellow Fluorescence (YLW-HLin)": "Yellow Fluorescence",
               "Red Fluorescence (RED-HLin)": "Red Fluorescence" };

// key that is not to be used in plotting at this point 
var SKIPKEYS= { "Time": "Time" };

var DEFAULT_CHANNEL1='Green Fluorescence (GRN-HLin)';
var DEFAULT_CHANNEL2='Red Fluorescence (RED-HLin)';
var DEFAULT_CHANNEL1_TRIM='Green Fluorescence';
var DEFAULT_CHANNEL2_TRIM='Red Fluorescence';
var DEFAULT_PLOT='gmtwod';
var DEFAULT_FCS='inf_072514.EP5';
var DEFAULT_GATEX=Math.round(Math.log10(20)*100)/100;
var DEFAULT_GATEY=Math.round(Math.log10(30)*100)/100;
var DEFAULT_GATENAMES=['NEDC','EDC','NELC','ELC'];
var DEFAULT_TITLES=['Expression','cellDeath'];


function trimKey(key) {
  if(Object.keys(SKIPKEYS).indexOf(key)!= -1) // skip this in dropdown
    return null;
  if(Object.keys(KEYLIST).indexOf(key) != -1) {
     var s=KEYLIST[key];
     return s;
  }
  return null;
}

// default setting as initial preset
function setInitialQuadrantGateNames(xkey,ykey) {
  if(xkey === DEFAULT_CHANNEL1 && ykey === DEFAULT_CHANNEL2)
    return DEFAULT_GATENAMES;
  else
    return ['Q1','Q2','Q3','Q4'];
}

function setInitialTitles(xkey,ykey) {
  if(xkey === DEFAULT_CHANNEL1_TRIM && ykey === DEFAULT_CHANNEL2_TRIM)
    return DEFAULT_TITLES;
  else return [xkey+"(log)",ykey+"(log)"];
}

