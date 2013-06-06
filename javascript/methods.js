// anonymous function
// (function(){})() or (function(var1,var2){console.log(var1);console.log(var2);})(var1,var2);

// A Memoization method by John Resig and Bear Bibleault! Thanks, ninjas!
(function(){
  Function.prototype.memoized = function(key){
    this._values = this._values || {};
    return this._values[key] !== undefined ? this._values[key] : this._values[key] = this.apply(this,arguments);
  };
  Function.prototype.memoize = function(){
    var fn = this;
    return function(){
      return fn.memoized.apply(fn,arguments);
    };
  };
  /* example use */
  /*
  var isPrime = (function(num){
    var prime = num != 1;
    for (var i=2; i<num; i++){
      if (num % i == 0){
        prime = false;
        break;
      }
    }
    return prime;
  }).memoize();
  */

})();

// a subclassing method by John Resig and Bear Bibeault!! Thanks Javascript Ninjas!
// example syntax
/*
var Person = Object.subClass({
  init: function(isDancing){
    this.dancing = isDancing;
  },
  dance: function(){
    return this.dancing;
  }
});
var Ninja = Person.subClass({
  init: function(){
    this._super(false);
  },
  dance: function(){
    // Nija specifc stuff here
    return this._super();
  },
  swingSword: function(){
    return true;
  }
});
var person = new Person(true);
var ninja = new Ninja();
*/
(function(){
  var initializing = false,
      superPattern = /xyz/.test(function() { xyz; }) ? /\b_super\b/ : /.*/;
  Object.subClass = function(properties,name){
    var _super = this.prototype;
    initializing = true;
    var proto = new this();
    initializing = false;

    for (var key in properties){
      var val = null;
      if (typeof properties[key] == "function"){
        val = typeof _super[key] == "function" && superPattern.test(properties[key]) ?
          (function(key,fn,name){
            return function(){
              var n = this.name;
              this.name = name || this.name;
              var tmp = this._super;
              this._super = _super[key];
              var ret = fn.apply(this,arguments);
              this._super = tmp;
              this.name = n;
              return ret;
            };
          })(key,properties[key],name) :
          (function(key,fn,name){
            return function(){
              var n = this.name;
              if (!this.name){
                //console.log(this);
              }
              //console.log("start",this.name,name,key);
              this.name = name || this.name;
              var ret = fn.apply(this,arguments);
              this.name = n;
              //console.log("end",this.name);
              return ret;
            };
          })(key,properties[key],name);
      }else{
        val = properties[key];
      }
      proto[key] = val;
    }
    if (!properties["name"]) proto["name"] = name;
    function Class() {
      // All construction is actually done in this method
      if (!initializing && this.init){
        // TODO: Think of a way to check initialization here instead of in each class's init function
        this.init.apply(this,arguments);
      }
    }

    Class._super = _super;
    Class.prototype = proto;
    Class.constructor= Class;
    Class.subClass = arguments.callee;
    return Class;
  };
})();

//timer
(function(window){
  function testTime(func,iter,funcName,timeDelay){
    iter = (iter == "undefined" || iter == null) ? 10000 : iter;
    var functionName = func.name;
    if (funcName){
      functionName = funcName;
    }
    if (functionName == ""){
      functionName = "function";
    }
    var async = false;
    if (typeof timeDelay != "undefined" && timeDelay != null){
      async = true;
    }

    var addlms = 0;
    var paused = false, queue = [];
    this.queue = queue;
    this.paused = paused;

    this.test = function(fn){
      queue.push(fn);
      runTest();
    };

    this.pause = function(){
      paused = true;
    };

    this.resume = function(){
      paused = false;
      if (async){
        setTimeout(runTest,1);
        addlms+=1;
      }else{
        runTest();
      }
    };

    function runTest(){
      if (!paused && queue.length){
        queue.shift()();
        if (!paused) resume();
      }
    }


    console.log("Starting test of " + functionName + ":");
    var initialTime = new Date().getTime();

    for (var i=0; i<iter; i++){
      if (async){
        this.test(func);
        this.pause;
      }else{
        this.test(func);
        //func.apply(this,arguments);
      }
    }

    var finalTime = new Date().getTime();
    var totalTime = finalTime-initialTime-addlms;
    var averageTime = totalTime/iter;

    console.log(functionName + " takes on average " + averageTime + " ms to execute (tested over " + iter + " iterations)");
    console.log("Ended test of " + functionName + " after " + totalTime + " ms.");
    return (finalTime-initialTime)/iter;
  };
  window.testTime = testTime;
})(window);

