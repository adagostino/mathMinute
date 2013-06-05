(function(mathMinute){
  var name = "El";
  mathMinute.extend(name,Object.subClass({
    mathMinute: "version 0.1",
    name: name,
    init: function(el){
      this.$el = $(el);
      return this;
    },
    checkStatic: function(pos){
      this.$el.each(function(idx){
        var $t = $(this);
        ($t.css("position") == "static") && $t.css(pos || "relative");
      });
      return this;
    },
    get: function(key,el){
      // use to get Element from data
      return el ? this._get(key,el)[0] : this._data(key);
    },
    listenForResize: function(func){
      var $this = this;
      var resize = function(e){
        $this.$el.each(function(idx){
          var $t = $(this);
          if ($t.is(":visible")){
            var oldWH = $this._get("wh",this,"El")[0];
            oldWH = oldWH || {width: null, height: null};
            var w = $t.width();
            var h = $t.height();
            if (oldWH.width != w || oldWH.height != h){
              //then resize
              var newWH = {width: w, height: h};
              $this._set("wh",newWH,this,"El");
              $t.trigger("resized",[oldWH,newWH]);
              typeof func === "function" && func.call(this,e,oldWH,newWH);
            }
          }
        });
      }
      $(window).resize(resize);

      this.$el.bind("remove",function(){
        $(window).unbind("resize",resize);
      });
      return this;
    },
    remove: function(){
      mathMinute.removeData(this.$el);
      this.$el.triggerHandler("remove").remove();
    },
    _data: function(key,value,el,n){
      return typeof value !== "undefined" ? this._set(key,value,el,n) : this._get(key,el,n);
    },
    _get: function(key,el,n){
      el = el || this.$el;
      n = typeof n === "string" ? n : this.name;
      return mathMinute.data(el,n,key);
    },
    _set: function(key,value,el,n){
      el = el || this.$el;
      n = typeof n === "string" ? n : this.name;
      //console.log(this.name);
      return mathMinute.data(el,n,key,value);
    }
  }));
})(mathMinute);
