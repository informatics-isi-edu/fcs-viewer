// http://localhost/plotly/view.html?http://localhost/data/plotly/YLW-HLin.json

var saveMixPlot=null;
var saveXPlot=null;
var saveYPlot=null;
var saveScatterPlot=null;
var saveBlob=null;
var inLog=true;

var slider_X_dirty=false;
var slider_Y_dirty=false;
var saveKeyX=null;
var saveKeyY=null;
var savePlotP=null;

var saveSliders=[];

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

function getHistogramAt(blob, key, color) {
  var s=blob[key];
  var x= Object.keys(s).map(function(k) { return parseFloat(s[k]) });
  var data= [ { "x": x, 
                "marker": { "color":color },
                "type" :"histogram" } ];
  return data;
}

// readup on : http://stackoverflow.com/questions/27334585/in-plotly-how-do-i-create-a-linked-x-axis

function getHistogramDefaultLayout(sample,key,range){
  var t="Histogram of "+key+ "<br> in "+sample;
  var tmp;
  if(range) {
    if(inLog) {
      tmp= { "title":key+"(log)", "range": range };
      } else {
        tmp= { "title":key, "range": range };
    }
    } else {
      if(inLog) {
        tmp= { "title":key+"(log)" };
        } else {
          tmp= { "title":key };
      }
  }
  var _height=300;
  if(savePlotP === 'ahistogram') {
    _height=600;
  }
  var p= {
        "width": 600,
        "height": _height,
        "xaxis": tmp,
        "yaxis": { "title":"Count"}
        };   
  return p;
}

function getScatterSetAt(blob, xkey, ykey) {
  var xs=blob[xkey];
  var x= Object.keys(xs).map(function(k) { return parseFloat(xs[k]) });
  var ys=blob[ykey];
  var y= Object.keys(ys).map(function(k) { return parseFloat(ys[k]) });
  var data= [ { "x": x,
                "y": y, 
                "mode": "markers",
                "marker": {
                    "color": "green",
                    "size": 10,
                    "line": {"color": "black", "width": 3},
                    "opacity": 0.7
                  },
                "type":"scatter" } ];
  return data;
}

function getScatterSetDefaultLayout(sample,xkey,ykey,xrange,yrange){
  var t= xkey+" vs "+ykey;
/*
 var xrange=[ 0.654, 0.889 ];
 var yrange=[ -1.349, 0.769 ];
 var xxrange=[ mm1[0], mm1[1] ]; // 4.668, 7.48
 var yyrange=[ mm2[0], mm2[1] ]; // 0, 4.28
*/
  var tmpx, tmpy;
  if(xrange && yrange) {
    tmpx= { "title":xkey+"(log)", "type":"log", "range": xrange };
    tmpy= { "title":ykey+"(log)", "type":"log", "range": yrange };
    } else {
      tmpx= { "title":xkey+"(log)", "type":"log" };
      tmpy= { "title":ykey+"(log)", "type":"log" };
//      tmpx= { "title":xkey+"(log)"};
//      tmpy= { "title":ykey+"(log)"};
  }
  var p= {
      "width": 600,
      "height": 600,
      "title": t,
      "plot_bgcolor": 'rgb(223, 223, 223)',
      "xaxis": tmpx,
      "yaxis": tmpy
      };   
  return p;
}

//https://plot.ly/javascript/2d-density-plots/
function getMixedSetAt(blob, xkey, ykey) {
  var xs=blob[xkey];
  var x= Object.keys(xs).map(function(k) { return parseFloat(xs[k]) });
  var ys=blob[ykey];
  var y= Object.keys(ys).map(function(k) { return parseFloat(ys[k]) });
/*
  var xrange=[ 0.654, 0.889 ];
  var yrange=[ -1.349, 0.769 ];
  var xxrange=[ 4.668, 7.48 ];
  var yyrange=[ 0, 4.28 ];
*/
  var data= [ { "x": x,
                "y": y, 
                "name": "points",
                "mode": "markers",
                "marker": {
                    "color": "green",
                    "size": 5,
                    "line": {"color": "black", "width": 1},
                    "opacity": 0.4
                },
                "type":"scatter" },
              { "x": x,
                "y": y, 
                "name": "points",
                "ncontours": 20,
                "colorscale": "Hot",
                "reversescale": true,
                "showscale": false,
                "type": "histogram2dcontour" },
              { "x": x,
                "name": "x count",
                 "marker": { "color": "blue"},
                 "yaxis": "y2",
                 "type": "histogram" },
              { "y": y,
                "name": "y count",
                 "marker": { "color": "red"},
                 "xaxis": "x2",
                 "type": "histogram" }
          ];
  return data;
}