// requestAnimationFrame Shim from Paul Irish!
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame =
    window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = window.setTimeout(function() { callback(currTime + timeToCall); },
        timeToCall);
        lastTime = currTime + timeToCall;
        return id;
  };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
    };
}());

// seedrandom.js version 2.1.
// Author: David Bau
// Date: 2013 Mar 16
//
// Defines a method Math.seedrandom() that, when called, substitutes
// an explicitly seeded RC4-based algorithm for Math.random().  Also
// supports automatic seeding from local or network sources of entropy.
//
// http://davidbau.com/encode/seedrandom.js
// http://davidbau.com/encode/seedrandom-min.js
//
// Usage:
//
//   <script src=http://davidbau.com/encode/seedrandom-min.js></script>
//
//   Math.seedrandom('yay.');  Sets Math.random to a function that is
//                             initialized using the given explicit seed.
//
//   Math.seedrandom();        Sets Math.random to a function that is
//                             seeded using the current time, dom state,
//                             and other accumulated local entropy.
//                             The generated seed string is returned.
//
//   Math.seedrandom('yowza.', true);
//                             Seeds using the given explicit seed mixed
//                             together with accumulated entropy.
//
//   <script src="https://jsonlib.appspot.com/urandom?callback=Math.seedrandom">
//   </script>                 Seeds using urandom bits from a server.
//
// More advanced examples:
//
//   Math.seedrandom("hello.");           // Use "hello." as the seed.
//   document.write(Math.random());       // Always 0.9282578795792454
//   document.write(Math.random());       // Always 0.3752569768646784
//   var rng1 = Math.random;              // Remember the current prng.
//
//   var autoseed = Math.seedrandom();    // New prng with an automatic seed.
//   document.write(Math.random());       // Pretty much unpredictable x.
//
//   Math.random = rng1;                  // Continue "hello." prng sequence.
//   document.write(Math.random());       // Always 0.7316977468919549
//
//   Math.seedrandom(autoseed);           // Restart at the previous seed.
//   document.write(Math.random());       // Repeat the 'unpredictable' x.
//
//   function reseed(event, count) {      // Define a custom entropy collector.
//     var t = [];
//     function w(e) {
//       t.push([e.pageX, e.pageY, +new Date]);
//       if (t.length < count) { return; }
//       document.removeEventListener(event, w);
//       Math.seedrandom(t, true);        // Mix in any previous entropy.
//     }
//     document.addEventListener(event, w);
//   }
//   reseed('mousemove', 100);            // Reseed after 100 mouse moves.
//
// Version notes:
//
// The random number sequence is the same as version 1.0 for string seeds.
// Version 2.0 changed the sequence for non-string seeds.
// Version 2.1 speeds seeding and uses window.crypto to autoseed if present.
//
// The standard ARC4 key scheduler cycles short keys, which means that
// seedrandom('ab') is equivalent to seedrandom('abab') and 'ababab'.
// Therefore it is a good idea to add a terminator to avoid trivial
// equivalences on short string seeds, e.g., Math.seedrandom(str + '\0').
// Starting with version 2.0, a terminator is added automatically for
// non-string seeds, so seeding with the number 111 is the same as seeding
// with '111\0'.
//
// When seedrandom() is called with zero args, it uses a seed
// drawn from the browser crypto object if present.  If there is no
// crypto support, seedrandom() uses the current time, the native rng,
// and a walk of several DOM objects to collect a few bits of entropy.
//
// Each time the one- or two-argument forms of seedrandom are called,
// entropy from the passed seed is accumulated in a pool to help generate
// future seeds for the zero- and two-argument forms of seedrandom.
//
// On speed - This javascript implementation of Math.random() is about
// 3-10x slower than the built-in Math.random() because it is not native
// code, but that is typically fast enough.  Some details (timings on
// Chrome 25 on a 2010 vintage macbook):
//
// seeded Math.random()          - avg less than 0.0002 milliseconds per call
// seedrandom('explicit.')       - avg less than 0.2 milliseconds per call
// seedrandom('explicit.', true) - avg less than 0.2 milliseconds per call
// seedrandom() with crypto      - avg less than 0.2 milliseconds per call
// seedrandom() without crypto   - avg about 12 milliseconds per call
//
// On a 2012 windows 7 1.5ghz i5 laptop, Chrome, Firefox 19, IE 10, and
// Opera have similarly fast timings.  Slowest numbers are on Opera, with
// about 0.0005 milliseconds per seeded Math.random() and 15 milliseconds
// for autoseeding.
//
// LICENSE (BSD):
//
// Copyright 2013 David Bau, all rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//   1. Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//
//   2. Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
//
//   3. Neither the name of this module nor the names of its contributors may
//      be used to endorse or promote products derived from this software
//      without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
/**
 * All code is in an anonymous closure to keep the global namespace clean.
 */
