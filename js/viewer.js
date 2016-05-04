//
// fcs-viewer
//
// Usage example:
//  http://localhost/plotly/view.html?
//     http://localhost/data/plotly/exp_122115kv1.EP5.json
//
//  http://localhost/plotly/view.html?
//     url=http://localhost/data/plotly/exp_122115kv1.EP5.json&gateX=10&gateY=40
//


var saveMixPlot=null;
var saveXPlot=null;
var saveYPlot=null;
var saveScatterPlot=null;
var saveGatedScatterPlot=null;
var saveGatedMixedScatterPlot=null;

var saveBlob=null;
var saveFirst=true;
var inLog=true;

var slider_X_dirty=false;
var slider_Y_dirty=false;
var saveKeyX=null;
var saveKeyY=null;
var savePlotP=null;

var saveSliders=[];

// this is for the default initial plot display
var initPlot_plot=DEFAULT_PLOT;
var initPlot_gateX=DEFAULT_GATEX;
var initPlot_gateY=DEFAULT_GATEY;
var initPlot_keyX=DEFAULT_CHANNEL1;
var initPlot_keyY=DEFAULT_CHANNEL2;
var initPlot_gateNames=DEFAULT_GATENAMES;
var initPlot_titles=DEFAULT_TITLES;

// should be a very small file and used for testing and so can ignore
// >>Synchronous XMLHttpRequest on the main thread is deprecated
// >>because of its detrimental effects to the end user's experience.
function ckExist(url) {
  var http = new XMLHttpRequest();
  http.onreadystatechange = function () {
    if (this.readyState == 4) {
 // okay
    }
  }
  http.open("GET", url, false);
  http.send();
  if(http.status !== 404) {
    return http.responseText;
    } else {
      return null;
  }
};

// for sure that it is X.json
function chopForStub(url){
  var s=url.split('/').pop();
  var ss=s.slice(0, -5);
  return ss;
}

// fname is simple json data file converted
// directly from FCS file
// {"Forward Scatter (FSC-HLin)":{"0":845.9114379883,"1":560.092590332,
function loadBlobFromJsonFile(fname) {
  var tmp=ckExist(fname);
  var blob=(JSON.parse(tmp));
  return blob;
}


/*****MAIN*****/
jQuery(document).ready(function() {

$('.plot-list-select2').select2({theme:"classic"});
$('.data-list-select2').select2({theme:"classic"});
$('.x-list-select2').select2({theme:"classic"});
$('.y-list-select2').select2({theme:"classic"});

  var blob=null;
  var dataKeys=null;
  var fstub=DEFAULT_FCS;

  // defaults from viewer-user.js
  saveKeyX=DEFAULT_CHANNEL1;
  saveKeyY=DEFAULT_CHANNEL2;
  savePlotP=DEFAULT_PLOT;

  var args=document.location.href.split('?');
//http://localhost/plotly/view.html?http://localhost/data/plotly/inf_072514.EP5.json
  if (args.length === 2) {
     var url=processArgs(args);
     fstub=chopForStub(url);
     blob=loadBlobFromJsonFile(url);
     saveBlob=blob;
     dataKeys=setupUI(blob);
     slider_X_dirty=true;
     slider_Y_dirty=true;
     } else {
       alertify.error("Usage: view.html?http://datapath/data.json");
       return;
/*
       var nfstub=setupDataListWithInner();
       blob=loadBlobFromInner(nfstub);
       saveBlob=blob;
       dataKeys=setupUI(blob);
       slider_X_dirty=true;
       slider_Y_dirty=true;
*/
  }

  $('#x-list').change(function() {
    var xkey = document.getElementById("x-list").value;
    if(xkey === saveKeyX) {
      // no change
      } else {
      slider_X_dirty=true;
      updatePlot(blob,xkey,saveKeyY,savePlotP);
    }
  });
  $('#y-list').change(function() {
    var ykey = document.getElementById("y-list").value;
    if(ykey === saveKeyY) {
      // no change
      } else {
      slider_Y_dirty=true;
      updatePlot(blob,saveKeyX,ykey,savePlotP);
    }
  });
  $('#data-list').change(function() {
    var ddata = document.getElementById("data-list").value;
    if(ddata === fstub) {
      // no need to do anything
      } else {
        fstub=ddata;
        blob=loadBlobFromInner(fstub);
        slider_X_dirty=true;
        slider_Y_dirty=true;
        updatePlot(blob,saveKeyX,saveKeyY,savePlotP);
    }
  });
  $('#plot-list').change(function() {
    var ptype = document.getElementById("plot-list").value;
    if(ptype === savePlotP) {
      // no need to do anything
      } else {
        updatePlot(blob,saveKeyX,saveKeyY,ptype);
    }
  });

// initial plot
   if(!enableEmbedded) {
     displayInitPlot(blob);
   }
})

// under chaise/angular, the plot window has
// width/height=0 when accordian-group is-open=false
window.onresize=function() {
   if(enableEmbedded) {
     if(saveFirst) {
       reset2InitPlot();
       saveFirst=false;
     }
   }
}