function getMixedSetDefaultLayout(sample,xkey,ykey,xrange,yrange,xrange2,yrange2){
  var t= xkey+" vs "+ykey;
  var tmpx, tmpy, tmpx2, tmpy2;
  if(xrange) {
    tmpx= { "domain": [0, 0.85], "showgrid": true, "title": xkey,
              "range": xrange, "autorange":false, "zeroline": false };
    } else { 
      tmpx= { "domain": [0, 0.85], "showgrid": true, "title": xkey, 
              "zeroline": false };
  }
  if(yrange) {
    tmpy= { "domain": [0, 0.85], "showgrid": true, "title": ykey,
              "range": yrange,"autorange":false, "zeroline": false };
    } else {
      tmpy= { "domain": [0, 0.85], "showgrid": true, "title": ykey, "zeroline": false };
  }
  if(xrange2) {
    tmpx2 = { "domain": [0.85, 1], "showgrid": false,
              "range": xrange2, "autorange":false, "zeroline": false };
    } else {
      tmpx2 = { "domain": [0.85, 1], "showgrid": false, "zeroline": false };
  }

  if(yrange2) {
    tmpy2= { "domain": [0.85, 1], "showgrid": false,
              "range": yrange2, "autorange":false, "zeroline": false };
    } else {
      tmpy2= { "domain": [0.85, 1], "showgrid": false, "zeroline": false };
  }
  var p= {
      "width": 600,
      "height": 600,
      "title": t,
      "plot_bgcolor": 'rgb(223, 223, 223)',

      "showlegend": false,
      "autosize": false,
      "margin": {"t": 100},
      "hovermode": "closest",
      "bargap": 0,
      "xaxis": tmpx,
      "yaxis": tmpy,
      "xaxis2": tmpx2,
      "yaxis2": tmpy2
  };   
  return p;
}

// fname is plotly.js data json file
// including 'data' part and 'layout' part
//{
//   "data": [ { "x": [ 73.51636505, 17.98786163,..],"y": ],
//  "layout": { "title":.. }
//}     
function loadDataFromFile(fname) {
  var tmp=ckExist(fname);
  var blob=(JSON.parse(tmp));
  var d = blob ['data'];
  var p = blob ['layout'];
  return [d, p];
}

function logValue(data) {
  var n = data.map(function (v) {  
    return Math.log(v)
  }); 
  return n;
}

/* x, and y term needs to be changed */
function change2Log(datablob) {
  var cnt=datablob.length;
  for(i=0; i<cnt; i++) {
     var b=datablob[i];
     if(b['x']) {
        b['x']=logValue(b['x']);
     }
     if(b['y']) {
        b['y']=logValue(b['y']);
     }
  }
}
function minmaxOnChannel(blob, key) {
  var s=blob[key];
  var ss= Object.keys(s).map(function(k) { return parseFloat(s[k]) });
  var _max=Math.max.apply(Math,ss);
  var _min=Math.min.apply(Math,ss);
  _max=Math.log(_max);
  _min=Math.log(_min);
  window.console.log("getting minmax on "+key+" "+_min+" "+_max);
  return [_min, _max];
}

function getURL(args) {
  var params = args[1].split('&');
  for (var i=0; i < params.length; i++) {
    var param = unescape(params[i]);
    if (param.indexOf('=') == -1) {
      var url=param.replace(new RegExp('/$'),'').trim();
      return url;
      } else {
        var kvp = param.split('=');
        if(kvp[0].trim() == 'url') {
          var url=kvp[1].replace(new RegExp('/$'),'').trim();
          return url;
        }
    }
  }
  return null;
}

function addAPlot(divname, data, layout, w, h) {
  var d3 = Plotly.d3;
  var gd3 = d3.select(divname)
    .append('div')
    .style({
        width: w,
        height: h,
        visibility: 'inherit'
    });

  var gd = gd3.node();
  Plotly.newPlot(gd, data, layout);
  return gd;
}

