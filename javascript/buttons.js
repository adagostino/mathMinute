(function(mathMinute){
  var name = "Button";
  mathMinute.extend(name,mathMinute.El.subClass({
    init: function(el){
      this._super(el);
      this.$el.addClass("button").click(function(){
        var $t = $(this);
        if (!$t.hasClass("active")){
          $t.trigger("activateButton");
        }
        return false;
      });
      var $this = this;
      this.$el.each(function(){
        $(this).attr("data-value") || $(this).attr("data-value",$(this).html());
        $this.fitText(this);
      });
      return this;
    },
    fitText: function(el){
      el = el ? $(el) : this.$el;
      el.each(function(idx){
        if (isOverflowing(this)){
          var $t = $(this);
          var hasSpace = /\s/.test($t.text());
          var html = $t.html();
          hasSpace && $t.css("lineHeight",($t.height()/3)+"px");
          var fs = getFontSize($t,true);
          $t.css("fontSize",hasSpace ? .75*fs : fs);
          hasSpace && $t.empty().append($("<span>").css({position: "relative",top:.75*fs/2}).html(html));
        }
      });

      function getFontSize(el,reset){
        var c = $(el).clone()
        c.css({
          "visibility":"hidden",
          "left":"-100%",
          "position":"absolute"
        });
        $(el).after(c);
        var fs = setFontSize(c,reset ? 1 : null);
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

(function(mathMinute){
  var name = "RadialList";
  mathMinute.extend(name,mathMinute.El.subClass({
    init: function(el,opts){
      //opts: {buttons: [string,...]}
      this._super(el);
      opts = typeof opts === "object" ? opts : {buttons: []};
      opts.buttons = typeof opts.buttons === "object" ? opts.buttons : [];
      var $this = this;
      this.$el.each(function(idx){
        var $t = $(this);
        var ul = $this._data("ul",$(this).is("ul") ? this : $("<ul>").appendTo(this),this)[0];
        ul.addClass("radialList");
        ul.find(".button").each(function(idx){
          $this.addButtonToList($(this),$t);
        });
        for (var i in opts.buttons){
          $this.addButton(opts.buttons[i],$t);
        }
      });
      return this;
    },
    addButton: function(val,el){
      el = el ? $(el) : this.$el;
      var $this = this;
      el.each(function(idx){
        if (!$this.inButtonList(val,this)){
          var $t = $(this);
          var $ul = $this.get("ul",this);
          var $li = $("<li>").appendTo($ul);
          var $btn = $("<div>",{html: val}).appendTo($li);
          $this.addButtonToList($btn,$t);
        }
      });
      return this;
    },
    addButtonToList: function($btn,el){
      el = el ? $(el) : this.$el;
      var $this = this;
      el.each(function(idx){
        var $t = $(this);
        var btnList = $this.get("buttonList",$t) || $this._data("buttonList",{length: 0},$t)[0];
        var button = new mathMinute.Button($btn);
        btnList[btnList.length] = {
          button: button,
          value: $btn.attr("data-value") || $btn.attr("data-value",$btn.text()).text()
        }
        btnList.length++;
        $btn.bind("activateButton",function(){
          //$(this).hasClass("active") ? $(this).removeClass("active") : $(this).addClass("active");
          $(this).addClass("active");
        });
      });
      return this;
    },
    inButtonList: function(val,el){
      el = el ? $(el) : this.$el;
      var $this = this;
      var inList = false;
      el.each(function(idx){
        var $t = $(this);
        var btnList = $this.get("buttonList",$t) || $this._data("buttonList",{length: 0},$t)[0];
        for (var i=0; i<btnList.length; i++){
          if(btnList[i].value == val){
            inList = true;
            return false;
          }
        }
      });
      return inList;
    },
  },name));

})(mathMinute);
