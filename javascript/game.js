(function(mathMinute){
  var name = "Game";
  mathMinute.extend(name,mathMinute.Animator.subClass({
    init: function(el){
      this._super(el).$el.addClass("game gameButton");


      var $this = this;
      this.$el.each(function(idx){
        var timer = mathMinute.exists(".timer",this) || $("<div>",{"class":"timer"}).appendTo(this);
        var ia = new mathMinute.Timer(timer,{
          stroke: "rgba(0,0,0,0.3)",
          "stroke-width": 1,
          fill: "rgba(51,51,51,1)",
          buffer: 0,
          reflect: true,
          seconds: 60
        });
        $this._data("timer",ia,this);
        var ul = mathMinute.exists(".slides",this) || $("<ul>",{"class":"slides"}).appendTo(this);
        $this._data("ul",ul,this);
        var ct = 0;
        $this.addStartSlide(ct++,this);
        $this.addEquationSlide(ct++,this);
        $this.addEquationSlide(ct++,this);
      });


      this.$el.on("next",function(e,slide){
        $this.nextEquation("up",218);
      });

      var resize = function(){
        $this.resize();
      };
      $(window).resize(resize);

      this.listenForResize(function(e,nwh,owh){
        $this.resizeSlides();
      });

      //this.resize().resizeSlides();
      return this;
    },
    addEquationSlide: function(ind,el){
      var $el = el ? el.$el ? el.$el : $(el) : this.$el;
      var $this = this;
      $el.each(function(idx){
        var $t = $(this);
        var ul = $this._get("ul",this)[0];
        var li = mathMinute.exists("li.slide.equationSlide[data-index='"+ind+"']",ul) || $("<li>",{"class":"slide equationSlide","data-index":ind}).appendTo(ul);
        var slide = new mathMinute.EquationSlide(li,{index: ind});
        $this.storeSlide(slide,"equation",this);
        var ea = $this._get("equationSlides",this);
        ea = (ea.length > 0 ? ea : $this._data("equationSlides",new Array(),this))[0];
        ea.push(slide);
        //$this._data("li_"+ind,li[0],this);
      });
      return this;
    },
    addStartSlide: function(ind,el){
      var $el = el ? el.$el ? el.$el : $(el) : this.$el;
      var ratio = .75, buffer = 40;
      var $this = this;
      $el.each(function(idx){
        var $t = $(this);
        var ul = $this._get("ul",this)[0];
        var li = mathMinute.exists("li.slide.startSlide[data-index='"+ind+"']",ul) || $("<li>",{"class":"slide startSlide","data-index":ind}).appendTo(ul);
        var slide = new mathMinute.StartSlide(li,{index: ind});
        $this.storeSlide(slide,"startSlide",this);
        var timer = $this.get("timer",this);
        var btn = slide.getButton(li).click(function(e){
          if ($t.hasClass("gameButton")){
            var btn = $(this);
            var h1 = $t.height();
            var w1 = $t.width();
            var o1 = $t.offset();

            var ww = $(window).width();
            var wh = $(window).height();
            var ww9 = ww-buffer;
            var wh9 = wh-buffer;

            var mw = parseFloat($t.css("maxWidth"));
            var mh = parseFloat($t.css("maxHeight"));
            var w = ww9 < mw ? ww9 : mw;
            var h = ratio*w;
            if (h > wh9){
              h = wh9;
              w = h/ratio;
            }
            $t.removeClass("gameButton").css({
              width: w1,
              height: h1,
              left: o1.left,
              top: o1.top
            }).bind("animateStep",animateStep);
            btn.css("marginLeft",-btn.width()/2);

            $this.animate({
              width: w,
              height: h,
              left: ww/2,
              top: (wh9-h+buffer)/2,
              marginLeft: -w/2
            },318,function(){
              $t.unbind("animateStep",animateStep);
            },null,$t);

          }else{
            $this.changeSlide({
              inSlide: parseInt($t.find(".equationSlide").attr("data-index")),
              inDir: "fade",
              outDir: "left",
              inBefore: function(slide){
                slide.newEquation().reset();
              },
              inAfter: function(slide){
                slide.getInput(this).focus();
              },
              outAfter: function(slide){
                timer.show().start();
              },
              timeOut: 318,
              timeIn: 0
            },$t);
          }
        });

        function animateStep(e,commands){
          //console.log(commands);
          $this.resizeSlides(this);
        }

      });
      return this;
    },
    changeSlide: function(opts,el){
      //opts: {inSlide: number, inDir: string, outDir: string,inBefore: func, inAfter: func, outBefore: func, outAfter: func}
      el = el ? $(el) : this.$el;
      opts = typeof opts === "object" ? opts : {};
      var $this = this;
      el.each(function(idx){
        var slides = $this.get("slides",this);
        var $t = $(this);
        var currInd = parseInt($t.find("li.slide:visible").attr("data-index"));
        var curr = slides[currInd].slide;
        var nextInd = typeof inSlide === "number" ? opts.inSlide : currInd+1;
        nextInd = nextInd > slides.length-1 ?  (nextInd % slides.length) : nextInd;
        var next = slides[nextInd].slide;
        curr.stop(true).hide({
          dir: opts.outDir,
          before: opts.outBefore,
          after: opts.outAfter
        },opts.timeOut);
        next.stop(true).show({
          dir: opts.inDir,
          before: opts.inBefore,
          after: opts.inAfter
        },opts.timeIn);
      });
      return this;
    },
    nextEquation: function(dir,time){
      var $this = this;
      this.$el.each(function(idx){
        var $t = $(this);
        var ea = $this.get("equationSlides",this);
        var animating = $this.get("animating",this);
        if (animating){
          animating.stop(true);
        }else{
          var currInd = $this.get("currentEquationSlide",this) || 0;
          var nextInd = currInd + 1 <= ea.length-1 ? currInd + 1 : 0;
          $this._data("currentEquationSlide",nextInd,this);
          var nextEq = ea[nextInd];
          var timer = $this.get("timer",this);
          if (currInd > -1){
            ea[currInd].hide({
              dir: dir,
              before: function(slide){
                timer.pause();
                $this._data("animating",slide,$t);
                console.log(slide.value());
              },
              after: function(slide){
                timer.start();
                $(this).css("display","none");
                $this._data("animating",false,$t);
              }
            },time);
          };
          ea[nextInd].show({
            dir: "fade",
            before: function(slide){
              slide.newEquation().reset();
            },
            after: function(slide){
              slide.getInput(this).focus();
            }
          },0);
        }
      });
      return this;
    },
    storeSlide: function(slide,type,el){
      if (!slide) return;
      var $this = this;
      type = typeof type === "string" ? type : "slide";
      el = el ? $(el) : this.$el;
      el.each(function(idx){
        var sa = $this._get("slides",this);
        sa = (sa.length > 0 ? sa : $this._data("slides",{0: null, length: 0},this))[0];
        sa[sa.length] = {
          type: type,
          slide: slide
        };
        sa.length++;
        $this._data("slides",sa,this);
      });
      return this;
    },
    resize: function(ratio,buffer){
      var $this = this;
      ratio = typeof ratio === "number" ? ratio : .75;
      buffer = typeof buffer === "number" ? buffer : 40;
      var ww = $(window).width();
      var wh = $(window).height();
      var ww9 = ww-buffer;
      var wh9 = wh-buffer;
      this.$el.each(function(idx){
        var $t = $(this);
        if (!$t.hasClass("gameButton")){
          var mw = parseFloat($t.css("maxWidth"));
          var mh = parseFloat($t.css("maxHeight"));
          var w = ww9 < mw ? ww9 : mw;
          var h = ratio*w;
          if (h > wh9){
            h = wh9;
            w = h/ratio;
          }
          var css = {};
          if (w<=ww9){
            css.left = "50%";
            css.right = "clear";
            css.width = Math.round(w);
            css.marginLeft = Math.round(-w/2);
          }else{
          //var lr = (ww-w)/2;
            var lr = Math.round(buffer/2);
            css.left = lr;
            css.right = lr;
            css.marginLeft = "clear";
            css.width= "auto";
          }
          if (h <= wh9){
            css.top = "50%";
            css.bottom = "clear";
            css.marginTop = Math.round(-h/2);
            css.height = h;
          }else{
            //var tb = (wh-h)/2;
            var tb = Math.round(buffer/2);
            css.top = tb;
            css.bottom = tb;
            css.marginTop = "clear";
            css.height = "auto";
          }
          $t.css(css);
        }
      });
      return this;
    },
    resizeSlides: function(){
      var $this = this;
      this.$el.each(function(idx){
        var slides = $this._get("slides",this)[0];
        for (var i=0; i<slides.length; i++){
          slides[i].slide.resize();
        }
      });
      return this;
    },
    next: function(){

    }

  },name));
})(mathMinute);