function trimKey(key) {
  if(Object.keys(SKIPKEYS).indexOf(key)!= -1) // skip this in dropdown
    return null;
  if(Object.keys(KEYLIST).indexOf(key) != -1) {
     var s=KEYLIST[key];
     return s;
  }
  return null;
}

/***
XXXX
   console.log(new_x, new_y, new_z);

    plot.postMessage({
        task: 'restyle',
        update: {
            x: [new_x, new_x, new_x, NaN],
            y: [new_y, new_y, NaN, new_y],
            text: [new_z, [],
                [],
                []
            ]
        }
    }, 'https://plot.ly');
XXXX
***/

/* initial setup of the slider .. */
function setupSliders(blob) {

  var s=blob[DEFAULTCHANNEL1];
  var x=Object.keys(s).map(function(k) { return parseFloat(s[k]) });
  x=logValue(x);
  var _max=Math.round(Math.max.apply(Math,x)*1000)/1000;
  var _min=Math.round(Math.min.apply(Math,x)*1000)/1000;
  jQuery("#channel1_slider").slider({
    range: true,
    min: _min,
    step: 0.001,
    max: _max,
    disabled: false,
    values: [_min, _max],
    slide: function(event,ui) {
        $("#slider1Range").val(ui.values[0]+" - "+ui.values[1]);
    },
    change: function(event,ui) {
        $("#slider1Range").val(ui.values[0]+" - "+ui.values[1]);
    }
  });
  $("#slider1Range").val( _min+" - "+_max);

  s=blob[DEFAULTCHANNEL2];
  x=Object.keys(s).map(function(k) { return parseFloat(s[k]) });
  x=logValue(x);
  _max=Math.round(Math.max.apply(Math,x)*1000)/1000;
  _min=Math.round(Math.min.apply(Math,x)*1000)/1000;
  jQuery("#channel2_slider").slider({
    range: true,
    min: _min,
    step: 0.001,
    max: _max, 
    disabled: false,
    values: [_min, _max],
    slide: function(event,ui) {
        $("#slider2Range").val(ui.values[0]+" - "+ui.values[1]);
    },
    change: function(event,ui) {
        $("#slider2Range").val(ui.values[0]+" - "+ui.values[1]);
    }
  });
  $("#slider2Range").val( _min+" - "+_max);

  if (savePlotP ==='mixed' || savePlotP === 'twod') {
     jQuery("#channel1_slider").slider("option", "disabled",true);
     jQuery("#channel2_slider").slider("option", "disabled",true);
  }
}

function enableSliders() {
  jQuery("#channel1_slider").slider("option", "disabled",false);
  jQuery("#channel2_slider").slider("option", "disabled",false);
}
function disableSliders() {
  jQuery("#channel1_slider").slider("option", "disabled",true);
  jQuery("#channel2_slider").slider("option", "disabled",true);
}

function setSliderLimit(id,min,max) {
  var _max=Math.round(max *1000)/1000;
  var _min=Math.round(min *1000)/1000;
  jQuery(id).slider("option", "max", _max);
  jQuery(id).slider("option", "min", _min);
  jQuery(id).slider("option", "values", [_min,_max]);
}
 
function isEmpty(obj) {
  for (var x in obj) {
    if (obj.hasOwnProperty(x))  
      return false;
  }
  return true;
}

function resetSliderRange(id) {
window.console.log("resetSliderRange"+id);
  if(isEmpty(saveSliders)) {
    var min=jQuery(id).slider("option", "min");
    var max=jQuery(id).slider("option", "max");
    jQuery(id).slider("option", "values", [min,max]);
  }
  for (var i=0; i< saveSliders.length; i++) {
    var p=saveSliders[i];
    if(p[0]===id) {
      var min=p[1];
      var max=p[2];
      setSliderLimit(id,min,max);
      return;
    }
  }
window.console.log("PANIC...on slider maybe.."+id);
}

function stashSliderLimit(id,min,max) {
window.console.log("calling stash.."+id);
  setSliderLimit(id,min,max);
  saveSliders.push([id,min,max]); 
}

