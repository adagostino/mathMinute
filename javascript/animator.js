(function(mathMinute){
  var name = "Animator";
  mathMinute.extend(name,mathMinute.El.subClass({
    init: function(el){
      this._super(el);
      if (this.initialized()) return this;

      this.checkStatic();
      this._data("isAnimating",false);

      return this;
    },
    animate: function(opts,time,func,startState,el){
      time = typeof time === "number" ? time : 218;
      $this = this;
      var $el = el ? $(el) : this.$el;
      $el.each(function(idx){
        var $t = $(this);
        if (!$this.get("isAnimating",this) && $t.is(":visible")){
          if (!startState){
            startState = new Object();
            for (var i in opts){
              startState[i] = mathMinute.parseCss($t,i);
              opts[i] = mathMinute.parseCss($t,i,opts[i],true);
            }
          }
          $this._data("ss",startState,this);
          $this._data("es",opts,this);
          $this._data("func",func,this);
          animateElement($t,startState,opts,time,$this);
        }
      });

      function animateElement($t,startState,endState,time,$this){
        var ticking = false, done = false;
        $t.trigger("startAnimate");
        var startTime = new Date().getTime();
        var endTime = startTime+time;
        $this._data("isAnimating",true,$t[0]);
        anim($t,startState,endState,startTime,endTime,func,$this);
      }

      function anim(el,startState,endState,startTime,endTime,func,$this){
        var done = false;
        var currentTime = new Date().getTime();
        var done = $this._get("stop",el)[0];
        if (currentTime >= endTime || done){
          currentTime = endTime;
          done = true;
        }
        //console.log(name,$this.name);
        //console.log(el.attr("data-index"),startState,endState,startTime,endTime,currentTime,done,$this._get("lastFrame",el[0],name)[0],$this._get("isAnimating",el[0],name)[0]);
        var commands = $this.setAnimateCommands(startState,endState,startTime,endTime,currentTime,done);
        $this._data("cs",commands,el[0],name);
        $this._data("lastFrame",requestAnimationFrame(function(){
          $this.animateThis(commands,el);
          //console.log(startState,endState,startTime,endTime,currentTime,done,$this._get("lastFrame",el[0])[0],$this._get("isAnimating",el[0],name)[0]);
          done ? $this.stop(false,func) : anim(el,startState,endState,startTime,endTime,func,$this);
        }),el[0],name);
      }

      return this;
    },
    toggle: function(opts,time,func){
      this.stop();
      var $this = this;
      time = typeof time === "number" ? time : 218;
      this.$el.each(function(idx){
        var newTime = time;
        var $t = this;
        var ss = $this._get("startState",this)[0];
        if (!ss){
          ss = new Object();
          for (var i in opts){
            ss[i] = mathMinute.parseCss($t,i);
            opt= mathMinute.parseCss($t,i,opts[i],true);
            opts[i] = opt;
          }

          $this._data("startState",opts,this);
          $this._data("endState",ss,this);
          $this._data("atStart",false,this);
        }
        var es = $this._get("startState",this)[0];
        var ss = $this._get("endState",this)[0];
        // toggle at start;
        $this._data("atStart",!$this._get("atStart",this)[0],this);
        if ($this._get("atStart",this)[0]){
          // below is nice for convenience (kind of), but is probably overkill and would
          // promote slower code -- should just keep track of states manually and use
          // "animate" instead
          for (var i in opts){
            opts[i] = mathMinute.parseCss($t,i,opts[i],true);
          }
          if (!mathMinute.areEqual(es,opts)){
            es = opts;
          }
        }

        var cs = new Object();
        var percent = null;
        for (var i in es){
          cs[i] = mathMinute.parseCss($t,i);
          if (!percent) percent = compareInputs(cs[i],ss[i],es[i]);
        }
        newTime*=(1-percent);
        $this._data("startState",ss,this);
        $this._data("endState",es,this);
        $this._data("stop",false,this);
        $this.animate(es,newTime,func,cs,this);
      });

      function compareInputs(curr,start,end){
        //%=(curr-start)/(end-start)
        var c=0, s=0, e=1;
        if (curr.isColor){
          for (var i in curr){
            if ((i=="r" || i=="g" || i=="b" || i=="a") && (start[i] != end[i])){
              c=curr[i]; s=start[i]; e=end[i];
              break;
            }
          }
        }else if (curr.trbl){
          for (var i in curr){
            if (i != "trbl" && end[i].num != start[i].num){
              c = curr[i].num; s = start[i].num; e = end[i].num;
            }
          }
        }else if (curr.isTransform){
          // do this one later
        }else{
          c = curr.num; s = start.num; e = end.num;
        }
        return (c-s)/(e-s);
      }
    },
    stop: function(jumpToEnd,func){
      jumpToEnd = typeof jumpToEnd === "boolean" ? jumpToEnd : false;
      var $this = this;
      this.$el.each(function(idx){
        if($this.get("isAnimating",this)){
          cancelAnimationFrame($this.get("lastFrame",this));
          $this._data("isAnimating",false,this);
          if (jumpToEnd) {
            $this.animate($this.get("es",this),0,func || $this.get("func",this),null,this);
          }else{
            if (typeof func === "function"){
              func.apply(this);
            }
          }
        }
      });
      return this;
    },
    setAnimateCommands: function(start,end,startTime,endTime,currentTime,done){
      var commands = new Object();
      for (var i in start){
        if (start[i].trbl){
          for (var j in start[i]){
            if (j != "trbl"){
              commands[j] = interpolate(start[i][j],end[i][j],startTime,endTime,currentTime,done);
            }
          }
        }else if (start[i].isTransform){
          // do this later
        }else{
          commands[i] = interpolate(start[i],end[i],startTime,endTime,currentTime,done);
        }
      }
      return commands;

      function interpolate(startObj,endObj,startTime,endTime,currentTime,done){
        var val = null, x1=null,x2=null,t1=startTime,t2=endTime,ti=currentTime;
        if (startObj.isColor){
          var r = Math.round(mathMinute.interpolate(startObj.r,endObj.r,t1,t2,ti));
          var g = Math.round(mathMinute.interpolate(startObj.g,endObj.g,t1,t2,ti));
          var b = Math.round(mathMinute.interpolate(startObj.b,endObj.b,t1,t2,ti));
          val = "("+r+","+g+","+b;
          if (!mathMinute.isValid(startObj["a"]) && !mathMinute.isValid(endObj["a"])){
            val = "rgb"+val;
          }else{
            var starta = mathMinute.isValid(startObj["a"]) ? startObj["a"] : 1.0;
            var enda = mathMinute.isValid(endObj["a"]) ? endObj["a"] : starta;
            var a = mathMinute.interpolate(starta,enda,t1,t2,ti);
            val = "rgba"+val+","+a;
          }
          val+=")";
        }else{
          x1=startObj.num, x2=endObj.num;
          val = mathMinute.interpolate(x1,x2,t1,t2,ti);
          val = done ? mathMinute.roundNum(val,9) : val;
        }
        return endObj.type ? val+endObj.type : val;
      }
    },
    animateThis: function(commands,el){
      var $el = el ? $(el) : this.$el;
      $el.each(function(idx){
        $(this).css(commands);
        $(this).trigger("animateStep",[commands]);
      });
      return this;
    },
  },name));
})(mathMinute);
