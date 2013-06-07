(function(window){
  var mathMinute = {
    _dataObj: {length: 0, count: 0},
    init: function(){
      this._dataArray = new Array();
      return this;
    },
    areEqual: function(a,b,ignore){
      if (typeof a === typeof b){
        if (typeof a === "object"){
          if (a.nodeType && b.nodeType) return a === b;
          for (var i in a){
            if (!isIgnored(i,ignore) && !this.areEqual(a[i],b[i])){
              return false;
            }
          }
          return true;
        }else{
          return a === b;
        }
      }else{
        return false;
      }
      function isIgnored(key,ignore){
        if (!ignore) return false;
        ignore = typeof ignore === "object" && ignore.length ? ignore : [ignore];
        for (var i=0; i<ignore.length; i++){
          if (ignore[i]==key) {
            return true;
          }
        }
        return false;
      }
    },
    data: function(el,name,key,value){
      var $this = this;
      var rObj = {length: 0};
      $(el).each(function(idx){
        var ind = this["data-mm"];
        if (typeof ind !== "number"){
          $this._dataObj[$this._dataObj.count]={element: this, data: new Object()};
          ind = $this._dataObj.count;
          this["data-mm"] = ind;
          $this._dataObj.count++;
          $this._dataObj.length++;
        }
        //name = name || "El";
        if (!$this._dataObj[ind].data[name]) $this._dataObj[ind].data[name] = new Object();
        var v;
        if (key && typeof value !== "undefined"){
          //v = typeof value === "function" ? value.call(this,idx) : value;
          v = value;
          $this._dataObj[ind].data[name][key] = v;
        }else if (key && typeof value === "undefined"){
          v = $this._dataObj[ind].data[name][key];
        }else{
          v = name ? $this._dataObj[ind].data[name] : $this._dataObj[ind];
        }
        rObj[rObj.length] = v;
        typeof rObj[rObj.length] !== "undefined" && rObj.length++;
      });
      return rObj;
    },
    exists: function(selector,parent){
      var p = parent ? $(parent) : $("body");
      var el = p.find(selector);
      return el.length > 0 ? el : null;
    },
    extend: function(name,obj){
      obj.name = name;
      this[name] = obj;
      return this;
    },
    indexOf: function(a,val,ignore){
      if (typeof a !== "object") a = [a];
      for (var i=0; i<a.length; i++){
        if (this.areEqual(a[i],val,ignore)) return i;
      }
      return -1;
    },
    interpolate: function(x1,x2,t1,t2,ti){
      // just a simple linear interpolator (y=mx+b)
      var m = (t2-t1)/(x2-x1);
      return m == 0 ? x2 : ((ti-t1)/m)+x1;
    },
    parseColor: function(str){
      str = $.trim(str);
      if (str == "transparent"){
        str = "rgba(0, 0, 0, 0)";
      }
      var o = null;
      if (str.substr(0,1) === "#"){
        o = this.hexToRgb(str);
      }else{
        // really simple regx to get numbers
        var regx = /(\d{0,3}\.*\d+)/g;
        var digits = str.match(regx);
        if (digits.length < 3){

        }else if (digits.length>3){
          o = this.rgbToHex(parseInt(digits[0]),parseInt(digits[1]),parseInt(digits[2]));
          o["a"] = parseFloat(digits[3]);
        }else{
          o = this.rgbToHex(parseInt(digits[0]),parseInt(digits[1]),parseInt(digits[2]));
          o["a"] = 1.0;
        }
      }
      if (o != null){
        o["isColor"] = true;
      }
      return o;
    },
    removeData: function(el,name){
      var $this = this;
      $(el).each(function(){
        //var ind =this.indexOf($this._dataArray,el,"data");
        ind = this["data-mm"];
        if (ind > -1){
          if (name){
            delete $this._dataObj[ind][name];
          }else{
            delete $this._dataObj[ind];
            $this._dataObj.length--;
          }
        }
      });
    },
    rgbToHex: function(r, g, b) {
      function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
      }
      return {
        hex: "#" + componentToHex(r) + componentToHex(g) + componentToHex(b),
        r: r,
        g: g,
        b: b
      }
    },
    hexToRgb: function(hex) {
      // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
      var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
      });
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        hex: hex,
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    },
    parseCss: function(el,prop,val,normalize){
      var $this = this;
      if (typeof prop !== "string") return;
      var propL = prop.toLowerCase();
      if (propL === "padding" || propL === "margin" || propL === "borderwidth" || propL === "borderradius"){
        return getCssTRBL(el,prop,val,normalize);
      }else{
        var n = getCssNumObj(el,prop,val,normalize);
        n.isNumber = true;
        return n;
      }
      function getCssTRBL(el,prop,val,normalize){
        //this is for getting things like marginLeft, marginRight, or borderTopWidth
        if (typeof val == "object"){
          // needs more error checking to make sure it's a numObj
          return val;
        }
        var regx = /([A-Z])/g;
        var o = new Object();
        o["trbl"]=true; // this will indicate we have to loop through them when animating etc
        var a = prop != "borderRadius" ? ["Top","Right","Bottom","Left"] : ["TopLeft","TopRight","BottomRight","BottomLeft"];
        if (regx.test(prop)) {
          for (var i=0; i<a.length; i++){
            o[prop.replace(/([A-Z])/g,a[i]+"$1")] = getCssNumObj(el,prop.replace(/([A-Z])/g,a[i]+"$1"),val,normalize);
          }
        } else {
          o[prop+"Top"] = this.getCssNumObj(el,prop+"Top",val,normalize);
          o[prop+"Right"] = this.getCssNumObj(el,prop+"Right",val,normalize);
          o[prop+"Bottom"] = this.getCssNumObj(el,prop+"Bottom",val,normalize);
          o[prop+"Left"] = this.getCssNumObj(el,prop+"Left",val,normalize);
        };
        // figure out if it's a list of colors
        for (var k in o){
          if (k != "trbl"){
            if (o[k]["isColor"]){
              o["isColor"] = true;
            }
            break;
          }
        }
        return o;
      };
      function getCssNumObj(el,prop,val,normalize){
        // this is to be able to track if number is px, em, %, etc
        if (typeof val == "object"){
          return val;
        }
        var regx = /color/i;
        val = $this.isValid(val) ? val : $(el).css(prop);
        return regx.test(prop) ? $this.parseColor(val) : getNumTypeObject(val,prop,normalize);
      };
      function getNumTypeObject(str,prop,normalize){
        //var reg=/^(-*[0-9]+)(\S+)*/; // 1 = number, 2 = type (% or px or Em or whatever)
        var reg=/([-+]*(?:\d+)*(?:\.\d+)*(?:e[-+]*\d+)*)(\S*)/;
        str = $.trim(str);
        var a = str.match(reg);
        var o = $this.isValid(a) ? a.length >=3 ? {num: parseFloat(a[1]), type: a[2]}: a.length > 1 ? {num: parseFloat(a[1]), type: null} : null : null;
        // maybe normalize it here sometime
        return normalize ? normalizeCssNumObj(el,prop,o) : o;
      };
      function normalizeCssNumObj(el,prop,o){
        var regxW=/width|left|right/i;
        var regxH=/height|top|bottom/i;
        //ignore border stuff for now -- you shouldn't be setting a % for a border width or radius anyway, bro!!
        var regxReturn = /border/i;
        if (regxReturn.test(prop) || o.type != "%"){
          return o;
        }
        var p = $(el).parent();
        if (regxW.test(prop)){
          var w = p.width();
          o.num=(o.num/100)*w;
          o.type="px";
        }else if (regxH.test(prop)){
          var h = p.height();
          o.num=(o.num/100)*h;
          o.type="px";
        }
        return o;
      }
    },
    isValid: function(o){
      return (typeof o !== "undefined" && typeof o !== "null");
    },
    roundNum: function(num,dec){
      // this is to round a number to the nearest decimal
      var n = this.normalizeNum(num,dec);
      return n.sign * Math.round(n.sign*num*n.pow)/n.pow;
    },
    normalizeNum: function(num,dec){
      return {sign: num < 0 ? -1 : 1, pow: Math.pow(10,typeof dec !== "number" ? 0 : dec)};
    },
    mimicClick: function(el,func,returnTrue){
      returnTrue = typeof returnTrue === "boolean" ? returnTrue : true;
      $(el).each(function(idx){
        (function(el){
          var clicked = false;
          $(el).mousedown(function(e){
            clicked = true;
            $(this).addClass("tempActive");
            return returnTrue;
          }).mouseup(function(e){
            if (clicked){
              $(this).removeClass("tempActive");
              return func.call(this,e);
            }
            clicked = false;
          });
          var mouseup = function(e){
            (e.target !== el && clicked) && $(el).removeClass("tempActive");
            clicked = false;
          }
          $(document).bind('mouseup',mouseup);
          $(el).bind("remove",function(){
            $(document).unbind('mouseup',mouseup);
          });
        })(this);
      });
      return el;
    }
  };
  window.mathMinute = mathMinute;
})(window);



