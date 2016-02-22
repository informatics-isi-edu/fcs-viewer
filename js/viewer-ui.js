/* event/message linkup with chaise */

// A flag to track whether plotly viewer is
// being used inside another window (i.e. Chaise), set enableEmbedded.

var enableEmbedded = false;
/* XXXX short circuit it for now..
if (window.self !== window.top) {
    enableEmbedded = true;
}
*/

//[ "Forward Scatter (FSC-HLin)", "Side Scatter (SSC-HLin)",
//  "Green Fluorescence (GRN-HLin)", "Yellow Fluorescence (YLW-HLin)",
//  "Red Fluorescence (RED-HLin)" ]
function getKeys(blob) {
  var keys = Object.keys(blob);
  return keys;
}

function setupUI(blob) {
  var dataKeys=getKeys(blob);
  if(!enableEmbedded) {
    /* enable control and annotations buttons */
    var bElm = document.getElementById('controlBlock');
    if(bElm)
      bElm.style.display = '';
      setupDropDowns(dataKeys);
      setupSliders(blob);
    } else {
// send to outside 'window'
      postChannelList('onChannelList', dataKeys);
  }
  return dataKeys;
}

/*********************************************************/
// post outgoing message events to Chaise,
/*********************************************************/
function postChannelList(mType, cList) {
  if (enableEmbedded) {
    window.top.postMessage({messageType: mType, content: cList}, window.location.origin);
  }
}

/*********************************************************/
// An event listener to capture incoming messages from Chaise
/*********************************************************/
window.addEventListener('message', function(event) {
    if (event.origin === window.location.origin) {
        var messageType = event.data.messageType;
        var data = event.data.content;
        switch (messageType) {
            case 'downloadView':
                jpgClick(data.outfile);
                break;
            case 'fcsBlob':
                var blob=data.blob;
                break;
/*
XXXX
*/

            default:
                console.log('Invalid message type. No action performed. Received message event: ', event);
        }
    } else {
        console.log('Invalid event origin. Event origin: ', origin, '. Expected origin: ', window.location.origin);
    }
});


