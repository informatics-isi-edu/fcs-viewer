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

/** Change the displayed value for min, max and range when slider changes.
 @param event
 @param ui
 @param string slider: Selector for the slider element
 @param strign slider_min: Selector for the slider min label element
 @param strign slider_min: Selector for the slider max label element
 **/
function changeSliderInputs(event, ui, slider, slider_min, slider_max){
  var max=$(slider).slider("option","max"); // max value
  var min=$(slider).slider("option","min"); // min value
  var t=$(slider).slider("option","range"); // range value

  var _min, _max; // values to be shown as min and max.
  if(t === "max"){
    _max = checkMax(ui.values[0], max, min) ? max : "";
    _min = checkMin(ui.values[0], max, min) ? min : "";
    $(slider+' span.ui-slider-handle').attr('data-before', ui.values[0]);
  }else{
    _max = checkMax(ui.values[0], max, min) && checkMax(ui.values[1], max, min) ? max : "";
    _min = checkMin(ui.values[0], max, min) && checkMin(ui.values[1], max, min) ? min : "";

    $(slider+' span.ui-slider-handle:nth-of-type(1)').attr('data-before', ui.values[0]);
    $(slider+' span.ui-slider-handle:nth-of-type(2)').attr('data-before', ui.values[1]);
  }
  $(slider_min).text(_min);
  $(slider_max).text(_max);
}
/*Check the value to see if it's appropriate to show maximum value in slider or not*/
function checkMax(val, max, min){
  return (max-val)/(max-min) > 0.1;
}
/*Check the value to see if it's appropriate to show minimum value in slider or not*/
function checkMin(val, max, min){
  return (val-min)/(max-min) > 0.1;
}

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
      changeSliderInputs(event, ui, "#channel1_slider", "#slider1Min", "#slider1Max");
    },
    slide: function(event, ui){
      changeSliderInputs(event, ui, "#channel1_slider", "#slider1Min", "#slider1Max");
    },
    stop:function(event,ui) {
        xRangeClick();
    }
  });
  $("#slider1Min").text(_min);
  $("#slider1Max").text(_max);

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
      changeSliderInputs(event, ui, "#channel2_slider", "#slider2Min", "#slider2Max");
    },
    slide: function(event, ui){
      changeSliderInputs(event, ui, "#channel2_slider", "#slider2Min", "#slider2Max");
    },
    stop:function(event,ui) {
        yRangeClick();
    }
  });
  $("#slider2Min").text(_min);
  $("#slider2Max").text(_max);
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
