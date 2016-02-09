// http://localhost/plotly/view.html?http://localhost/data/plotly/YLW-HLin.json

var savePlot=null;

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

function getHistogramAt(blob, key) {
  var s=blob[key];
  var x= Object.keys(s).map(function(k) { return parseFloat(s[k]) });
  var data= [ { "x": x, "type" :"histogram" } ];
  return data;
}

function getHistogramDefaultLayout(sample,key){
  var t="Histogram of "+key+ "<br> in "+sample;
  var p= {
      "width": 600,
      "height": 300,
//     "title": t,
      "xaxis": { "title":key+"(log)"},
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

function getScatterSetDefaultLayout(sample,xkey,ykey){
  var t= xkey+" vs "+ykey+"<br> in "+sample;
  var p= {
      "width": 600,
      "height": 600,
      "title": t,
      "plot_bgcolor": 'rgb(223, 223, 223)',
      "xaxis": { "title":xkey+"(log)", "type":"log"},
      "yaxis": { "title":ykey+"(log)", "type":"log"}
      };   
  return p;
}

function getMixedSetAt(blob, xkey, ykey) {
  var xs=blob[xkey];
  var x= Object.keys(xs).map(function(k) { return parseFloat(xs[k]) });
  var ys=blob[ykey];
  var y= Object.keys(ys).map(function(k) { return parseFloat(ys[k]) });
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

function getMixedSetDefaultLayout(sample,xkey,ykey){
  var t= xkey+" vs "+ykey+"<br> in "+sample;
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
      "xaxis": {
        "domain": [0, 0.85],
        "showgrid": true,
        "title": xkey,
        "zeroline": false
      },
      "yaxis": {
        "domain": [0, 0.85],
        "showgrid": true,
        "title": ykey,
        "zeroline": false
      },
      "xaxis2": {
        "domain": [0.85, 1],
        "showgrid": false,
        "zeroline": false
      },
      "yaxis2": {
        "domain": [0.85, 1],
        "showgrid": false,
        "zeroline": false
      }
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
  savePlot=gd;
  Plotly.newPlot(gd, data, layout);
}

//[ "Forward Scatter (FSC-HLin)", "Side Scatter (SSC-HLin)",
//  "Green Fluorescence (GRN-HLin)", "Yellow Fluorescence (YLW-HLin)",
//  "Red Fluorescence (RED-HLin)" ]
function trimKey(key) {
  if(key == 'Time') // skip this in dropdown
    return null;
  switch (key) { 
   case "Forward Scatter (FSC-HLin)":
     return "Forward Scatter";
   case "Side Scatter (SSC-HLin)":
     return "Side Scatter";
   case "Green Fluorescence (GRN-HLin)":
     return "Green Fluorenscene";
   case "Yellow Fluorescence (YLW-HLin)":
     return "Yellow Fluorescence";
   case "Red Fluorescence (RED-HLin)":
     return "Red Fluorescence";
   default:
      return null;
  }
}

// particular to our dataset..
function setupDropDowns(keys) {
  var xlist = document.getElementById('x-list');
  var ylist = document.getElementById('y-list');
  var _xlist = '';
  var _ylist = '';
  for (var i = 0; i < keys.length; i++) {
    var _k=trimKey(keys[i]);
    if(_k) {
      if(_k=='Red Fluorescence') {
        _ylist += '<option selected="selected" value="' + keys[i] + '">' + _k + '</option>';
        } else {
        _ylist += '<option value="' + keys[i] + '">' + _k + '</option>';
      }
      if(_k=='Forward Scatter') {
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
  plist.innerHTML = _plist;

  var dlist = document.getElementById('data-list');
  var _dlist = '<option selected="selected" value="' + 'inf_072514.EP5' + '">' + 'inf_072514.EP5.FCS' + '</option>';
      _dlist += '<option value="' + 'exp_012116kv.EP5' + '">' + 'exp_012116kv.EP5.FCS' + '</option>';
  dlist.innerHTML = _dlist;
} 

function allHistograms(fstub, blob, keys) {
  for(var i=0; i<cnt; i++) {
     var key=keys[i];
     var _data=getHistogramAt(blob, key);
     change2Log(_data);
     var _layout=getHistogramDefaultLayout(fstub,key);
     addAPlot('#myViewer',_data, _layout, 450, 300);
  }
}

// histograms
function addHistograms(fstub, blob, keyX, keyY) {
  var _data=getHistogramAt(blob, keyX);
  change2Log(_data);
  var _layout=getHistogramDefaultLayout(fstub,trimKey(keyX));
  addAPlot('#myViewer',_data, _layout,450,300);
  var _data=getHistogramAt(blob, keyY);
  change2Log(_data);
  var _layout=getHistogramDefaultLayout(fstub,trimKey(keyY));
  addAPlot('#myViewer',_data, _layout,450,300);
}

// scatter
function addTwoD(fstub,blob,keyX,keyY) {
  var _data=getScatterSetAt(blob, keyX, keyY);
  change2Log(_data);
  var _layout=getScatterSetDefaultLayout(fstub,trimKey(keyX), trimKey(keyY));
  addAPlot('#myViewer',_data, _layout, 600,600);
}

// scatter with histogram subplots
function addMixed(fstub, blob, keyX, keyY) {
  var _data=getMixedSetAt(blob, keyX, keyY);
  change2Log(_data);
  var _layout=getMixedSetDefaultLayout(fstub,trimKey(keyX), trimKey(keyY));
  addAPlot('#myViewer',_data, _layout, 600, 600);
}

function updateMixed(fstub, blob, keyX, keyY) {
    var mixDiv=savePlot;
    var _data=getMixedSetAt(blob, keyX, keyY);
    change2Log(_data);
    var _layout=getMixedSetDefaultLayout(fstub,trimKey(keyX), trimKey(keyY));
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
  savePlot=null;
  switch (plotP) {
    case 'mixed' :
      addMixed(fstub, blob, keyX, keyY);
      break;
    case 'twod' :
      addTwoD(fstub, blob, keyX, keyY);
      break;
    case 'histograms':
      addHistograms(fstub, blob, keyX, keyY);
      break;
  }
}

jQuery(document).ready(function() {

  var blob=null;
  var dataKeys=null;
  var fstub="inf_072514.EP5";

  // defaults
  var keyX='Forward Scatter (FSC-HLin)';
  var keyY='Red Fluorescence (RED-HLin)';
  var plotP='mixed';

  var args=document.location.href.split('?');
//http://localhost/plotly/view.html?http://localhost/data/plotly/inf_072514.EP5.json
  if (args.length === 2) {
     var url=getURL(args);
     fstub=chopForStub(url);
     blob=loadBlobFromJsonFile(url);
     dataKeys=setupUI(blob);
     } else {
        if(enableEmbedded) {
          // do nothing
          } else {
            blob=loadBlobFromInner(fstub);
            dataKeys=setupUI(blob);
        }
  }

//[ "Forward Scatter (FSC-HLin)", "Side Scatter (SSC-HLin)",
//  "Green Fluorescence (GRN-HLin)", "Yellow Fluorescence (YLW-HLin)",
//  "Red Fluorescence (RED-HLin)" ]

  $('#x-list').change(function() {
    var xkey = document.getElementById("x-list").value;
    if(xkey === keyX) {
      // no change
      } else {
      keyX=xkey;
      updateMixed(fstub, blob,keyX,keyY);
    }
  });
  $('#y-list').change(function() {
    var ykey = document.getElementById("y-list").value;
    if(ykey === keyY) {
      // no change
      } else {
      keyY=ykey;
      updateMixed(fstub, blob,keyX,keyY);
    }
  });
  $('#data-list').change(function() {
    var ddata = document.getElementById("data-list").value;
    if(ddata === fstub) {
      // no need to do anything
      } else {
        fstub=ddata;
        blob=loadBlobFromInner(fstub);
        updateMixed(fstub,blob,keyX,keyY);
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


