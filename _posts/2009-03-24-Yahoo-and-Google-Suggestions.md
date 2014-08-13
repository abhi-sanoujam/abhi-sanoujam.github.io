---           
layout: post
title: Yahoo and Google Suggestions
date: 2009-03-24 13:38:58 UTC
updated: 2009-03-24 13:38:58 UTC
comments: false
categories: javascript
tags: web fun google suggest javascript yahoo
---
 
<script type="text/javascript">var dzone_style = '1';</script> <script language="javascript" 
src="http://widgets.dzone.com/widgets/zoneit.js"></script>
 
I always loved the suggestions from the google searchbox in firefox. Most of the time the term that I wanted to search 
almost always came up in the suggestions. I don't remember when was the last time i really went to www.google.com to do 
some search, have been always using the search box in the toolbar.
Had been thinking of having some fun with it since quite some time now...

I don't think there's any official API from google for Google Suggest, but looking at iGoogle (it also gives you 
suggestions real time), there do seemed to be some kind of API. The urls used by Google suggest (as of now) do support 
callbacks, which gives some opportunity to have fun with it :)
Apparently yahoo has got some API for <a href="http://developer.yahoo.com/search/web/V1/relatedSuggestion.html">Related 
Suggestions</a> (yahoo suggest?). I was playing around with the API's from both google and yahoo... it was fun. Seems 
to me like google is giving much better results at least compared to yahoo's Related Suggestions. Nonetheless, its just 
fun looking at the results :)

Have fun here... do some typing in the input box below :)

<script type="text/javascript">
var gurl = "http://www.google.com/complete/search?output=json&callback=gcallback&q=";
var yurl = 
"http://search.yahooapis.com/WebSearchService/V1/relatedSuggestion?appid=abhisanoujam&output=json&callback=ycallback&que
ry=";
var gsurl = "http://www.google.com/search?q=";
var ysurl = "http://search.yahoo.com/search?p=";

var gel, yel, lgel, lyel, inp, gres, yres, gh, yh;

function init(ename) {
 var el = document.getElementById(ename);
 if (el) {
  inp = document.createElement("input");
  inp.id = "inputText";
  inp.type = "text";
  inp.setAttribute("autocomplete", "off");
  inp.onkeyup = keyup;
  inp.size = 55;
  inp.value = "Try your text here";
  el.appendChild(inp);
 }
 var cont = document.createElement("div");
 cont
   .setAttribute("style",
     "border-style:solid;border-width: 1px;float: left;padding:2px;margin:2px;");

 var gcont = document.createElement("div");
 gcont
   .setAttribute(
     "style",
     "float: left;padding:2px;margin:2px;width: 300px;height: 300px;border-style:solid;border-width: 1px;");
 gh = document.createElement("div");
 gh.setAttribute("style", "font-size: 16px;color:#33CC33;");
 gh.innerHTML = "Google Suggests";
 gcont.appendChild(gh);
 gres = document.createElement("div");
 gcont.appendChild(gres);
 cont.appendChild(gcont);

 var ycont = document.createElement("div");
 ycont
   .setAttribute(
     "style",
     "float: left;padding:2px;margin:2px;width: 300px;height: 300px;border-style:solid;border-width: 1px;");
 yh = document.createElement("div");
 yh.setAttribute("style", "font-size: 16px;color:#33CC33;");
 yh.innerHTML = "Yahoo Suggests";
 ycont.appendChild(yh);
 yres = document.createElement("div");
 ycont.appendChild(yres);
 cont.appendChild(ycont);

 el.appendChild(cont);

 gel = document.createElement("div");
 el.appendChild(gel);
 yel = document.createElement("div");
 el.appendChild(yel);
 keyup(null);
}
function keyup(evt) {
 if (emptyCheck()) {
  return;
 }
 var gsel = document.createElement("script");
 gsel.setAttribute("type", "text/javascript");
 gsel.setAttribute("src", gurl + inp.value);
 gel.appendChild(gsel);
 lgel = {
  "node" :gsel,
  "text" :inp.value
 };

 var ysel = document.createElement("script");
 ysel.setAttribute("type", "text/javascript");
 ysel.setAttribute("src", yurl + inp.value);
 yel.appendChild(ysel);
 lyel = {
  "node" :ysel,
  "text" :inp.value
 };
}

function emptyCheck() {
 if (trim(inp.value) == "") {
  var e = new Array();
  displayRes(gres, e, null, gh, "Google");
  displayRes(yres, e, null, yh, "Yahoo");
  return true;
 }
 return false;
}

