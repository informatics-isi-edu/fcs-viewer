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

function getHistogramAt(blob, key, color) {
  var x=getOriginalChannelData(key);
  var data= [ { "x": x, 
                "marker": {
                  "color":color,
                },
                "type" :"histogram" } ];
  return data;
}

function getHistogramDefaultLayout(key,range){
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
        "bargap": 0.2,
        "xaxis": tmp,
        "yaxis": { "title":"Count"} ,
/* add vertical gating line */
        shapes : [
            {
            'type': 'line',
            'yref': 'paper', //y axis relative to plot
            'x0': 0,
            'y0': 0,
            'x1': 0,
            'y1': 1,
            'line': {
                'color': 'rgb(50, 171, 96)',
                'width': 0,
            }},
            {
            'type': 'line',
            'yref': 'paper', //y axis relative to plot
            'x0': 0,
            'y0': 0,
            'x1': 0,
            'y1': 1,
            'line': {
                'color': 'rgb(50, 71, 96)',
                'width': 0,
            }}
        ]
        };   
  return p;
}

function resetHistogramThreshold(oldPlot) {
    var oldDiv=oldPlot;
    oldDiv.layout.shapes[0].line.width=0;
    oldDiv.layout.shapes[1].line.width=0;
    Plotly.redraw(oldDiv);
}

function setHistogramThreshold(oldPlot,xPos,xPos2){
    var oldDiv=oldPlot;
    if(xPos != null) {
      oldDiv.layout.shapes[0].x0=xPos;
      oldDiv.layout.shapes[0].x1=xPos;
      if(savePlotP === 'ahistogram') {
        oldDiv.layout.shapes[0].line.width=6;
        } else {
         oldDiv.layout.shapes[0].line.width=4;
      }
    }
    if(xPos2 != null) {
      oldDiv.layout.shapes[1].x0=xPos2;
      oldDiv.layout.shapes[1].x1=xPos2;
      if(savePlotP === 'ahistogram') {
        oldDiv.layout.shapes[1].line.width=6;
        } else {
         oldDiv.layout.shapes[1].line.width=4;
      }
    }
    Plotly.redraw(oldDiv);
}

function getScatterSetAt(blob, xkey, ykey) {
  var x=getOriginalChannelData(xkey);
  var y=getOriginalChannelData(ykey);
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

function getScatterSetDefaultLayout(xkey,ykey,xrange,yrange){
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
      "plot_bgcolor": 'rgb(223, 223, 223)',
      "xaxis": tmpx,
      "yaxis": tmpy
      };   
  return p;
}


// These are calculated before converted to log values
function calcQuadrantStats(values,totalcnt,msg) {
  var qcnt=values.length;
  var ret="count "+qcnt+"<br>";
  if ( qcnt == 0)
     return ret;
  var percentTotal=Math.round((qcnt/totalcnt)*100);
  var max=Math.max.apply(Math,values);
      max=Math.round(max * 1000)/1000;
  var min=Math.min.apply(Math,values);
      min=Math.round(min * 1000)/1000;
      ret=ret+("max "+max+"<br>min "+min+"<br>");
  var sum=0;
  var nums=[];
  for(var j=0;j<qcnt;j++) {
     sum = sum + values[j]; 
     nums.push(values[j]);
  }
  var mean = sum/qcnt;
  mean=Math.round(Math.pow(10,mean));
  nums.sort();
  var mid = Math.floor(nums.length / 2);
  var median = nums.length % 2 ? nums[mid] :((nums[mid-1] + nums[mid])/2);
  median = Math.round(Math.pow(10,median));

      ret=ret+"percentTotal "+percentTotal+"<br>";
      ret=ret+ "mean "+mean+"<br>";
      ret=ret+"median "+median+"<br>";
  return ret;
}


/*
           xgate
             |
             v
          Q1 | Q2
          ---+--- <-ygate
          Q3 | Q4
*/

