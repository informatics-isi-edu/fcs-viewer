// http://localhost/plotly/view.html?http://localhost/data/plotly/YLW-HLin.json

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

function getKeys(blob) {
  var keys = Object.keys(blob); 
  return keys;
}

function getHistogramSetAt(blob, key) {
  var s=blob[key];
  var x= Object.keys(s).map(function(k) { return parseFloat(s[k]) });
  var data= [ { "x": x, "type" :"histogram" } ];
  return data;
}

function getHistogramDefaultLayout(sample,key){
  var t="Histogram of "+key+ " in "+sample;
  var p= {
      "title": t,
      "margin": { "r": 100, "t": 80, "b": 80, "l": 80 },
      "xaxis": { "title":key, "autorange": true },
      "yaxis": { "title":"Count","autorange": true }
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

function addAPlot(data, layout) {
  var d3 = Plotly.d3;
  var gd3 = d3.select('body')
    .append('div')
    .style({
        width: 500,
        height: 300
    });

  var gd = gd3.node();
  Plotly.plot(gd, data, layout);
}

jQuery(document).ready(function() {
  // process for args, data & layout
  var url='http://localhost/data/plotly/data.json';
  var args= document.location.href.split('?');
  if (args.length === 2) {
     url=getURL(args);
  }

//http://localhost/plotly/view.html?http://localhost/data/plotly/inf_072514.EP5.json
  var blob=loadBlobFromJsonFile(url);
  var fstub=chopForStub(url);

  var dataKeys=getKeys(blob);
  var cnt=dataKeys.length;
  for(var i=0; i<cnt; i++) {
     var key=dataKeys[i];

     var _data=getHistogramSetAt(blob, key);
     change2Log(_data);
     var _layout=getHistogramDefaultLayout(fstub,key);
     addAPlot(_data, _layout);
  }

  //var p = loadDataFromFile(url);
  //change2Log(p[0]);
  //var _data=p[0];
  //var _layout=p[1];
  //Plotly.plot("plotlyviewer", _data, _layout);
})