function gcallback(resp) {
 if (emptyCheck()) {
  return;
 }
 var res = new Array();
 var t = resp[1];
 if (t) {
  for ( var i = 0; i < t.length; i++) {
   res.push( {
    "text" :t[i][0],
    "results" :t[i][1]
   });
  }
 }
 displayRes(gres, res, gsurl, gh, "Google");
 removeAllChildrenExcept(gel, lgel.node);
}

function ycallback(resp) {
 if (emptyCheck()) {
  return;
 }
 var res = new Array();
 var t = resp.ResultSet;
 if (t) {
  var tt = t.Result;
  if (tt) {
   for ( var i = 0; i < tt.length; i++) {
    res.push( {
     "text" :tt[i]
    });
   }
  }
 }
 displayRes(yres, res, ysurl, yh, "Yahoo");
 removeAllChildrenExcept(yel, lyel.node);
}

function displayRes(el, r, surl, hh, t) {
 var h = '';
 var l = r.length;
 for ( var i = 0; i < l; i++) {
  var fsurl = surl + escape(r[i].text);
  h += '<span style="font-size: 12px; font-weight: bold;"><a target="_blank" '
    + 'style="text-decoration: none;" href="'
    + fsurl
    + '"> '
    + r[i].text + '</a>';
  if (r[i].results) {
   h += '</span> <span style="font-size: 10px;">' + r[i].results + '</span>
';
  } else
   h += '<span>
';
 }
 if (l <= 0) {
  h = '---';
 }
 el.innerHTML = h;
 hh.innerHTML = t + ' Suggests (' + l + ' results) ' + getSmiley(l);
}
function getSmiley(l) {
 if (l <= 0) {
  return '<img alt="sad" src="http://l.yimg.com/us.yimg.com/i/mesg/emoticons7/20.gif">';
 } else if (l >= 1 && l <= 3) {
  return '<img alt="smile" src="http://l.yimg.com/us.yimg.com/i/mesg/emoticons7/15.gif">';
 } else if (l >= 4 && l <= 7) {
  return '<img alt="happy" src="http://l.yimg.com/us.yimg.com/i/mesg/emoticons7/1.gif">';
 } else
  return '<img alt="elated" src="http://l.yimg.com/us.yimg.com/i/mesg/emoticons7/69.gif">';
}

function removeAllChildrenExcept(node, keepchild) {
 for ( var i = node.childNodes.length - 1; i >= 0; i--) {
  if (node.childNodes[i] != keepchild) {
   node.removeChild(node.childNodes[i]);
  }
 }
}
function trim(str) {
 return str.replace(/ [ ]*/g, '');
}

</script>

<div id="suggestions"> <script type="text/javascript"> init("suggestions"); </script> </div>

<div style="clear:both">
Oh, by the way, you can click on the results too (will open in a new tab/window)
</div>

And here's the code...
The html used for the above is as simple as this:

<pre name="code" class="xml:collapse">
&lt;div id="suggestions"&gt;
 &lt;script type="text/javascript"&gt;
  init("suggestions");
 &lt;/script&gt;
&lt;/div&gt;
</pre>

And here's the actual javascript code thats doing the bulk of the work:

<pre name="code" class="xml:collapse">
var gurl = "http://www.google.com/complete/search?output=json&callback=gcallback&q=";
var yurl = 
"http://search.yahooapis.com/WebSearchService/V1/relatedSuggestion?appid=abhisanoujam&output=json&callback=ycallback&que
ry=";
var gsurl = "http://www.google.com/search?q=";
var ysurl = "http://search.yahoo.com/search?p=";

var gel, yel, lgel, lyel, inp, gres, yres, gh, yh;