// initial plot to display
function displayInitPlot(blob) {
  slider_X_dirty=true;
  slider_Y_dirty=true;
  $('#plot-list').val(savePlotP).trigger('change');;
  updatePlot(blob,saveKeyX,saveKeyY,savePlotP);
  resetSliderMinValues("#channel1_slider",initPlot_gateX);
  resetSliderMinValues("#channel2_slider",initPlot_gateY);
  xRangeClick();
  yRangeClick();
}

// initial plot to display
function reset2InitPlot() {
  // also, update channel lists' select
  //       update plot list's select
  blob=saveBlob;
  saveKeyX=initPlot_keyX;
  $('#x-list').val(saveKeyX).trigger('change');;
  saveKeyY=initPlot_keyY;
  $("#y-list").val(saveKeyY).trigger('change');;
  savePlotP=initPlot_plot;
  $('#plot-list').val(savePlotP).trigger('change');;
  displayInitPlot(blob);
}


function updatePlot(blob,keyX,keyY,plotP) {
  $('#myViewer').empty();
  // reset this
  var yplot = document.getElementById('channel2');
  yplot.style.display = '';
  saveSliders=[];
  saveMixPlot=null;
  saveXPlot=null;
  saveYPlot=null;
  saveScatterPlot=null;
  saveGatedScatterPlot=null;
  saveGatedMixedScatterPlot=null;
  saveBlob=blob;
  savePlotP=plotP;
  saveKeyY=keyY;
  saveKeyX=keyX;
  switch (plotP) {
    case 'mixed' :
      disableRangeSliders();
      addMixed(blob, keyX, keyY);
      break;
    case 'twod' :
      disableRangeSliders();
      addTwoD(blob, keyX, keyY);
      break;
    case 'gtwod' :
      enableSlidersWithFixedMin();
      addGTwoD(blob, keyX, keyY);
      break;
    case 'gmtwod' :
      enableSlidersWithFixedMin();
      addGMTwoD(blob, keyX, keyY);
      break;
    case 'histograms':
      enableRangeSliders();
      addHistograms(blob, keyX, keyY);
      break;
    case 'ahistogram':
      enableRangeSliders();
      addAHistogram(blob, keyX);
      break;
  }
  // always reset it
  if(slider_X_dirty) {
    slider_X_dirty=false;
    resetSliderRange("#channel1_slider");
  }
  if(slider_Y_dirty && (plotP !== "ahistogram") ) {
    slider_Y_dirty=false;
    resetSliderRange("#channel2_slider");
  }
}


// FUN-O
function animateByTimeClick() {
  var max=2000;
  var step=100;
  var i=1;

  var i_id=setInterval(function() {
    var _maxIdx=i*step;
    i=i+1;

    var _x=rangeItByTime(saveKeyX,0,_maxIdx);
    var _y=rangeItByTime(saveKeyY,0,_maxIdx);
    switch (savePlotP) {
        case 'ahistogram': // there is just one histogram plot
          var r1=rangeOfHistogram(saveXPlot);
          gateItHistogram(saveXPlot,_x, r1[0], r1[1]);
          resetSliderRange("#channel1_slider");
          resetHistogramThreshold(saveXPlot);
          break;
        case 'histograms': // there are two of the plots
          var r1=rangeOfHistogram(saveXPlot);
          var r2=rangeOfHistogram(saveYPlot);
          gateItHistogram(saveXPlot,_x, r1[0], r1[1]);
          gateItHistogram(saveYPlot,_y, r2[0], r2[1]);
          resetSliderRange("#channel1_slider");
          resetSliderRange("#channel2_slider");
          resetHistogramThreshold(saveXPlot);
          resetHistogramThreshold(saveYPlot);
          break;
        case 'mixed':
          var r=rangeOfMixed(saveMixPlot);
          gateItMixed(saveMixPlot,_x,_y,r[0],r[1],r[2],r[3]);
          break;
        case 'twod':
          var r=rangeOfScatter(saveScatterPlot);
          gateItScatter(saveScatterPlot,_x,_y,r[0],r[1]);
          break;
        case 'gtwod':
          var r=rangeOfScatter(saveGatedScatterPlot);
          var val = jQuery('#channel1_slider').slider("option", "values");
          var gateX=val[0];
          val = jQuery('#channel2_slider').slider("option", "values");
          var gateY=val[0];
          gateItGatedScatter(saveGatedScatterPlot,_x,_y,r[0],r[1],gateX,gateY);
          break;
        case 'gmtwod':
          var r=rangeOfScatter(saveGatedMixedScatterPlot);
          var val = jQuery('#channel1_slider').slider("option", "values");
          var gateX=val[0];
          val = jQuery('#channel2_slider').slider("option", "values");
          var gateY=val[0];
          gateItMixedGatedScatter(saveGatedMixedScatterPlot,_x,_y,r[0],r[1],gateX,gateY);
          break;
    }
       if (_maxIdx > max)
           clearInterval(i_id);
    }, 10);
}