(function (
    global, pool, math, width, chunks, digits) {

//
// The following constants are related to IEEE 754 limits.
//
var startdenom = math.pow(width, chunks),
    significance = math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1;

//
// seedrandom()
// This is the seedrandom function described above.
//
math['seedrandom'] = function(seed, use_entropy) {
  var key = [];

  // Flatten the seed string or build one from local entropy if needed.
  var shortseed = mixkey(flatten(
    use_entropy ? [seed, tostring(pool)] :
    0 in arguments ? seed : autoseed(), 3), key);

  // Use the seed to initialize an ARC4 generator.
  var arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(tostring(arc4.S), pool);

  // Override Math.random

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.

  math['random'] = function() {         // Closure to return a random double:
    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
        d = startdenom,                 //   and denominator d = 2 ^ 48.
        x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  // Return the seed that was used
  return shortseed;
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function(count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t, r = 0,
        i = me.i, j = me.j, s = me.S;
    while (count--) {
      t = s[i = mask & (i + 1)];
      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
    }
    me.i = i; me.j = j;
    return r;
    // For robust unpredictability discard an initial batch of values.
    // See http://www.rsa.com/rsalabs/node.asp?id=2009
  })(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
  var result = [], typ = (typeof obj)[0], prop;
  if (depth && typ == 'o') {
    for (prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
      }
    }
  }
  return (result.length ? result : typ == 's' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
  var stringseed = seed + '', smear, j = 0;
  while (j < stringseed.length) {
    key[mask & j] =
      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
  }
  return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto if available.
//
/** @param {Uint8Array=} seed */
function autoseed(seed) {
  try {
    global.crypto.getRandomValues(seed = new Uint8Array(width));
    return tostring(seed);
  } catch (e) {
    return [+new Date, global.document, global.history,
            global.navigator, global.screen, tostring(pool)];
  }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
  return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

// End anonymous scope, and pass initial values.
})(
  this,   // global window object
  [],     // pool: entropy pool starts empty
  Math,   // math: package containing random, pow, and seedrandom
  256,    // width: each RC4 output is 0 <= x < 256
  6,      // chunks: at least six RC4 outputs for each double
  52      // digits: there are 52 significant digits in a double
);
