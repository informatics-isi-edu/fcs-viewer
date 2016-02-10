// this is very user/dataset specific information

// to be use to display on the ploat
// KEYLIST['full key']='shorten key'
var KEYLIST= { "Forward Scatter (FSC-HLin)": "Forward Scatter",
               "Side Scatter (SSC-HLin)": "Side Scatter",
               "Green Fluorescence (GRN-HLin)": "Green Fluorenscene",
               "Yellow Fluorescence (YLW-HLin)": "Yellow Fluorescence",
               "Red Fluorescence (RED-HLin)": "Red Fluorescence" };

// key that is not to be used in ploting at this point 
var SKIPKEYS= { "Time": "Time" };

var DEFAULTCHANNEL1='Forward Scatter (FSC-HLin)';
var DEFAULTCHANNEL2='Red Fluorescence (RED-HLin)';
var DEFAULTFCS='inf_072514.EP5';