// process x axis's gating
function xRangeClick() {
  if(savePlotP !== "histograms" && savePlotP !== "ahistogram") {
    window.console.log("WARNING, can only gate histograms..");
    resetSliderRange("#channel1_slider");
    return;
  }
  var val = jQuery('#channel1_slider').slider("option", "values");
  var _x=rangeItByValue(saveKeyX,val[0], val[1]);
  var _r=rangeOfHistogram(saveXPlot);
  slider_X_dirty=true;
  gateItHistogram(saveXPlot,_x, _r[0], _r[1]);
}

function yRangeClick() {
  if(savePlotP !== "histograms") {
    window.console.log("WARNING, can only gate histograms..");
    resetSliderRange("#channel2_slider");
    return;
  }
  var val = jQuery('#channel2_slider').slider("option", "values");
  var _y=rangeItByValue(saveKeyY,val[0], val[1]);
  var _r=rangeOfHistogram(saveYPlot);
  slider_Y_dirty=true;
  gateItHistogram(saveYPlot,_y,_r[0],_r[1]);
}

function setupDropDowns(keys) {
  var xlist = document.getElementById('x-list');
  var ylist = document.getElementById('y-list');
  var _xlist = '';
  var _ylist = '';
  for (var i = 0; i < keys.length; i++) {
    var _k=trimKey(keys[i]);
    if(_k) {
      if(keys[i]==DEFAULTCHANNEL2) {
        _ylist += '<option selected="selected" value="' + keys[i] + '">' + _k + '</option>';
        } else {
        _ylist += '<option value="' + keys[i] + '">' + _k + '</option>';
      }
      if(keys[i]==DEFAULTCHANNEL1) {
        _xlist += '<option selected="selected" value="' + keys[i] + '">' + _k + '</option>';
        } else {
        _xlist += '<option value="' + keys[i] + '">' + _k + '</option>';
      }
    }
  }
  xlist.innerHTML = _xlist;
  ylist.innerHTML = _ylist;

  var plist = document.getElementById('plot-list');
  var _plist = '<option selected="selected" value="' + 'mixed' + '">' + 'mixed plots' + '</option>';
      _plist += '<option value="' + 'twod' + '">' + '2d scatter' + '</option>';
      _plist += '<option value="' + 'histograms' + '">' + 'histograms' + '</option>';
      _plist += '<option value="' + 'ahistogram' + '">' + 'a histogram' + '</option>';
  plist.innerHTML = _plist;
}

function setupDataListWithInner() {
  var ddata = document.getElementById('demoData');
  ddata.style.display = '';
  var dlist = document.getElementById('data-list');
  var _dlist = '<option selected="selected" value="' + 'inf_072514.EP5' + '">' + 'inf_072514.EP5.FCS' + '</option>';
      _dlist += '<option value="' + 'exp_012116kv.EP5' + '">' + 'exp_012116kv.EP5.FCS' + '</option>';
  dlist.innerHTML = _dlist;
  return dlist.value;
} 

function setupDataListWithFstub(fstub) {
  var ddata = document.getElementById('demoData');
  ddata.style.display = '';
  var dlist = document.getElementById('data-list');
  var _dlist = '<option selected="selected" value="' + fstub + '">' + fstub + '</option>';
  dlist.innerHTML = _dlist;
} 

function allHistograms(fstub, blob, keys) {
  for(var i=0; i<cnt; i++) {
     var key=keys[i];
     var _data=getHistogramAt(blob, key);
     change2Log(_data);
     var _layout=getHistogramDefaultLayout(fstub,key,null);
     var dummy=addAPlot('#myViewer',_data, _layout, 450, 300);
  }
}

// a single histogram
function addAHistogram(fstub, blob, key) {
  // always reset
  var yplot = document.getElementById('channel2');
  yplot.style.display = 'none';
  saveYPlot=null;

  var _data=getHistogramAt(blob, key,'blue');
  if(inLog) {
    change2Log(_data);
  }

  var tmp=_data[0]['x'];
  var _max=Math.max.apply(Math,tmp);
  var _min=Math.min.apply(Math,tmp);
  slider_X_dirty=true;
  stashSliderLimit("#channel1_slider", _min, _max);

  var _layout=getHistogramDefaultLayout(fstub,trimKey(key), [_min,_max]);

  saveXPlot=addAPlot('#myViewer',_data, _layout,600,600);
}

