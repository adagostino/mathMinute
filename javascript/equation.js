(function(mathMinute){
  var name = "Equation";
  mathMinute.extend(name,mathMinute.El.subClass({
    init: function(el){
      this._super(el).$el.addClass("equation gameTextShadow");
      var $this = this;
      this.$el.each(function(idx){
        var pad = mathMinute.exists(".pad",this) || $("<div>",{"class":"pad"}).appendTo(this);
        var num1 = mathMinute.exists(".num1",this) || $("<div>",{"class": "num1"}).appendTo(this);
        var d = mathMinute.exists(".divider.divide",this) || $("<div>",{"class": "divider divide"}).appendTo(this);
        var divider = mathMinute.exists(".hr",d) || $("<div>",{"class":"hr"}).appendTo(d);
        var num2 = mathMinute.exists(".num2",this) || $("<div>",{"class": "num2"}).appendTo(this);
        var sign = mathMinute.exists(".sign",num2) || $("<div>",{"class": "sign"}).appendTo(num2);
        var e = mathMinute.exists(".divider.equals",this) || $("<div>",{"class": "divider equals"}).appendTo(this);
        var equals = mathMinute.exists(".hr",e) || $("<div>",{"class":"hr"}).appendTo(e);
        var numerator = mathMinute.exists(".number",num1) || $("<div>",{"class": "number"}).appendTo(num1);
        var denominator = mathMinute.exists(".number",num2) || $("<div>",{"class": "number"}).appendTo(num2);
        var canvas = mathMinute.exists(".canvasContainer",this) || $("<div>",{"class":"canvasContainer"}).appendTo(this);
        var c = new mathMinute.Canvas(canvas);


        $this._data("num",numerator[0],this);
        $this._data("den",denominator[0],this);
        $this._data("sign",sign[0],this);
        $this._data("divider",divider[0],this);
        $this._data("equals",equals[0],this);
        $this._data("width",$(this).width(),this);
        $this._data("height",$(this).height(),this);
        $this._data("canvas",c,this);
      });

      //this.setEquation(12345,345,"addition");
    },
    getCanvas: function(el){
      return this.get("canvas",el);
      //return el ? this._get("canvas",el)[0] : this._data("canvas");
    },
    resize: function(){
      var lw = this._data("width");
      var lh = this._data("height");
      var $this = this;
      this.$el.each(function(idx){
        var $t = $(this);
        var w = $t.width();
        var h = $t.height();
        if (w != lw[idx] || h != lh[idx]){
          $this._data("width",w,this);
          $this._data("height",h,this);
          var eq = $this._get("equation",this)[0];
          eq && $this.setEquation(eq);
        }
      });
      return this;
    },
    getEquation: function(el){
      return this.get("equation",el);
    },
    setEquation: function(eqObj){
      this._data("equation",eqObj);
      var x = eqObj.x, y=eqObj.y, type=eqObj.type;
      var num = this._get("num");
      var den = this._get("den");
      var signs = this._get("sign");
      var div = this._get("divider");
      var equ = this._get("equals");

      var signBuffer = 0;

      this.$el.each(function(idx){
        var $t = $(this);
        (type === "division" || type === "/") ? $t.removeClass("asm").addClass("divide") : $t.removeClass("divide").addClass("asm");

        var $n = $(num[idx]);
        var h = Math.floor($n.height());
        var fs = h;
        $n.css({
          lineHeight: h + "px",
          fontSize: fs
        }).html(x);
        var w = $n.width();
        var pw = $n.parent().width();
        var nw = $n.width();
        var $s = $(signs[idx]);
        $s.css({
          //"right":Math.round(pw-l),
          lineHeight: h + "px",
          fontSize: fs
        }).html(getSign(type));
        var sw = $s.width();

        signBuffer=Math.round(sw/2);
        var l = (pw - nw + sw)/2;
        $n.css("left",Math.round(l));
        $s.css("right",Math.round(pw-l+signBuffer));

        var $div = $(div[idx]);
        var right = Math.round(pw-l-nw);
        $div.css({
          left: Math.round(l),
          right: right
        });
        var $d = $(den[idx]);
        $d.width(nw);
        $d.css({
          lineHeight: h + "px",
          fontSize: fs,
          left: Math.round(l)
        }).text(y);
        var $eq = $(equ[idx]);
        $eq.css({
          left: Math.round(l-sw-signBuffer),
          right: right
        });
      });

      function getSign(sign){
        // not sure what i want the signs to be yet.
        switch(sign){
          case "subtraction":
            return "-";
            break;
          case "subtract":
            return "-";
            break;
          case "sub":
            return "-";
            break;
          case "-":
            return "-";
            break;
          case "multiplication":
            return "&times;";
            break;
          case "multiply":
            return "&times;";
            break;
          case "times":
            return "&times;";
            break;
          case "x":
            return "&times;";
            break;
          case "*":
            return "&times;";
            break;
          case "division":
            return "";
            break;
          case "divide":
            return "";
            break;
          case "/":
            return "";
            break;
          default:
            return "+";
            break;
        }
      }

      function getFontSize(el){
        var c = $(el).clone()
        c.css({
          "visibility":"hidden",
          "left":"-100%"
        });
        $(el).after(c);
        var n = c.find(".num1 .number").css("fontSize","100%").text(x);
        var h = n.height();
        var fs = setFontSize(n,Math.floor(.75*h));
        c.remove();
        return fs;
      }

      function setFontSize(el,currFS,lastFS){
        currFS = typeof currFS == "number" ? currFS : parseFloat(el.css("fontSize"));
        var nextFS = currFS + 1;
        el.css("fontSize",currFS);
        return isOverflowing(el[0]) ? lastFS : setFontSize(el,nextFS,currFS);
      }

      function isOverflowing(el){
        return (el.offsetHeight < el.scrollHeight || el.offsetWidth < el.scrollWidth);
      }
    },

  },name));

})(mathMinute);
