(function(mathMinute){
  var name = "GameSlide";
  mathMinute.extend(name,mathMinute.Animator.subClass({
    init: function(el,opts){
      this._super(el);
      if (this.initialized()) return this;

      this.$el.addClass("slide");
      if (typeof opts === "object"){
        this.setIndex(opts.index);
      }
      return this;
    },
    setIndex: function(ind){
      ind = typeof ind === "number" ? ind : this.$el.parent().find("li").length;
      this.$el.attr("data-index",ind);
      return this;
    },
    toggle: function(opts,time){
      var $this = this;
      time = typeof time === "number" ? time : 109;
      this.$el.each(function(idx){
        var $t = $(this);
        if ($t.is(":visible")){
          $this.hide(opts,time,this);
        }else{
          $this.show(opts,time,this);
        }
      });
      return this;
    },
    show: function(opts,time,el){
      //opts: {dir: string, before: func, after: func}
      opts = typeof opts === "object" ? opts : {};
      time = typeof time === "number" ? time : 109;
      el = el ? $(el) : this.$el;
      var css = this.getAnimateCss(opts.dir);
      var $this = this;
      el.each(function(){
        var $t = $(this);
        if ($t.is(":hidden")){
          $t.css(css.start);
          $t.trigger("slideBeforeShow",[$this]);
          typeof opts.before === "function" && opts.before.call(this,$this);

          $this.animate(css.end,time,function(){
            //console.log("showing",this);
            typeof opts.after === "function" && opts.after.call(this,$this);
            $(this).trigger("showing",[new Date().getTime()]);
          },null,$t);
        }
      });
      return this;
    },
    hide: function(opts,time,el){
      // opts: {dir: string, before: func, after: func}
      opts = typeof opts === "object" ? opts : {};
      time = typeof time === "number" ? time : 109;
      el = el ? $(el) : this.$el;
      var css = this.getAnimateCss(opts.dir,true);
      var $this = this;
      el.each(function(){
        var $t = $(this);
        if ($t.is(":visible")){
          $t.css(css.start);
          //$t.trigger("slideBeforeHide",[$this]);
          typeof opts.before === "function" && opts.before.call(this,$this);
          $this.animate(css.end,time,function(){
            typeof opts.after === "function" && opts.after.call(this,$this);
            $(this).hide();
          },null,$t);
        }
      });
      return this;
    },
    getAnimateCss: function(dir,hide){
      dir = typeof dir === "string" ? dir : "fade";
      // not the most efficient -- should probably re-think it when I have time
      //var cssEnd = {opacity: hide ? 0 : 1};
      //var cssStart = {opacity: hide ? 1 : 0};
      var cssEnd = {};
      var cssStart = {
        zIndex: hide ? 1 : 0,
        top: "",
        left: "",
        opacity: 1,
      };
      if (!hide){
        cssStart.display = "block";
      }
      switch(dir){
        case "left":
          cssEnd.left   = hide ? "-100%" : "0%";
          cssStart.left = hide ?  "0%" : "100%";
          break;
        case "right":
          cssEnd.left   = hide ? "100%" : "0%";
          cssStart.left = hide ? "0%" : "-100%";
          break;
        case "up":
          cssEnd.top   = hide ? "-100%" : "0%";
          cssStart.top = hide ? "0%" : "100%";
          break;
        case "down":
          cssEnd.top   = hide ? "100%" : "0%";
          cssStart.top = hide ? "0%" : "-100%";
          break;
        default:
          // fade
          cssEnd.opacity   = hide ? 0 : 1;
          cssStart.opacity = hide ? 1 : 0;
          break;
      }
      return {start: cssStart, end: cssEnd};
    },
    reset: function(el){
      el = el ? $(el) : this.$el;
      var $this = this;
      el.each(function(idx){
        var $t = $(this);
        if ($t.is(":visible")){
          $t.width("100%");
          $this.resize(this);
        }
      });
      return this;
    },
  },name));


})(mathMinute);