// histograms
function addHistograms(fstub, blob, keyX, keyY) {
  var _data=getHistogramAt(blob, keyX,'blue');
  change2Log(_data);

  var tmpX=_data[0]['x'];
  var _max1=Math.max.apply(Math,tmpX);
  var _min1=Math.min.apply(Math,tmpX);
  if(slider_X_dirty) {
      slider_X_dirty=false;
      stashSliderLimit("#channel1_slider", _min1, _max1);
  }

  var _data2=getHistogramAt(blob, keyY,'red');
  change2Log(_data2);

  var tmpY=_data2[0]['x'];
  var _max2=Math.max.apply(Math,tmpY);
  var _min2=Math.min.apply(Math,tmpY);
  if(slider_Y_dirty) {
      slider_Y_dirty=false;
      stashSliderLimit("#channel2_slider", _min2, _max2);
  }

  var _max=(_max1>_max2)?_max1:_max2;
  var _min=(_min1<_min2)?_min1:_min2;

  var _layout=getHistogramDefaultLayout(fstub,trimKey(keyX), [_min,_max]);
  var _layout2=getHistogramDefaultLayout(fstub,trimKey(keyY), [_min,_max]);

  saveXPlot=addAPlot('#myViewer',_data, _layout,450,300);
  saveYPlot=addAPlot('#myViewer',_data2, _layout2,450,300);
}

function rangeOfHistogram(oldPlot) {
    var oldDiv=oldPlot;
    var r1=oldDiv.layout.xaxis.range;
    var r2=oldDiv.layout.yaxis.range;
    return [r1, r2];
}

function rangeOfMixed(oldPlot) {
    var oldDiv=oldPlot;
    var a=oldDiv.layout.xaxis.range;
    var b=oldDiv.layout.yaxis.range;
    var c=oldDiv.layout.xaxis2.range;
    var d=oldDiv.layout.yaxis2.range;
    return [a,b,c,d];
}

function rangeOfScatter(oldPlot) {
    var oldDiv=oldPlot;
    var a=oldDiv.layout.xaxis.range;
    var b=oldDiv.layout.yaxis.range;
    return [a,b];
}

// log value of original data
function getOriginalChannelData(key) {
  var s=saveBlob[key];
  var x= Object.keys(s).map(function(k) { return parseFloat(s[k]) });
  x=logValue(x);
  return x;
}

function gateItHistogram(oldPlot,new_x, xrange, yrange) {
window.console.log("gating it..new_x,"+new_x);
window.console.log("gating it..xrange,"+xrange+" yrange,"+yrange);
    var oldDiv=oldPlot;
    oldDiv.data[0].x=new_x;
    if(xrange) 
      oldDiv.layout.xaxis.range=xrange;
    if(yrange) { 
      oldDiv.layout.yaxis.range=yrange;
      oldDiv.layout.yaxis.autorange=false;
    }
    Plotly.redraw(oldDiv);
}

function gateItScatter(oldPlot,new_x,new_y,xrange,yrange) {
    var oldDiv=oldPlot;
    oldDiv.data[0].x=new_x;
    oldDiv.data[0].y=new_y;
    if(xrange) {
      oldDiv.layout.xaxis.range=xrange;
      oldDiv.layout.xaxis.autorange=false;
    }
    if(yrange) {
      oldDiv.layout.yaxis.range=yrange;
      oldDiv.layout.yaxis.autorange=false;
    }
    Plotly.redraw(oldDiv);
}

function gateItMixed(oldPlot,new_x,new_y,xrange,yrange,xrange2,yrange2) {
    var oldDiv=oldPlot;
    oldDiv.data[0].x=new_x;
    oldDiv.data[1].x=new_x;
    oldDiv.data[2].x=new_x;
    oldDiv.data[3].x=NaN;
    oldDiv.data[0].y=new_y;
    oldDiv.data[1].y=new_y;
    oldDiv.data[2].y=NaN;
    oldDiv.data[3].y=new_y;
    if(xrange) {
      oldDiv.layout.xaxis.range=xrange;
      oldDiv.layout.xaxis.autorange=false;
    }
    if(yrange) {
      oldDiv.layout.yaxis.range=yrange;
      oldDiv.layout.yaxis.autorange=false;
    }
    if(xrange2) {
      oldDiv.layout.xaxis2.range=xrange2;
      oldDiv.layout.xaxis2.autorange=false;
    }
    if(yrange2) {
      oldDiv.layout.yaxis2.range=yrange2;
      oldDiv.layout.yaxis2.autorange=false;
    }
    Plotly.redraw(oldDiv);
}

