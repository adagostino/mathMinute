(function(mathMinute){
  var name = "Icon";
  mathMinute.extend(name,mathMinute.El.subClass({
    init: function(el,opts){
      this._super(el);
      if (this.initialized()) return this;

      if (opts){
        this.setPath(opts).setBuffer(opts).setReflect(opts).setAttr(opts);
      }
      this.setPaper().setIcon();
      var $this = this;
      this.listenForResize(function(){
        $this.resize();
      });
      return this;
    },
    getBuffer: function(el){
      return this.get("buffer",el);
      //return el ? this._get("buffer",el)[0] : this._data("buffer");
    },
    getIcon: function(el){
      return this.get("pathObject",el);
      //return el ? this._get("pathObject",el)[0] : this._data("pathObject");
    },
    getPaper: function(el){
      //return el ? this._get("paper",el)[0] : this._data("paper");
      return this.get("paper",el);
    },
    setIcon: function(path,attr,buffer,reflect){
      this.setPath(path).setAttr(attr).setBuffer(buffer).setReflect(reflect);
      var $this = this;
      this.$el.each(function(idx){
        var paper = $this._get("paper",this)[0];
        var pString = $this._get("path",this)[0];
        var attr = $this._get("attributes",this)[0];
        var buffer = $this._get("buffer",this)[0];
        var reflect = $this._get("reflect",this)[0];
        var p = paper.path(pString);
        $this._data("pathObject",p,this);
        (typeof attr === "object") && p.attr(attr);
      });
      this.resize();
      return;
    },
    resize: function(el,func){
      el = el ? $(el) : this.$el;
      var $this = this;
      el.each(function(idx){
        //var reflect = typeof reflecta[idx] === "boolean" ? reflecta[idx] : false;
        var reflect = $this.get("reflect",this);
        reflect = typeof reflect === "boolean" ? reflect : false;
        var ref = reflect ? -1 : 1;
        //var buffer = typeof buffera[idx] === "number" ? buffera[idx] : 0;
        var buffer = $this.get("buffer",this);
        buffer = typeof buffer === "number" ? buffer : 0;
        var $t = $(this);
        var path = $this.get("pathObject",this);
        var bb = path.getBBox(true);
        var w = $t.width();
        var h = $t.height();
        var buffw = w*buffer/100;
        var buffh = h*buffer/100;
        var buff = buffer/100;
        //var ww = (w-buffw)/bb.width;
        var ww = w*(1-buff)/bb.width;
        //var hh = (h-buffh)/bb.height;
        var hh = h*(1-buff)/bb.height;
        if (bb.width > bb.height){
          hh*=bb.height/bb.width;
        }else{
          ww*=bb.width/bb.height;
        }
        var r= ww < hh ? ww : hh;
        path.transform("s"+(ref*r)+","+r);
        bb = path.getBBox();
          //console.log(bb);
        var x = w/2-bb.x-bb.width/2;
        var y = h/2-bb.y-bb.height/2;
        path.transform("...T"+(x)+","+(y));

      });
      return this;
    },
    setBuffer: function(opts){
      if (typeof opts === "object"){
        this._data("buffer",opts.buffer);
      }else if (typeof opts === "number"){
        this._data("buffer",opts);
      };
      return this;
    },
    setAttr: function(attr){
      if (typeof attr === "object") {
        var o = {};
        for (var i in attr){
          if (i != "path" && i != "buffer" && i != "reflect") o[i]=attr[i];
        }
        this._data("attributes",o);
      }
      return this;
    },
    setReflect: function(opts){
      if (typeof opts === "object"){
        this._data("reflect",opts.reflect);
      }else if (typeof opts === "boolean"){
        this._data("reflect",opts);
      }
      return this;
    },
    setPaper: function(){
      var $this = this;
      this.$el.each(function(idx){
        var paper = Raphael(this,"100%","100%");
        $this._data("paper",paper,this);
      });
      return this;
    },
    setPath: function(opts){
      if (typeof opts === "object"){
        this._data("path",opts.path);
      }else if (typeof opts === "string"){
        this._data("path",opts);
      }
      return this;
    }
  },name));
})(mathMinute);

