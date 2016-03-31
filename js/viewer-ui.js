// A flag to track whether plotly viewer is
// being used inside another window (i.e. Chaise), set enableEmbedded.

var enableEmbedded = false;
if (window.self !== window.top) {
    enableEmbedded = true;
}

//[ "Forward Scatter (FSC-HLin)", "Side Scatter (SSC-HLin)",
//  "Green Fluorescence (GRN-HLin)", "Yellow Fluorescence (YLW-HLin)",
//  "Red Fluorescence (RED-HLin)" ]
function getKeys(blob) {
  var keys = Object.keys(blob);
  return keys;
}

function setupUI(blob) {
  var dataKeys=getKeys(blob);
  /* enable control and annotations buttons */
  var bElm = document.getElementById('controlBlock');
  if(bElm) {
    bElm.style.display = '';
    setupDropDowns(dataKeys);
    setupSliders(blob);
  }
  return dataKeys;
}