/* chop off entries that is not within the min, max range */
function rangeItByValue(key,min,max) {
    var _p=getOriginalChannelData(key);
    var _cnt=_p.length;
    var _v;
    var _new=[];
    for( i=0; i< _cnt; i++) {
      _v=_p[i];
      if( _v >= min && _v <= max) {
         _new.push(_v);
      }
    }
    return _new;
}

/* chop off entries that are not within the index min,max */
function rangeItByTime(key,minIdx,maxIdx) {
    var _p=getOriginalChannelData(key);
    var _new=_p.slice(minIdx, maxIdx);
    return _new;
}

// scatter
function addTwoD(fstub,blob,keyX,keyY) {
  var _data=getScatterSetAt(blob, keyX, keyY);
  change2Log(_data);

  {
    var tmp=_data[0]['x'];
    var _max=Math.max.apply(Math,tmp);
    var _min=Math.min.apply(Math,tmp);
    slider_X_dirty=true;
    stashSliderLimit("#channel1_slider", _min, _max);
  }
  {
    var tmp=_data[0]['y'];
    var _max=Math.max.apply(Math,tmp);
    var _min=Math.min.apply(Math,tmp);
    slider_Y_dirty=true;
    stashSliderLimit("#channel2_slider", _min, _max);
  }


  var _layout=getScatterSetDefaultLayout(fstub,trimKey(keyX),trimKey(keyY),null,null);
  saveScatterPlot=addAPlot('#myViewer',_data, _layout, 600,600);
}

// scatter with histogram subplots
function addMixed(fstub, blob, keyX, keyY) {
  var _data=getMixedSetAt(blob, keyX, keyY);
  change2Log(_data);

  {
    var tmp=_data[0]['x'];
    var _max=Math.max.apply(Math,tmp);
    var _min=Math.min.apply(Math,tmp);
    slider_X_dirty=true;
    stashSliderLimit("#channel1_slider", _min, _max);
  }
  {
    var tmp=_data[0]['y'];
    var _max=Math.max.apply(Math,tmp);
    var _min=Math.min.apply(Math,tmp);
    slider_Y_dirty=true;
    stashSliderLimit("#channel2_slider", _min, _max);
  }

  var _layout=getMixedSetDefaultLayout(fstub,trimKey(keyX), trimKey(keyY),null,null);
  saveMixPlot=addAPlot('#myViewer',_data, _layout, 600, 600);
}

function updateMixed(fstub, blob, keyX, keyY) {
    var mixDiv=saveMixPlot;
    var _data=getMixedSetAt(blob, keyX, keyY);
    change2Log(_data);
    var _layout=getMixedSetDefaultLayout(fstub,trimKey(keyX), trimKey(keyY),null,null);
    var _p=mixDiv.data;
    mixDiv.data=_data;
    var _t=_layout['title']; 
    mixDiv.layout.title=_t;
    mixDiv.layout.xaxis.title=trimKey(keyX);
    mixDiv.layout.yaxis.title=trimKey(keyY);
    Plotly.redraw(mixDiv);
}

function updatePlot(fstub,blob,keyX,keyY,plotP) {
  $('#myViewer').empty();
  // reset this 
  var yplot = document.getElementById('channel2');
  yplot.style.display = '';
  saveSliders=[];
  saveMixPlot=null;
  saveXPlot=null; 
  saveYPlot=null;
  saveScatterPlot=null;
  saveBlob=blob;
  savePlotP=plotP;
  saveKeyY=keyY;
  saveKeyX=keyX;
  switch (plotP) {
    case 'mixed' :
      disableSliders();
      addMixed(fstub, blob, keyX, keyY);
      break;
    case 'twod' :
      disableSliders();
      addTwoD(fstub, blob, keyX, keyY);
      break;
    case 'histograms':
      enableSliders();
      addHistograms(fstub, blob, keyX, keyY);
      break;
    case 'ahistogram':
      enableSliders();
      addAHistogram(fstub, blob, keyX);
      break;
  }
  // always reset it
  if(slider_X_dirty) {
    slider_X_dirty=false;
    resetSliderRange("#channel1_slider");
  }
  if(slider_Y_dirty) {
    slider_Y_dirty=false;
    resetSliderRange("#channel2_slider");
  }
}