function split2Quadrants(x,y,xgate,ygate) {
  var Q1x=[], Q1y=[], Q1z=[];
  var Q2x=[], Q2y=[], Q2z=[];
  var Q3x=[], Q3y=[], Q3z=[];
  var Q4x=[], Q4y=[], Q4z=[];

  var cnt=y.length;
  if(xgate==null && ygate == null) {
    Q2x=x;
    Q2y=y;
    for(var i=0; i<cnt; i++) 
       Q2z.push(i);
    } else {
      for(var i=0; i<cnt; i++) {
        if(x[i]>=xgate) {
          if(y[i]>=ygate || ygate==null) { // Q2
            Q2x.push(x[i]); Q2y.push(y[i]); Q2z.push(i);
            } else { // Q4
            Q4x.push(x[i]); Q4y.push(y[i]); Q4z.push(i);
          }
          } else {
            if(y[i]>=ygate || ygate==null) { // Q1
              Q1x.push(x[i]); Q1y.push(y[i]); Q1z.push(i);
              } else { // Q3
              Q3x.push(x[i]); Q3y.push(y[i]); Q3z.push(i);
            }
        } 
     }
  }

  var Text1=calcQuadrantStats(Q1x,cnt,'Quadrant 1');
  var Text2=calcQuadrantStats(Q2x,cnt,'Quadrant 2');
  var Text3=calcQuadrantStats(Q3x,cnt,'Quadrant 3');
  var Text4=calcQuadrantStats(Q4x,cnt,'Quadrant 4');

  return [[Q1x,Q1y,Q1z,Text1],[Q2x,Q2y,Q2z,Text2],[Q3x,Q3y,Q2z,Text3],[Q4x,Q4y,Q4z,Text4]];
}

// gate naming is [ nameOfQ1, nameOfQ2, nameOfQ3, nameofQ4 ] 
function getGatedScatterSetAt(blob, xkey, ykey, xgate, ygate) {
  /* separate into 4 sets of traces */
  var x=getOriginalChannelData(xkey);
  var y=getOriginalChannelData(ykey);

  var Q=split2Quadrants(x,y,xgate,ygate);
  var Q1x=Q[0][0], Q1y=Q[0][1], Text1=Q[0][3];
  var Q2x=Q[1][0], Q2y=Q[1][1], Text2=Q[1][3];
  var Q3x=Q[2][0], Q3y=Q[2][1], Text3=Q[2][3];
  var Q4x=Q[3][0], Q4y=Q[3][1], Text4=Q[3][3];

/* special case.. if xkey==green and ykey==red, then use namegate.. */
  var _name= (xkey === 'Green Fluorescence (GRN-HLin)'
                      && ykey === 'Red Fluorescence (RED-HLin)')? 
                                initPlot_gateNames:['Q1','Q2','Q3','Q4'];

  /* separate into 4 sets of traces */
  var data= [ 
             {
                "name": _name[0],
                "x": Q1x,
                "y": Q1y,
                "ax": 0,
                "ay" : -40,
                "text" : Text1,
                "mode": "markers",
                "marker": {
                    "color": "blue",
                    "size": 10,
                    "line": {"color": "black", "width": 1},
                    "opacity": 0.6
                  },
                "type":"scatter" 
             },
             {
                "name": _name[1],
                "x": Q2x,
                "y": Q2y,
                "text" : Text2,
                "mode": "markers",
                "marker": {
                    "color": "red",
                    "size": 10,
                    "line": {"color": "black", "width": 1},
                    "opacity": 0.6
                  },
                "type":"scatter" 
             },
             {
                "name": _name[2],
                "x": Q3x,
                "y": Q3y,
                "text" : Text3,
                "mode": "markers",
                "marker": {
                    "color": "orange",
                    "size": 10,
                    "line": {"color": "black", "width": 1},
                    "opacity": 0.6
                  },
                "type":"scatter" 
             },
             {
                "name": _name[3],
                "x": Q4x,
                "y": Q4y,
                "text" : Text4,
                "mode": "markers",
                "marker": {
                    "color": "green",
                    "size": 10,
                    "line": {"color": "black", "width": 1},
                    "opacity": 0.6
                  },
                "type":"scatter" 
             }
  ];
  return data;
}