(function(mathMinute){
  var name = "EquationSlide";
  mathMinute.extend(name,mathMinute.GameSlide.subClass({
    init: function(el,opts){
      this._super(el,opts);
      if (this.initialized()) return this;

      this.$el.addClass("equationSlide");
      var $this = this;
      this.$el.each(function(idx){
        var ediv = mathMinute.exists("div.q",this) || $("<div>",{"class":"q"}).appendTo(this);
        var adiv = mathMinute.exists("div.a",this) || $("<div>",{"class":"a"}).appendTo(this);
        var ul = mathMinute.exists("ul",adiv) || $("<ul>").appendTo(adiv);
        var ali = mathMinute.exists("li[data-index='1']",ul) || $("<li>",{"data-index":"1"}).appendTo(ul);
        var bli = mathMinute.exists("li[data-index='2']",ul) || $("<li>",{"data-index":"2"}).appendTo(ul);
        var bli_i = mathMinute.exists("input[type='text'].answer",bli) || $("<input>",{"type": "text","class":"answer"}).appendTo(bli);
        var cli = mathMinute.exists("li[data-index='3']",ul) || $("<li>",{"data-index":"3"}).appendTo(ul);
        var cli_i = mathMinute.exists("a.iconContainer",cli) || $("<a>",{"class":"iconContainer"}).appendTo(cli);
        cli_i.text("Next");

        var eq = new mathMinute.Equation(ediv);
        $this._data("equation",eq,this);

        var $t = $(this);
        mathMinute.mimicClick(cli_i,function(e){
          $t.parent().trigger("next",[$this]);
        }).mousedown(function(e){
          bli_i.is(":focus") && bli_i.blur();
          // prevent crazy selections etc;
          return false;
        });

        bli_i.keyup(function(e){
          if (e.which === 27){
            $(this).blur();
          }else if (e.which === 13){
            $t.parent().trigger("next",[$this]);
          }
        });
        $this._data("input",bli_i,this);

      });
      this.$el.bind("showing",function(e,currTime){
        $this._data("startTime",currTime,this,name);
      });
      //this.newEquation();

      var mousedown = function(e){
        $this.$el.find("input.answer").each(function(idx){
          var $t = $(this);
          ($t.is(":visible") && $t.is(":focus") && !$t.is(e.target)) && $t.blur();
        });
      }

      $(document).bind("mousedown",mousedown);
      this.$el.bind("remove",function(){
        $(document).unbind("mousedown",mousedown);
      });

      this._data("init",true);
      return this;
    },
    newEquation: function(type,difficulty){
      var to = getType(type);
      var no = getMaxNumbers(difficulty,to.type);
      console.log(to,difficulty);
      var n1 = null, n2 = null, n3 = null, n4 = null;
      switch (to.type){
        case "/":
          n3 = getRandom(no.maxNum1,true);
          n4 = getRandom(no.maxNum2,true);
          n1 = n3*n4;
          var r = getRandom(1,true);
          n2 = r > 0 ? n3 : n4;
          break;
        default:
          n3 = getRandom(no.maxNum1);
          n4 = getRandom(no.maxNum2);
          n1 = n3 > n4 ? n3 : n4;
          n2 = n3 > n4 ? n4 : n3;
          break;
      }
      var o = {
        x: n1,
        y: n2,
        type: to.type,
        oType: to.oType,
        difficulty: no.difficulty,
        oDifficulty: no.oDifficulty
      }

      return this.setEquation(o);

      function getRandom(num,cantBeZero){
        var n = Math.round(Math.random()*num);
        return (n != 0 || !cantBeZero) ? n : getRandom(num,cantBeZero);
      };

      function getType(type){
        var nType = typeof type === "string" && type.toLowerCase() != "any" ? testType(type) : getRandomType();
        return {type: nType, oType: type || "random"};

        function testType(type){
          switch(type.charCodeAt(0)){
            case 215:
              type = "*";
              break;
            case 247:
              type = "/";
              break;
            default:
              break;
          }
          return type;
        }

        function getRandomType(){
          var n = getRandom(3);
          switch(n){
            case 0:
              return "+";
            case 1:
              return "-";
            case 2:
              return "*";
            case 3:
              return "/";
            default:
              return "+";
          }
        }
      };
      function getMaxNumbers(difficulty,type){
        var nD = typeof difficulty === "string" && difficulty.toLowerCase() != "any" ? difficulty.toLowerCase() : getRandomDifficulty();
        var n1 = null;
        var n2 = null;
        var d = null;
        switch(nD){
          case "easy":
            d = "easy";
            n1 = 10;
            n2 = 10;
            break;
          case "medium":
            d="medium";
            if (type == "*" || type == "/"){
              n1 = 12;
              n2 = 12;
            }else{
              n1 = 100;
              n2 = 10;
            }
            break;
          case "hard":
            d="hard";
            if (type == "*" || type == "/"){
              n1 = 100;
              n2 = 12;
            }else{
              n1 = 100;
              n2 = 100;
            }
            break;
          case "very hard":
            d="very hard";
            if (type == "*" || type == "/"){
              n1 = 1000;
              n2 = 100;
            }else{
              n1 = 1000;
              n2 = 1000;
            }
            break;
          default:
            d="easy";
            n1 = 10;
            n2 = 10;
            break;
        }
        return {maxNum1: n1, maxNum2: n2, difficulty: d, oDifficulty: difficulty || "random"};
        function getRandomDifficulty(){
          var n = getRandom(3);
          var d = "easy";
          switch(n){
            case 1:
              d = "medium";
              break;
            case 2:
              d = "hard";
              break;
            case 3:
              d = "very hard";
              break;
          }
          return d;
        }
      }
    },
    setEquation: function(eqObj){
      var $this = this;
      eqObj = eqObj.length ? eqObj : [eqObj];
      this.$el.each(function(idx){
        var eq = $this.getEquation(this);
        var i = idx > eqObj.length-1 ? eqObj.length-1 : idx;
        //console.log(eqObj[i]);
        eq.setEquation(eqObj[i]);
      });
      return this;
    },
    getEquation: function(el){
      //return el ? this._get("equation",el)[0] : this._data("equation");
      return this.get("equation",el);
    },
    getCanvas: function(el){
      return el ? this.getEquation(el).getCanvas()[0] : this._get("canvas",this.$el,"Equation");
    },
    getInput: function(el){
      return this.get("input",el);
    },
    reset: function(el){
      // resize it, focus the input, clear the canvas, force a resize on the canvas
      el = el ? $(el) : this.$el;
      var $this = this;
      el.each(function(idx){
        var $t = $(this);
        $this.getInput(this).val('');
        $this.resize(this);
        $this.getCanvas(this).clear().sizeCanvas();
      });
      return this;
    },
    resize: function(el){
      var $this = this;
      el = el ? $(el) : this.$el;
      el.each(function(idx){
        var $t = $(this);
        if ($t.is(":visible")){
          var eq = $this.getEquation(this).resize();
          var ic = $(this).find(".a .iconContainer");
          var input = $(this).find(".a .answer");
          var p = ic.parent();
          var w = p.width();
          ic.css({
            height: w,
            marginTop: -w/2,
            lineHeight: w+"px",
            fontSize: w*0.3+"px"
          });
          var h = Math.floor(0.6*input.height());
          input.css({
            lineHeight: h+"px",
            fontSize: h+"px"
          });
        }
      });
      return this;
    },
    value: function(el){
      el = el ? $(el) : this.$el;
      var $this = this;
      var o = {length: 0};
      el.each(function(idx){
        var eq = $this.getEquation(this).getEquation()[0];
        var ca = eval(eq.x+eq.type+eq.y);
        o[o.length] = {
          q: eq,
          a: $this.getInput(this).val(),
          c: ca,
          l: $this.getCanvas(this).getLog()[0],
          t: new Date().getTime() - $this.get("startTime",this)
        }
        o.length++;
      });
      return o.length < 2 ? o[0] : o;
    },
    submit: function(){

    },
  },name));
})(mathMinute);