/*****MAIN*****/
jQuery(document).ready(function() {

  var blob=null;
  var dataKeys=null;
  var fstub=DEFAULTFCS;

  // defaults
  var keyX=DEFAULTCHANNEL1;
  var keyY=DEFAULTCHANNEL2;
  var plotP='mixed';

  savePlotP=plotP;

  var args=document.location.href.split('?');
//http://localhost/plotly/view.html?http://localhost/data/plotly/inf_072514.EP5.json
  if (args.length === 2) {
     var url=getURL(args);
     fstub=chopForStub(url);
     blob=loadBlobFromJsonFile(url);
     dataKeys=setupUI(blob);
     slider_X_dirty=true;
     slider_Y_dirty=true;
//     setupDataListWithFstub(fstub);
     } else {
       var nfstub=setupDataListWithInner();
       blob=loadBlobFromInner(nfstub);
       dataKeys=setupUI(blob);
       slider_X_dirty=true;
       slider_Y_dirty=true;
  }
  saveBlob=blob;
  saveKeyX=keyX;
  saveKeyY=keyY;

  $('#x-list').change(function() {
    var xkey = document.getElementById("x-list").value;
    if(xkey === keyX) {
      // no change
      } else {
      keyX=xkey;
      slider_X_dirty=true;
      updatePlot(fstub, blob,keyX,keyY,plotP);
    }
  });
  $('#y-list').change(function() {
    var ykey = document.getElementById("y-list").value;
    if(ykey === keyY) {
      // no change
      } else {
      keyY=ykey;
      slider_Y_dirty=true;
      updatePlot(fstub, blob,keyX,keyY,plotP);
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
        updatePlot(fstub,blob,keyX,keyY,plotP);
    }
  });
  $('#plot-list').change(function() {
    var ptype = document.getElementById("plot-list").value;
    if(ptype === plotP) {
      // no need to do anything
      } else {
        plotP=ptype;
        updatePlot(fstub,blob,keyX,keyY,plotP);
    }
  });

// initial plot
  if(!enableEmbedded) {
    addMixed(fstub,blob,keyX,keyY);
  }
})

// FUN-O
function animateByTimeClick() { 
  var max=2000;
  var step=100;
  var i=1;
  if(slider_X_dirty) {
    slider_X_dirty=false;
    resetSliderRange("#channel1_slider");
  }
  if(slider_Y_dirty) {
    slider_Y_dirty=false;
    resetSliderRange("#channel2_slider");
  }
  var i_id=setInterval(function() {
    var _maxIdx=i*step;
    i=i+1;

    var _x=rangeItByTime(saveKeyX,0,_maxIdx);
    var _y=rangeItByTime(saveKeyY,0,_maxIdx);
    switch (savePlotP) {
        case 'ahistogram': // there is just one histogram plot
          var r1=rangeOfHistogram(saveXPlot);
          gateItHistogram(saveXPlot,_x, r1[0], r1[1]);
          break;
        case 'histograms': // there are two of the plots
          var r1=rangeOfHistogram(saveXPlot);
          var r2=rangeOfHistogram(saveYPlot);
          gateItHistogram(saveXPlot,_x, r1[0], r1[1]);
          gateItHistogram(saveYPlot,_y, r2[0], r2[1]);
          break;
        case 'mixed':
          var r=rangeOfMixed(saveMixPlot);
          gateItMixed(saveMixPlot,_x,_y,r[0],r[1],r[2],r[3]);
          break;
        case 'twod':
          var r=rangeOfScatter(saveScatterPlot);
          gateItScatter(saveScatterPlot,_x,_y,r[0],r[1]);
          break;
    }
       if (_maxIdx > max)
           clearInterval(i_id);
    }, 10);
}