// xytitle = [xtitle, ytitle]
function getGatedScatterSetDefaultLayout(xkey,ykey,xrange,yrange){
  var tmpx, tmpy;
  var _title=(xkey === 'Green Fluorescence'
                      && ykey === 'Red Fluorescence')? 
                         initPlot_titles: [xkey+"(log)",ykey+"(log)"];
  if(xrange && yrange) {
    tmpx= { "title":_title[0], "range": xrange };
    tmpy= { "title":_title[1], "range": yrange };
    } else {
      tmpx= { "title":_title[0]};
      tmpy= { "title":_title[1]};
  }
  var p= {
      "width": 600,
      "height": 600,
      "hovermode": 'closest',
      "plot_bgcolor": 'rgb(223, 223, 223)',
      "xaxis": tmpx,
      "yaxis": tmpy
      };   
  return p;
}


//https://plot.ly/javascript/2d-density-plots/
function getMixedSetAt(blob, xkey, ykey) {
  var x=getOriginalChannelData(xkey);
  var y=getOriginalChannelData(ykey);
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

function getMixedSetDefaultLayout(xkey,ykey,xrange,yrange,xrange2,yrange2){
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
      tmpy= { "domain": [0, 0.85], "showgrid": true, "title": ykey,
               "zeroline": false };
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
      "plot_bgcolor": 'rgb(223, 223, 223)',
      "showlegend": false,
      "autosize": false,
      "margin": {"t": 100},
      "hovermode": "closest",
      "bargap": 0.2,
      "xaxis": tmpx,
      "yaxis": tmpy,
      "xaxis2": tmpx2,
      "yaxis2": tmpy2
  };   
  return p;
}

function getGatedMixedScatterSetAt(blob, xkey, ykey, xgate, ygate) {
  /* separate into 4 sets of traces */
  var x=getOriginalChannelData(xkey);
  var y=getOriginalChannelData(ykey);

  var Q=split2Quadrants(x,y,xgate,ygate);
  var Q1x=Q[0][0], Q1y=Q[0][1], Text1=Q[0][3];
  var Q2x=Q[1][0], Q2y=Q[1][1], Text2=Q[1][3];
  var Q3x=Q[2][0], Q3y=Q[2][1], Text3=Q[2][3];
  var Q4x=Q[3][0], Q4y=Q[3][1], Text4=Q[3][3];

/* special case.. if xkey==green and ykey==red, then use namegate.. */
  var _name= (xkey === 'Green Fluorescence (GRN-HLin)'
                      && ykey === 'Red Fluorescence (RED-HLin)')? 
                                initPlot_gateNames:['Q1','Q2','Q3','Q4'];

  /* separate into 4 sets of traces */
  var data= [ 
             {
                "name": _name[0],
                "x": Q1x,
                "y": Q1y,
                "ax": 0,
                "ay" : -40,
                "text" : Text1,
                "showlegend": true,
                "mode": "markers",
                "marker": {
                    "color": 'rgb(0, 197, 208)',
                    "size": 10,
                    "line": {"color": "black", "width": 1},
                    "opacity": 0.6
                  },
                "type":"scatter" 
             },
             {
                "name": _name[1],
                "x": Q2x,
                "y": Q2y,
                "showlegend": true,
                "text" : Text2,
                "mode": "markers",
                "marker": {
                    "color": 'rgb(255, 48, 48)',
                    "size": 10,
                    "line": {"color": "black", "width": 1},
                    "opacity": 0.6
                  },
                "type":"scatter" 
             },
             {
                "name": _name[2],
                "x": Q3x,
                "y": Q3y,
                "showlegend": true,
                "text" : Text3,
                "mode": "markers",
                "marker": {
                    "color": "orange",
                    "size": 10,
                    "line": {"color": "black", "width": 1},
                    "opacity": 0.6
                  },
                "type":"scatter" 
             },
             {
                "name": _name[3],
                "x": Q4x,
                "y": Q4y,
                "showlegend": true,
                "text" : Text4,
                "mode": "markers",
                "marker": {
                    "color": "green",
                    "size": 10,
                    "line": {"color": "black", "width": 1},
                    "opacity": 0.6
                  },
                "type":"scatter" 
             },
             {  "x": x,
                "showlegend": false,
                "name": "x count",
                "marker": { "color": "blue"},
                "yaxis": "y2",
                "type": "histogram" },
             {  "y": y,
                "showlegend": false,
                "name": "y count",
                "marker": { "color": "red"},
                "xaxis": "x2",
                "type": "histogram" }
          ];
  return data;
}