(function(mathMinute){
  var name = "WordBubble";
  mathMinute.extend(name,mathMinute.Icon.subClass({
    init: function(el,opts){
      var path = "M16,5.333c-7.732,0-14,4.701-14,10.5c0,1.982,0.741,3.833,2.016,5.414L2,25.667l5.613-1.441c2.339,1.317,5.237,2.107,8.387,2.107c7.732,0,14-4.701,14-10.5C30,10.034,23.732,5.333,16,5.333z";
      opts = opts || {};
      opts.path = path;
      this._super(el,opts);
      if (this.initialized()) return this;

      this.setText().text(opts.text).resize();

      return this;
    },
    setText: function(el){
      el = el ? $(el) : this.$el;
      var $this = this;
      el.each(function(idx){
        var paper = $this.getPaper(this);
        var text = paper.text(0,0,"");
        $this._data("text",text,this);
      });
      return this;
    },
    text: function(text,el){
      el = el ? $(el) : this.$el;
      var $this = this;
      this.$el.each(function(idx){
        var txt = $this.get("text",this);
        txt.attr({
          text: text,
          x: "50%",
          stroke: "rgba(0,0,0,0.2)",
          "stroke-width": 0,
          fill: "rgba(255,255,255,1)",
          "font-weight": "bold"
        });
      });
      return this;
    },

    resize: function(el){
      el = el ? $(el) : this.$el;
      this._super(el);

      //var paths = this.getIcon();
      var $this = this;
      el.each(function(idx){
        //var path = paths[idx];
        var path = $this.getIcon(this);
        var txt = $this.get("text",this);
        //var txt = $this._get("text",this)[0];
        var bb = path.getBBox();
        var th = $(this).height();
        var y = $(this).height()/2-(bb.height/2);
        var h = bb.height;
        if (txt){
          txt.attr({
            y: bb.y2-(bb.y2-bb.y)/2
          });
          var bb2 = txt.getBBox(true);
          var ww = bb.width/bb2.width*.75;
          var hh = bb.height/bb2.height*.75;
          var r = ww < hh ? ww : hh;
          txt.transform("s"+r+","+r);
        }


      });
      return this;
      function getComputedHeight(el){
        el = el.jquery ? el[0] : el;
        if (el && window.getComputedStyle){
          return parseFloat(window.getComputedStyle(el)["height"]);
        }else if (el && el.currentStyle){
          return parseFloat(el.currentStyle["height"]);
        }
      }
    }
  },name));
})(mathMinute);

(function(mathMinute){
  var name = "Timer";
  mathMinute.extend(name,mathMinute.WordBubble.subClass({
    init: function(el,opts){
      this._super(el,opts);
      if (this.initialized()) return this;

      if (opts){
        this.setTimer(opts.seconds).reset();
      }

      return this;
    },
    setTimer: function(seconds){
      seconds = typeof seconds === "number" ? seconds : 60;
      this._data("seconds",seconds);
      return this;
    },
    start: function(el){
      el = el ? $(el) : this.$el;
      var $this = this;
      el.each(function(idx){
        if (!$this.get("clockTicking",this)){
          var $t = $(this);
          var startTime = new Date().getTime();
          var seconds = $this.get("paused",this) ? $this.get("secondsLeft",this) : $this.get("seconds",this);
          var endTime = startTime+seconds*1000;

          $this._data("prevSec",seconds,$t);
          $this._data("clockStarted",startTime,$t);
          $this._data("clockTicking",true,$t);
          requestTime($t,endTime,$this);
        }
      });

      function requestTime($t,endTime,$this){
        var currTime = new Date().getTime();
        var secF = (endTime - currTime)/1000;
        var sec = Math.floor(secF);
        //var prevSec = $this._get("prevSec",$t),name;
        var prevSec = $this.get("prevSec",$t);
        var elapsed = $this.get("elapsedSeconds",$t);
        elapsed = elapsed || 0;
        $this._data("secondsLeft",secF,$t,name);

        $this._data("lastFrame",requestAnimationFrame(function(){
          if (prevSec != sec){
            // these two lines/checks are for if someone navigates away from page
            // this is due to using RAF instead of timeout
            sec = sec <= 0 ? 0 : sec;
            sec == 0 && $this._data("clockStopped",endTime,$t,name);
            $this._data("prevSec",sec,$t,name);
            $this.text(sec,$t);
          }
          sec <= 0 ? $this.stop($t) : requestTime($t,endTime,$this);
        }),$t,name);
      }
    },
    pause: function(el){
      el = el ? $(el) : this.$el;
      var $this = this;
      el.each(function(idx){
        if ($this.get("clockTicking")){
          cancelAnimationFrame($this.get("lastFrame",this));
          $this._data("paused",true,this);
          $this._data("clockTicking",false,this);
        }
      });
      return this;
    },
    stop: function(el){
      el = el ? $(el) : this.$el;
      var $this = this;
      el.each(function(idx){
        if ($this.get("clockTicking")){
          cancelAnimationFrame($this.get("lastFrame",this));
          $(this).trigger("clockStopped",[$this.get("clockStarted",this),$this.get("clockStopped",this)]);
          $this._data("clockTicking",false,this);
          $this._data("clockStarted",null,this);
          $this._data("clockStopped",null,this);
          $this._data("secondsLeft",null,this);
          $this._data("paused",false,this);
        }
      });
      return this;
    },
    show: function(el){
      el = el ? $(el) : this.$el;
      var $this = this;
      el.each(function(idx){
        $(this).show()
        $this.resize(this);
      });
      return this;
    },
    reset: function(el){
      el = el ? $(el) : this.$el;
      var $this = this;
      el.each(function(idx){
        var seconds = $this.get("seconds",this);
        $this.text(seconds,this).resize();
      });
      return this;
    }
  },name));
})(mathMinute);
