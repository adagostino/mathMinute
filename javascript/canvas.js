(function(mathMinute){
  var name = "Canvas";
  mathMinute.extend(name,mathMinute.El.subClass({
    init: function(el){
      this._super(el);
      if (this.initialized()) return this;

      this.$el.addClass("mathCanvas");
      //initialize the canvas and its context
      this.setCanvas();
      this.sizeCanvas();

      this.context({
        globalCompositeOperation: "source-over",
        shadowBlur: 2,
        lineCap: "round",
        lineJoin: "round",
        lineWidth: 1,
        shadowColor: "rgba(0,0,0,0.5)",
        strokeStyle: "rgba(0,0,0,1)"
      });
      this.clear();
      // bind the drawing events
      var $this = this;
      this.$el.bind({
        mousedown: function(e){
          var x = e.offsetX || e.pageX-$(this).offset().left;
          var y = e.offsetY || e.pageY-$(this).offset().top;
          $this.beginDraw(x,y,e.timeStamp);
          e.preventDefault();
        },
        mousemove: function(e){
          var x = e.offsetX || e.pageX-$(this).offset().left;
          var y = e.offsetY || e.pageY-$(this).offset().top;
          $this.draw(x,y,e.timeStamp);
        },
        mouseup: function(e){
          var x = e.offsetX || e.pageX-$(this).offset().left;
          var y = e.offsetY || e.pageY-$(this).offset().top;
          $this.endDraw(x,y,e.timeStamp);
        },
        remove: function(e){
          $(window).unbind("resize",resize);
        }
      });
      var resize = function(){
        //console.log("window resize");
        $this.resizeCanvas();
      };
      $(window).bind("resize",resize);

      return this;
    },
    beginDraw: function(x,y,time){
      var $this = this;
      var mouseDown = this._data("mouseDown");
      var contextOptions = this._data("contextOptions");
      var w = this._data("canvasWidth");
      var h = this._data("canvasHeight");
      this.$el.each(function(idx){
        if (!mouseDown[idx]){
          $this._data("mouseDown",true,this);
          var cx = x-this.offsetLeft;
          var cy = y-this.offsetTop;
          $this._data("x",cx,this);
          $this._data("y",cy,this);
          // get original width/height
          $this.log(idx,"beginDraw",{
            cx: cx,
            cy: cy,
            w: w[idx],
            h: h[idx],
            time: time,
            contextOptions: (function(){
              // was going to loop through them and get the actual values
              // but i'm thinking i don't have to
              return contextOptions[idx];
            })()
          });
        }
      });
      return this;

    },
    draw: function(x,y,time){
      var mouseDown = this._data("mouseDown");
      var cx = this._data("x");
      var cy = this._data("y");
      var context = this._data("context");
      var $this = this;
      this.$el.each(function(idx){
        if (mouseDown[idx] && cx[idx] != null && cy[idx] != null){
          x-=this.offsetLeft;
          y-=this.offsetTop;
          $this.drawLine(context[idx],cx[idx],cy[idx],x,y);
          //console.log(context[idx]);
          $this._data("x",x,this);
          $this._data("y",y,this);
          $this.log(idx,"draw",{
            cx: cx[idx],
            cy: cy[idx],
            x: x,
            y: y,
            time: time
          });
        }
      });
      return this;
    },
    drawLine: function(ctx,cx,cy,x,y){
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.lineTo(x,y);
      ctx.stroke();
      ctx.closePath();
      return;
    },
    redrawLines: function(anim){
      anim = typeof anim === "boolean" ? anim : false;
      var log = this._data("log");
      var context = this._data("context");
      var $this = this;
      this.$el.each(function(idx){
        var w = $(this).width();
        var h = $(this).height();
        var wR = 1, hR = 1;
        anim ? animate(log[idx],context[idx],w,h,wR,hR,this) : drawLines(log[idx],context[idx],w,h,wR,hR);
      });

      function animate(log,ctx,w,h,wR,hR,el,idx,globalStart){
        if (log.length == 0) return;
        idx = typeof idx === "number" ? idx : 0;
        globalStart = globalStart || new Date().getTime();
        var st = log[0].value.time;
        var currTime = new Date().getTime();
        var queue = new Array();
        for (var i=idx; i<log.length; i++){
          var key = log[i].key;
          var val = log[i].value;
          var time = val.time;
          if (time-st <= currTime-globalStart){
            queue.push(log[i]);
          }else{
            break;
          }
        };
        var newIdx = i;
        var done = newIdx >= log.length-1;
        $this._data("lastFrame",requestAnimationFrame(function(){
          var wh = drawLines(queue,ctx,w,h,wR,hR);
          return done ? null : animate(log,ctx,w,h,wh.wR,wh.hR,el,newIdx,globalStart);
        }),el);
      }

      function drawLines(queue,ctx,w,h,wR,hR){
        for (var i=0; i<queue.length; i++){
          var key = queue[i].key;
          var val = queue[i].value;
          if (key === "beginDraw"){
            wR = w/val.w;
            hR = h/val.h;
            for (var key in val.contextOptions){
              ctx[key]=val.contextOptions[key];
            }
          }else if (key === "draw"){
            $this.drawLine(ctx,val.cx*wR,val.cy*hR,val.x*wR,val.y*hR);
          }
        }
        return {wR: wR, hR: hR}
      }

    },
    endDraw: function(x,y,time){
      var mouseDown = this._data("mouseDown");
      var $this = this;
      this.$el.each(function(idx){
        if (mouseDown[idx]){
          $this._data("mouseDown",false,this);
          $this.log(idx,"endDraw",{
            time: time,
          });
        }
      });
    },
    color: function(str){
      if (typeof str === "string"){
        //set the color -- use Raphael to get rgba from str maybe
        this.context({
          strokeColor: str,
          strokeStyle: str,
          globalCompositeOperation: "source-over"
        });
        return this;
      }
      return this.context("strokeColor");
    },
    erase: function(){
      this.color("#000");
      this.context({globalCompositeOperation: "destination-out"});
      return this;
    },
    context: function(o){
      var c = this._data("context");
      this._data("contextOptions").length ==0 && this._data("contextOptions",new Object());
      var co = this._data("contextOptions");

      var rObj = {length: 0};
      var $this = this;
      this.$el.each(function(idx){
        if (typeof o === "object"){
          for (var j in o){
            co[idx][j] = o[j];
            c[idx][j] =o [j];
          }
          $this._data("contextOptions",co[idx],this);
        }else{
          rObj[rObj.length] = c[idx][o];
          rObj[length]+=1;
        }
      });
      return rObj.length > 0 ? rObj : this;
    },
    clear: function(el){
      this._data("x",null,el);
      this._data("y",null,el);
      this._data("log",new Array(),el);
      this._data("mouseDown",false,el);
      this.clearRect(el);
      return this;
    },
    clearRect: function(el){
      el = el ? $(el) : this.$el;
      var $this = this;
      el.each(function(idx){
        var ow = $this.get("canvasWidth",this);
        var oh = $this.get("canvasHeight",this);
        var context = $this.get("context",this);
        context.clearRect(0,0,ow,oh);
      });
      return this;
    },
    setCanvas: function(){
      $this = this;
      this.$el.each(function(){
        var canvas = $("<canvas>",{"class":"canvas"}).appendTo(this);
        if(typeof G_vmlCanvasManager != 'undefined') {
          canvas = G_vmlCanvasManager.initElement(canvas[0]);
        }
        canvas = canvas.jquery ? canvas[0] : canvas;
        // set the canvas and its context
        $this._data("canvas",canvas,this);
        $this._data("context",canvas.getContext("2d"),this);
      });
    },
    sizeCanvas: function(el){
      el = el ? $(el) : this.$el;
      var $this = this;
      el.each(function(idx){
        var c = $this.get("canvas",this);
        c.width = $(this).width();
        c.height = $(this).height();
        $this._data("canvasWidth",c.width,this);
        $this._data("canvasHeight",c.height,this);
      });
      return this;
    },
    resizeCanvas: function(){
      this.sizeCanvas();
      this.redrawLines();
      return this;
    },
    log: function(idx,key,value){
      var a = this._data("log")[idx].push({key:key,value:value});
      return this;
    },
    getLog: function(el){
      return this.get("log",el);
    }
  },name));
})(mathMinute);
