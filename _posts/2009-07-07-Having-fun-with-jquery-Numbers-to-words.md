---           
layout: post
title: Having fun with jquery -- Numbers to words
date: 2009-07-07 06:19:05 UTC
updated: 2009-07-07 06:19:05 UTC
comments: false
categories: javascript
tags: javascript fun jquery
---
 
Having some fun with jquery, its cool btw... 
Type in some numbers in the input box, (it should be in focus when u load this page, if not well u know who to blame - 
jquery of course, not me :-P)
And if you (un)knowingly type in something other than a number, it should tell you whats wrong.
Then click "Convert to words" and you'll get your number in words... one in Indian number system and another one in 
international standard. And, if you are really trying this out, you can use keyboard enter, escape.. i bound them to 
calculate and hide the results etc.

Just some plain short fun :)

<script type="text/javascript" 
src="/assets/js/libs/jquery-1.11.1.min.js"></script>
<script type="text/javascript">
 function NumberToWords() {
 
   var units = [ "Zero", "One", "Two", "Three", "Four", "Five", "Six",
     "Seven", "Eight", "Nine", "Ten" ];
   var teens = [ "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
     "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty" ];
   var tens = [ "", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty",
     "Seventy", "Eighty", "Ninety" ];
 
   var othersIndian = [ "Thousand", "Lakh", "Crore" ];
 
   var othersIntl = [ "Thousand", "Million", "Billion", "Trillion" ];
 
   var INDIAN_MODE = "indian";
   var INTERNATIONAL_MODE = "international";
   var currentMode = INDIAN_MODE;
 
   var getBelowHundred = function(n) {
    if (n >= 100) {
     return "greater than or equal to 100";
    };
    if (n <= 10) {
     return units[n];
    };
    if (n <= 20) {
     return teens[n - 10 - 1];
    };
    var unit = Math.floor(n % 10);
    n /= 10;
    var ten = Math.floor(n % 10);
    var tenWord = (ten > 0 ? (tens[ten] + " ") : '');
    var unitWord = (unit > 0 ? units[unit] : '');
    return tenWord + unitWord;
   };
 
   var getBelowThousand = function(n) {
    if (n >= 1000) {
     return "greater than or equal to 1000";
    };
    var word = getBelowHundred(Math.floor(n % 100));
 
    n = Math.floor(n / 100);
    var hun = Math.floor(n % 10);
    word = (hun > 0 ? (units[hun] + " Hundred ") : '') + word;
 
    return word;
   };
 
   return {
    numberToWords : function(n) {
     if (isNaN(n)) {
      return "Not a number";
     };
 
     var word = '';
     var val;
 
     val = Math.floor(n % 1000);
     n = Math.floor(n / 1000);
 
     word = getBelowThousand(val);
 
     if (this.currentMode == INDIAN_MODE) {
      othersArr = othersIndian;
      divisor = 100;
      func = getBelowHundred;
     } else if (this.currentMode == INTERNATIONAL_MODE) {
      othersArr = othersIntl;
      divisor = 1000;
      func = getBelowThousand;
     } else {
      throw "Invalid mode - '" + this.currentMode
        + "'. Supported modes: " + INDIAN_MODE + "|"
        + INTERNATIONAL_MODE;
     };
 
     var i = 0;
     while (n > 0) {
      if (i == othersArr.length - 1) {
       word = this.numberToWords(n) + " " + othersArr[i] + " "
         + word;
       break;
      };
      val = Math.floor(n % divisor);
      n = Math.floor(n / divisor);
      if (val != 0) {
       word = func(val) + " " + othersArr[i] + " " + word;
      };
      i++;
     };
     return word;
    },
    setMode : function(mode) {
     if (mode != INDIAN_MODE && mode != INTERNATIONAL_MODE) {
      throw "Invalid mode specified - '" + mode
        + "'. Supported modes: " + INDIAN_MODE + "|"
        + INTERNATIONAL_MODE;
     };
     this.currentMode = mode;
    }
   }
  }
 
  function clear() {
   $("#errSpan").hide();
   $("#resultDiv").hide();
  }
 
  var num2words = new NumberToWords();
 
  function translate() {
   clear();
   var input = $("#input").val();
   if (isNaN(input)) {
    $("#errSpan").html("This is not a number - " + input);
    $("#errSpan").show();
    $("#input").focus();
    return;
   };
 
   num2words.setMode("indian");
   var indian = num2words.numberToWords(input);
 
   num2words.setMode("international");
   var intl = num2words.numberToWords(input);
 
   $("#resultDiv").html(
     "<table bgcolor='#CCFFFF'><tr><td>In India</td><td>" + indian
       + "</td></tr><tr><td>Internationally</td><td>" + intl
       + "</td></tr></table>");
   $("#resultDiv").show("slow");
   
  }
 
  $(document).ready( function() {
   $("#resultDiv").hide();
   $("#input").focus();
   $(document).keypress( function(e) {
    if (e.keyCode == 27) {
      clear();
     };
     if (e.keyCode == 13) {
      translate();
     };
    });
  });
</script> 
<div id="content" 
align="center">[you can use enter and escape]
 <span id="errSpan" style="color: #FF0000;"></span> <div>Enter a number: <input id="input" type="text" size="15" 
/><input type="button" onclick="translate()" value="Convert to words" /></div> <div id="resultDiv" style="border: solid 
black 1px;"></div> </div>