function init(ename) {
 var el = document.getElementById(ename);
 if (el) {
  inp = document.createElement("input");
  inp.id = "inputText";
  inp.type = "text";
  inp.setAttribute("autocomplete", "off");
  inp.onkeyup = keyup;
  inp.size = 55;
  inp.value = "Try your text here";
  el.appendChild(inp);
 }
 var cont = document.createElement("div");
 cont
   .setAttribute("style",
     "border-style:solid;border-width: 1px;float: left;padding:2px;margin:2px;");

 var gcont = document.createElement("div");
 gcont
   .setAttribute(
     "style",
     "float: left;padding:2px;margin:2px;width: 300px;height: 300px;border-style:solid;border-width: 1px;");
 gh = document.createElement("div");
 gh.setAttribute("style", "font-size: 16px;color:#33CC33;");
 gh.innerHTML = "Google Suggests";
 gcont.appendChild(gh);
 gres = document.createElement("div");
 gcont.appendChild(gres);
 cont.appendChild(gcont);

 var ycont = document.createElement("div");
 ycont
   .setAttribute(
     "style",
     "float: left;padding:2px;margin:2px;width: 300px;height: 300px;border-style:solid;border-width: 1px;");
 yh = document.createElement("div");
 yh.setAttribute("style", "font-size: 16px;color:#33CC33;");
 yh.innerHTML = "Yahoo Suggests";
 ycont.appendChild(yh);
 yres = document.createElement("div");
 ycont.appendChild(yres);
 cont.appendChild(ycont);

 el.appendChild(cont);

 gel = document.createElement("div");
 el.appendChild(gel);
 yel = document.createElement("div");
 el.appendChild(yel);
 keyup(null);
}
function keyup(evt) {
 if (emptyCheck()) {
  return;
 }
 var gsel = document.createElement("script");
 gsel.setAttribute("type", "text/javascript");
 gsel.setAttribute("src", gurl + inp.value);
 gel.appendChild(gsel);
 lgel = {
  "node" :gsel,
  "text" :inp.value
 };

 var ysel = document.createElement("script");
 ysel.setAttribute("type", "text/javascript");
 ysel.setAttribute("src", yurl + inp.value);
 yel.appendChild(ysel);
 lyel = {
  "node" :ysel,
  "text" :inp.value
 };
}

function emptyCheck() {
 if (trim(inp.value) == "") {
  var e = new Array();
  displayRes(gres, e, null, gh, "Google");
  displayRes(yres, e, null, yh, "Yahoo");
  return true;
 }
 return false;
}

function gcallback(resp) {
 if (emptyCheck()) {
  return;
 }
 var res = new Array();
 var t = resp[1];
 if (t) {
  for ( var i = 0; i &lt; t.length; i++) {
   res.push( {
    "text" :t[i][0],
    "results" :t[i][1]
   });
  }
 }
 displayRes(gres, res, gsurl, gh, "Google");
 removeAllChildrenExcept(gel, lgel.node);
}

function ycallback(resp) {
 if (emptyCheck()) {
  return;
 }
 var res = new Array();
 var t = resp.ResultSet;
 if (t) {
  var tt = t.Result;
  if (tt) {
   for ( var i = 0; i &lt; tt.length; i++) {
    res.push( {
     "text" :tt[i]
    });
   }
  }
 }
 displayRes(yres, res, ysurl, yh, "Yahoo");
 removeAllChildrenExcept(yel, lyel.node);
}

function displayRes(el, r, surl, hh, t) {
 var h = '';
 var l = r.length;
 for ( var i = 0; i &lt; l; i++) {
  var fsurl = surl + escape(r[i].text);
  h += '&lt;span style="font-size: 12px; font-weight: bold;"&gt;&lt;a target="_blank" '
    + 'style="text-decoration: none;" href="'
    + fsurl
    + '"&gt; '
    + r[i].text + '&lt;/a&gt;';
  if (r[i].results) {
   h += '&lt;/span&gt; &lt;span style="font-size: 10px;"&gt;' + r[i].results + '&lt;/span&gt;&lt;br /&gt;';
  } else
   h += '&lt;span&gt;&lt;br /&gt;';
 }
 if (l &lt;= 0) {
  h = '---';
 }
 el.innerHTML = h;
 hh.innerHTML = t + ' Suggests (' + l + ' results) ' + getSmiley(l);
}
function getSmiley(l) {
 if (l &lt;= 0) {
  return '&lt;img alt="sad" src="http://l.yimg.com/us.yimg.com/i/mesg/emoticons7/20.gif"&gt;';
 } else if (l &gt;= 1 && l &lt;= 3) {
  return '&lt;img alt="smile" src="http://l.yimg.com/us.yimg.com/i/mesg/emoticons7/15.gif"&gt;';
 } else if (l &gt;= 4 && l &lt;= 7) {
  return '&lt;img alt="happy" src="http://l.yimg.com/us.yimg.com/i/mesg/emoticons7/1.gif"&gt;';
 } else
  return '&lt;img alt="elated" src="http://l.yimg.com/us.yimg.com/i/mesg/emoticons7/69.gif"&gt;';
}

function removeAllChildrenExcept(node, keepchild) {
 for ( var i = node.childNodes.length - 1; i &gt;= 0; i--) {
  if (node.childNodes[i] != keepchild) {
   node.removeChild(node.childNodes[i]);
  }
 }
}
function trim(str) {
 return str.replace(/ [ ]*/g, '');
}
</pre>


Have fun :)