(function(mathMinute){
  var name = "StartSlide";
  mathMinute.extend(name,mathMinute.GameSlide.subClass({
    init: function(el,opts){
      opts = typeof opts === "object" ? opts : {index: 0};
      this._super(el,opts);
      if (this.initialized()) return this;

      this.initButton().setButton(opts.buttonText).resize();
      return this;
    },
    initButton: function(){
      var $this = this;
      this.$el.each(function(idx){
        var $t = $(this);
        var btn = mathMinute.exists("div.startButton",this) || $("<div>",{"class":"startButton"}).appendTo(this);
        btn.addClass("gameTextShadow");
        $this._data("startButton",btn,this);
      });
      return this;
    },
    setButton: function(txt,el){
      txt = typeof txt === "string" ? txt : "Start";
      el = el ? $(el) : this.$el;
      var $this = this;
      el.each(function(idx){
        var btn = $this.get("startButton",this);
        btn.text(txt);
      });
      return this;
    },
    getButton: function(el){
      return this.get("startButton",el)
    },
    resize: function(el){
      var $this = this;
      el = el ? $(el) : this.$el;
      el.each(function(idx){
        var $t = $(this);
        if ($t.is(":visible")){
          var btn = $this.get("startButton",this);
          var h = btn.height();
          btn.css({
            lineHeight: h + "px",
            fontSize: h + "px",
            marginTop: -h/2
          });
          var w = btn.width();
          btn.css("marginLeft",-w/2);
        }
      });
      return this;
    },
  },name));
})(mathMinute);

(function(mathMinute){
  var name = "EndSlide";
  mathMinute.extend(name,mathMinute.GameSlide.subClass({
    init: function(el,opts){
      opts = typeof opts === "object" ? opts : {index: 0};
      this._super(el,opts);
      if (this.initialized()) return this;
      this.$el.each(function(idx){
        var $t = $(this);
        var xout = (mathMinute.exists(".xout",this) || $("<div>",{"class":"xout"}).appendTo(this)).addClass("gameTextShadow").html("&times;");
        mathMinute.mimicClick(xout,function(e){
          $t.trigger("xout");
        },false);
        $this._data("xout",xout,this,name);
      });
      return this;
    },
    resize: function(el){
      el = el ? $(el) : this.$el;
      var $this = this;
      el.each(function(idx){
        var $t = $(this);
        if ($t.is(":visible")){
          var xout = $this.get("xout",$t);
          var h = xout.height();
          xout.css({
            lineHeight: h + "px",
            fontSize:   h + "px"
          });
        }
      });
      return this;
    }
  },name));
})(mathMinute);