And yeah, of course, here's the code (use <a 
href="http://abhisanoujam.blogspot.com/2009/03/posting-javascript-in-blogger_23.html">this link</a> to convert ur 
javascript into blogger friendly code):

<pre name="code" class="javascript:collapse">

&lt;script type="text/javascript" 
src="http://abhi-sanoujam-blogspot-posts.googlecode.com/svn/trunk/js/jquery-1.3.2.min.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript"&gt;
 function NumberToWords() {

  var units = [ "Zero", "One", "Two", "Three", "Four", "Five", "Six",
    "Seven", "Eight", "Nine", "Ten" ];
  var teens = [ "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty" ];
  var tens = [ "", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty",
    "Seventy", "Eighty", "Ninety" ];

  var othersIndian = [ "Thousand", "Lakh", "Crore" ];

  var othersIntl = [ "Thousand", "Million", "Billion", "Trillion" ];

  var INDIAN_MODE = "indian";
  var INTERNATIONAL_MODE = "international";
  var currentMode = INDIAN_MODE;

  var getBelowHundred = function(n) {
   if (n &gt;= 100) {
    return "greater than or equal to 100";
   };
   if (n &lt;= 10) {
    return units[n];
   };
   if (n &lt;= 20) {
    return teens[n - 10 - 1];
   };
   var unit = Math.floor(n % 10);
   n /= 10;
   var ten = Math.floor(n % 10);
   var tenWord = (ten &gt; 0 ? (tens[ten] + " ") : '');
   var unitWord = (unit &gt; 0 ? units[unit] : '');
   return tenWord + unitWord;
  };

  var getBelowThousand = function(n) {
   if (n &gt;= 1000) {
    return "greater than or equal to 1000";
   };
   var word = getBelowHundred(Math.floor(n % 100));

   n = Math.floor(n / 100);
   var hun = Math.floor(n % 10);
   word = (hun &gt; 0 ? (units[hun] + " Hundred ") : '') + word;

   return word;
  };

  return {
   numberToWords : function(n) {
    if (isNaN(n)) {
     return "Not a number";
    };

    var word = '';
    var val;

    val = Math.floor(n % 1000);
    n = Math.floor(n / 1000);

    word = getBelowThousand(val);

    if (this.currentMode == INDIAN_MODE) {
     othersArr = othersIndian;
     divisor = 100;
     func = getBelowHundred;
    } else if (this.currentMode == INTERNATIONAL_MODE) {
     othersArr = othersIntl;
     divisor = 1000;
     func = getBelowThousand;
    } else {
     throw "Invalid mode - '" + this.currentMode
       + "'. Supported modes: " + INDIAN_MODE + "|"
       + INTERNATIONAL_MODE;
    };

    var i = 0;
    while (n &gt; 0) {
     if (i == othersArr.length - 1) {
      word = this.numberToWords(n) + " " + othersArr[i] + " "
        + word;
      break;
     };
     val = Math.floor(n % divisor);
     n = Math.floor(n / divisor);
     if (val != 0) {
      word = func(val) + " " + othersArr[i] + " " + word;
     };
     i++;
    };
    return word;
   },
   setMode : function(mode) {
    if (mode != INDIAN_MODE && mode != INTERNATIONAL_MODE) {
     throw "Invalid mode specified - '" + mode
       + "'. Supported modes: " + INDIAN_MODE + "|"
       + INTERNATIONAL_MODE;
    };
    this.currentMode = mode;
   }
  }
 }

 function clear() {
  $("#errSpan").hide();
  $("#resultDiv").hide();
 }

 var num2words = new NumberToWords();

 function translate() {
  clear();
  var input = $("#input").val();
  if (isNaN(input)) {
   $("#errSpan").html("This is not a number - " + input);
   $("#errSpan").show();
   $("#input").focus();
   return;
  };

  num2words.setMode("indian");
  var indian = num2words.numberToWords(input);

  num2words.setMode("international");
  var intl = num2words.numberToWords(input);

  $("#resultDiv").html(
    "&lt;table bgcolor='#CCFFFF'&gt;&lt;tr&gt;&lt;td&gt;In India&lt;/td&gt;&lt;td&gt;" + indian
      + "&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td&gt;Internationally&lt;/td&gt;&lt;td&gt;" + intl
      + "&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;");
  $("#resultDiv").show("slow");
  
 }

 $(document).ready( function() {
  $("#resultDiv").hide();
  $("#input").focus();
  $(document).keypress( function(e) {
   if (e.keyCode == 27) {
     clear();
    };
    if (e.keyCode == 13) {
     translate();
    };
   });
 });
&lt;/script&gt;

&lt;div id="content" align="center"&gt;[you can use enter and escape]&lt;br /&gt;
&lt;span id="errSpan" style="color: #FF0000;"&gt;&lt;/span&gt;
&lt;div&gt;Enter a number: &lt;input id="input" type="text" size="15" /&gt;&lt;input
 type="button" onclick="translate()" value="Convert to words" /&gt;&lt;/div&gt;

&lt;div id="resultDiv" style="border: solid black 1px;"&gt;&lt;/div&gt;
&lt;/div&gt;

</pre><img src="http://feeds.feedburner.com/~r/abhisanoujam-blogspot/~4/zIKVFqnLnUQ" height="1" width="1"/>