function getGatedMixedScatterSetDefaultLayout(xkey,ykey,xrange,yrange,xrange2,yrange2){
  var tmpx, tmpy, tmpx2, tmpy2;

  var _title=(xkey === 'Green Fluorescence'
                      && ykey === 'Red Fluorescence')?
                         initPlot_titles: [xkey+"(log)",ykey+"(log)"];

  if(xrange) {
    tmpx= { "domain": [0, 0.85], "showgrid": true, "title": _title[0],
              "range": xrange, "autorange":false, "zeroline": true };
    } else { 
      tmpx= { "domain": [0, 0.85], "showgrid": true, "title": _title[0], 
              "zeroline": true};
  }
  if(yrange) {
    tmpy= { "domain": [0, 0.85], "showgrid": true, "title": _title[1],
              "range": yrange,"autorange":false, "zeroline": true };
    } else {
      tmpy= { "domain": [0, 0.85], "showgrid": true, "title": _title[1], 
              "zeroline": true };
  }
  if(xrange2) {
    tmpx2 = { "domain": [0.85, 1], "showgrid": false,
              "range": xrange2, "autorange":false, "zeroline": true };
    } else {
      tmpx2 = { "domain": [0.85, 1], "showgrid": false, "zeroline": true };
  }

  if(yrange2) {
    tmpy2= { "domain": [0.85, 1], "showgrid": false,
              "range": yrange2, "autorange":false, "zeroline": true };
    } else {
      tmpy2= { "domain": [0.85, 1], "showgrid": false, "zeroline": true };
  }
  var p= {
      "width": 600,
      "height": 600,
      "plot_bgcolor": 'rgb(223, 223, 223)',
      "autosize": false,
      "margin": {"t": 100},
      "hovermode": "closest",
      "bargap": 0.2,
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
    return (Math.round(Math.log10(v)*10000)/10000);
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
  _max=Math.log10(_max);
  _min=Math.log10(_min);
  return [_min, _max];
}

function processArgs(args) {
  var url="";
  var params = args[1].split('&');
  for (var i=0; i < params.length; i++) {
    var param = unescape(params[i]);
    if (param.indexOf('=') == -1) {
      url=param.replace(new RegExp('/$'),'').trim();
      } else {
        var kvp = param.split('=');
        switch (kvp[0].trim()) {
          case 'url':
            {
             url=kvp[1].replace(new RegExp('/$'),'').trim();
             break;
             }
          case 'gateX': 
             {
             var t=parseInt(kvp[1]);
             if(!isNaN(t))
               initPlot_gateX=Math.round(Math.log10(t)*100)/100;
             }
          case 'gateY': 
             {
             var t=parseInt(kvp[1]);
             if(!isNaN(t))
               initPlot_gateY=Math.round(Math.log10(t)*100)/100;
             }
       }
    }
  }
  return url;
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
  x=getOriginalChannelData(DEFAULT_CHANNEL1);
  var _max=Math.ceil(Math.max.apply(Math,x)*100)/100;
  var _min=Math.floor(Math.min.apply(Math,x)*100)/100;
  jQuery("#channel1_slider").slider({
    range: true,
    min: _min,
    step: 0.01,
    max: _max,
    disabled: false,
    values: [_min, _max],
    change: function(event,ui) {
        var _max=jQuery("#channel1_slider").slider("option","max");
        var _min=jQuery("#channel1_slider").slider("option","min");
        $("#slider1Min").val(_min);
        $("#slider1Max").val(_max);
        var t=jQuery("#channel1_slider").slider("option","range");
        if(t === "max") 
          $("#slider1Range").val(ui.values[0]);
          else
            $("#slider1Range").val(ui.values[0]+" - "+ui.values[1]);
    },
    stop:function(event,ui) {
        xRangeClick();
    }
  });
  $("#slider1Range").val( _min+" - "+_max);
  $("#slider1Min").val(_min);
  $("#slider1Max").val(_max);

  x=getOriginalChannelData(DEFAULT_CHANNEL2);
  _max=Math.ceil(Math.max.apply(Math,x)*100)/100;
  _min=Math.floor(Math.min.apply(Math,x)*100)/100;
  jQuery("#channel2_slider").slider({
    range: true,
    min: _min,
    step: 0.01,
    max: _max, 
    disabled: false,
    values: [_min, _max],
    change: function(event,ui) {
        var _max=jQuery("#channel2_slider").slider("option","max");
        var _min=jQuery("#channel2_slider").slider("option","min");
        $("#slider2Min").val(_min);
        $("#slider2Max").val(_max);
        var t=jQuery("#channel2_slider").slider("option","range");
        if(t === "max")
          $("#slider2Range").val(ui.values[0]);
          else
            $("#slider2Range").val(ui.values[0]+" - "+ui.values[1]);
    },
    stop:function(event,ui) {
        yRangeClick();
    }
  });
  $("#slider2Range").val( _min+" - "+_max);
  $("#slider2Min").val(_min);
  $("#slider2Max").val(_max);
}

function enableSlidersWithFixedMin() {
  enableRangeSliders();
  jQuery("#channel1_slider").slider("option","range","max");
  jQuery("#channel2_slider").slider("option","range","max");
}

function enableRangeSliders() {
  var xselect = document.getElementById('x_range_slider');
  xselect.style.display = '';
  var yselect = document.getElementById('y_range_slider');
  yselect.style.display = '';
  jQuery("#channel1_slider").slider("option","range",true);
  jQuery("#channel2_slider").slider("option","range",true);
  slider_X_dirty=true;
  slider_Y_dirty=true;
}

function disableRangeSliders() {
  var xselect = document.getElementById('x_range_slider');
  xselect.style.display = 'none';
  var yselect = document.getElementById('y_range_slider');
  yselect.style.display = 'none';
}

function setSliderLimit(id,min,max) {
  var _max=Math.ceil(max *100)/100;
  var _min=Math.floor(min *100)/100;
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

function resetSliderMinValues(id,min) {
  var max=jQuery(id).slider("option", "max");
  jQuery(id).slider("option", "values", [min,max]);
  jQuery(id).slider("value", jQuery(id).slider("value"));
}

function resetSliderRange(id) {
//window.console.log("resetSliderRange"+id);
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
}

function stashSliderLimit(id,min,max) {
  setSliderLimit(id,min,max);
  saveSliders.push([id,min,max]); 
}

// process x axis's gating
function xRangeClick() {
  if(savePlotP !== "histograms" && savePlotP !== "ahistogram" 
            && savePlotP !== "gtwod" && savePlotP !== "gmtwod") {
    window.console.log("WARNING, can only gate histograms..");
    resetSliderRange("#channel1_slider");
    return;
  }

  if(saveXPlot) {
    var val = jQuery('#channel1_slider').slider("option", "values");
    var _x=rangeItByValue(saveKeyX,val[0], val[1]);
    var _r=rangeOfHistogram(saveXPlot);
    gateItHistogram(saveXPlot,_x, _r[0], _r[1]);

    var m1= jQuery('#channel1_slider').slider("option", "min");
    var m2= jQuery('#channel1_slider').slider("option", "max");
    var t1= (val[0]===m1)? null: val[0];
    var t2= (val[1]===m2)? null: val[1];
    if(t1 || t2)
      setHistogramThreshold(saveXPlot, t1, t2);
  }
  if(saveGatedScatterPlot) {
    var val = jQuery('#channel1_slider').slider("option", "values");
    var gateX=val[0];
    val = jQuery('#channel2_slider').slider("option", "values");
    var gateY=val[0];
    var _x=getOriginalChannelData(saveKeyX);
    var _y=getOriginalChannelData(saveKeyY);
    gateItGatedScatter(saveGatedScatterPlot,_x,_y,null,null,gateX,gateY);
  }
  if(saveGatedMixedScatterPlot) {
    var val = jQuery('#channel1_slider').slider("option", "values");
    var gateX=val[0];
    val = jQuery('#channel2_slider').slider("option", "values");
    var gateY=val[0];
    var _x=getOriginalChannelData(saveKeyX);
    var _y=getOriginalChannelData(saveKeyY);
    gateItGatedMixedScatter(saveGatedMixedScatterPlot,_x,_y,null,null,gateX,gateY);
  }
}

function yRangeClick() {
  if(savePlotP !== "histograms" && savePlotP !== "gtwod" &&
                  savePlotP !== "gmtwod") {
    window.console.log("WARNING, can only gate histograms..");
    resetSliderRange("#channel2_slider");
    return;
  }

  if(saveYPlot) {
    var val = jQuery('#channel2_slider').slider("option", "values");
    var _y=rangeItByValue(saveKeyY,val[0], val[1]);
    var _r=rangeOfHistogram(saveYPlot);
    gateItHistogram(saveYPlot,_y,_r[0],_r[1]);

    var m1= jQuery('#channel2_slider').slider("option", "min");
    var m2= jQuery('#channel2_slider').slider("option", "max");
    var t1= (val[0]===m1)? null: val[0];
    var t2= (val[1]===m2)? null: val[1];
    if(t1 || t2)
      setHistogramThreshold(saveYPlot, t1, t2);
  }
  if(saveGatedScatterPlot) {
    var val = jQuery('#channel1_slider').slider("option", "values");
    var gateX=val[0];
    val = jQuery('#channel2_slider').slider("option", "values");
    var gateY=val[0];
    var _x=getOriginalChannelData(saveKeyX);
    var _y=getOriginalChannelData(saveKeyY);
    gateItGatedScatter(saveGatedScatterPlot,_x,_y,null,null,gateX,gateY);
  }
  if(saveGatedMixedScatterPlot) {
    var val = jQuery('#channel1_slider').slider("option", "values");
    var gateX=val[0];
    val = jQuery('#channel2_slider').slider("option", "values");
    var gateY=val[0];
    var _x=getOriginalChannelData(saveKeyX);
    var _y=getOriginalChannelData(saveKeyY);
    gateItGatedMixedScatter(saveGatedMixedScatterPlot,_x,_y,null,null,gateX,gateY);
  }
}

function setupDropDowns(keys) {
  var xlist = document.getElementById('x-list');
  var ylist = document.getElementById('y-list');
  var _xlist = '';
  var _ylist = '';
  for (var i = 0; i < keys.length; i++) {
    var _k=trimKey(keys[i]);
    if(_k) {
      if(keys[i]==DEFAULT_CHANNEL2) {
        _ylist += '<option selected="selected" value="' + keys[i] + '">' + _k + '</option>';
        } else {
        _ylist += '<option value="' + keys[i] + '">' + _k + '</option>';
      }
      if(keys[i]==DEFAULT_CHANNEL1) {
        _xlist += '<option selected="selected" value="' + keys[i] + '">' + _k + '</option>';
        } else {
        _xlist += '<option value="' + keys[i] + '">' + _k + '</option>';
      }
    }
  }
  xlist.innerHTML = _xlist;
  ylist.innerHTML = _ylist;
  $('#x-list').val("Green Fluorescence (GRN-HLin)").trigger('change');
  $('#y-list').val("Red Fluorescence (RED-HLin)").trigger('change');

  var plist = document.getElementById('plot-list');
  var _plist = '<option selected="selected" value="' + 'gmtwod' + '">' + 'gated mixed scatter' + '</option>';
      _plist += '<option value="' + 'histograms' + '">' + 'histograms' + '</option>';
      _plist += '<option value="' + 'ahistogram' + '">' + 'a histogram' + '</option>';
      _plist += '<option value="' + 'mixed' + '">' + 'mixed plots' + '</option>';
      _plist += '<option value="' + 'twod' + '">' + '2d scatter' + '</option>';
//      _plist += '<option value="' + 'gtwod' + '">' + 'gated scatter' + '</option>';
  plist.innerHTML = _plist;
  $('#plot-list').val("gmtwod").trigger('change'); 
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

function allHistograms(blob, keys) {
  for(var i=0; i<cnt; i++) {
     var key=keys[i];
     var _data=getHistogramAt(blob, key);
     var _layout=getHistogramDefaultLayout(key,null);
     var dummy=addAPlot('#myViewer',_data, _layout, 450, 300);
  }
}

// a single histogram
function addAHistogram(blob, key) {
  // always reset
  var yplot = document.getElementById('channel2');
  yplot.style.display = 'none';
  saveYPlot=null;

  var _data=getHistogramAt(blob, key,'blue');
  var tmp=_data[0]['x'];
  var _max=Math.max.apply(Math,tmp);
  var _min=Math.min.apply(Math,tmp);
  slider_X_dirty=true;
  stashSliderLimit("#channel1_slider", _min, _max);

  var _layout=getHistogramDefaultLayout(trimKey(key), [_min,_max]);

  saveXPlot=addAPlot('#myViewer',_data, _layout,600,600);
}

// histograms
function addHistograms(blob, keyX, keyY) {
  var _data=getHistogramAt(blob, keyX,'blue');
  var tmpX=_data[0]['x'];
  var _max1=Math.max.apply(Math,tmpX);
  var _min1=Math.min.apply(Math,tmpX);
  if(slider_X_dirty) {
      slider_X_dirty=false;
      stashSliderLimit("#channel1_slider", _min1, _max1);
  }

  var _data2=getHistogramAt(blob, keyY,'red');

  var tmpY=_data2[0]['x'];
  var _max2=Math.max.apply(Math,tmpY);
  var _min2=Math.min.apply(Math,tmpY);
  if(slider_Y_dirty) {
      slider_Y_dirty=false;
      stashSliderLimit("#channel2_slider", _min2, _max2);
  }

  var _max=(_max1>_max2)?_max1:_max2;
  var _min=(_min1<_min2)?_min1:_min2;

  var _layout=getHistogramDefaultLayout(trimKey(keyX), [_min,_max]);
  var _layout2=getHistogramDefaultLayout(trimKey(keyY), [_min,_max]);

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
// keep a cache
var channelCache=[];
function getOriginalChannelData(key) {
  if (key in channelCache ) {
    return channelCache[key];
  } 
  var s=saveBlob[key];
  var x= Object.keys(s).map(function(k) { return parseFloat(s[k]) });
  x=logValue(x);
  channelCache[key]=x;
  return x;
}

function gateItHistogram(oldPlot,new_x, xrange, yrange) {
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


function gateItGatedScatter(oldPlot,new_x,new_y,xrange,yrange,gateX,gateY) {
    var oldDiv=oldPlot;
    var new_data=split2Quadrants(new_x,new_y,gateX,gateY);

    oldDiv.data[0].x=new_data[0][0];
    oldDiv.data[0].y=new_data[0][1];
    oldDiv.data[0].text=new_data[0][3];
  

    oldDiv.data[1].x=new_data[1][0];
    oldDiv.data[1].y=new_data[1][1];
    oldDiv.data[1].text=new_data[1][3];

    oldDiv.data[2].x=new_data[2][0];
    oldDiv.data[2].y=new_data[2][1];
    oldDiv.data[2].text=new_data[2][3];

    oldDiv.data[3].x=new_data[3][0];
    oldDiv.data[3].y=new_data[3][1];
    oldDiv.data[3].text=new_data[3][3];

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

function gateItGatedMixedScatter(oldPlot,new_x,new_y,xrange,yrange,gateX,gateY) {
    var oldDiv=oldPlot;
    var new_data=split2Quadrants(new_x,new_y,gateX,gateY);

    oldDiv.data[0].x=new_data[0][0];
    oldDiv.data[0].y=new_data[0][1];
    oldDiv.data[0].text=new_data[0][3];
  

    oldDiv.data[1].x=new_data[1][0];
    oldDiv.data[1].y=new_data[1][1];
    oldDiv.data[1].text=new_data[1][3];

    oldDiv.data[2].x=new_data[2][0];
    oldDiv.data[2].y=new_data[2][1];
    oldDiv.data[2].text=new_data[2][3];

    oldDiv.data[3].x=new_data[3][0];
    oldDiv.data[3].y=new_data[3][1];
    oldDiv.data[3].text=new_data[3][3];

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
      if( _v > min && _v < max) {
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
function addTwoD(blob,keyX,keyY) {
  var _data=getScatterSetAt(blob, keyX, keyY);

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

  var _layout=getScatterSetDefaultLayout(trimKey(keyX),trimKey(keyY),null,null);
  saveScatterPlot=addAPlot('#myViewer',_data, _layout, 600,600);
}

// scatter with gating
function addGTwoD(blob,keyX,keyY,gateX,gateY) {

  var _data=getGatedScatterSetAt(blob, keyX, keyY,gateX,gateY);
  {
    var tmp0=_data[0]['x'];
    var tmp=tmp0.concat(_data[1]['x'],_data[2]['x'],_data[3]['x']);
    var _max=Math.max.apply(Math,tmp);
    var _min=Math.min.apply(Math,tmp);
    slider_X_dirty=true;
    stashSliderLimit("#channel1_slider", _min, _max);
  }
  {
    var tmp0=_data[0]['y'];
    var tmp=tmp0.concat(_data[1]['y'],_data[2]['y'],_data[3]['y']);
    var _max=Math.max.apply(Math,tmp);
    var _min=Math.min.apply(Math,tmp);
    slider_Y_dirty=true;
    stashSliderLimit("#channel2_slider", _min, _max);
  }

  var _layout=getGatedScatterSetDefaultLayout(trimKey(keyX),trimKey(keyY),null,null);
  saveGatedScatterPlot=addAPlot('#myViewer',_data, _layout, 600,600);
}

// scatter with histogram subplots
function addMixed(blob, keyX, keyY) {
  var _data=getMixedSetAt(blob, keyX, keyY);
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

  var _layout=getMixedSetDefaultLayout(trimKey(keyX), trimKey(keyY),null,null);
  saveMixPlot=addAPlot('#myViewer',_data, _layout, 600, 600);
}

// mixed scatter with gating
function addGMTwoD(blob,keyX,keyY,gateX,gateY) {

  var _data=getGatedMixedScatterSetAt(blob, keyX, keyY,gateX,gateY);
  {
    var tmp0=_data[0]['x'];
    var tmp=tmp0.concat(_data[1]['x'],_data[2]['x'],_data[3]['x']);
    var _max=Math.max.apply(Math,tmp);
    var _min=Math.min.apply(Math,tmp);
    slider_X_dirty=true;
    stashSliderLimit("#channel1_slider", _min, _max);
  }
  {
    var tmp0=_data[0]['y'];
    var tmp=tmp0.concat(_data[1]['y'],_data[2]['y'],_data[3]['y']);
    var _max=Math.max.apply(Math,tmp);
    var _min=Math.min.apply(Math,tmp);
    slider_Y_dirty=true;
    stashSliderLimit("#channel2_slider", _min, _max);
  }

  var _layout=getGatedMixedScatterSetDefaultLayout(trimKey(keyX),trimKey(keyY),null,null);
  saveGatedMixedScatterPlot=addAPlot('#myViewer',_data, _layout, 600,600);
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

/*****MAIN*****/
jQuery(document).ready(function() {

$('.plot-list-select2').select2(); 
$('.x-list-select2').select2();
$('.y-list-select2').select2();

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
       var nfstub=setupDataListWithInner();
       blob=loadBlobFromInner(nfstub);
       saveBlob=blob;
       dataKeys=setupUI(blob);
       slider_X_dirty=true;
       slider_Y_dirty=true;
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

// FUN-O
function animateByTimeClick() { 
  var max=2000;
  var step=100;
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

