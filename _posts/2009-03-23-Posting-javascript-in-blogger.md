---           
layout: post
title: Posting javascript in blogger
date: 2009-03-23 14:07:11 UTC
updated: 2009-03-23 14:07:11 UTC
comments: false
categories: 
---
 
I once tried to post some javascript inside the post itself and found out that it was not working.

Well seems like if you want to embed &lt;script&gt; tags inside the post, and you have "Convert line breaks" set to 
true (by default), you cannot add script tags, as Blogger would add &lt;br /&gt; instead of your line breaks.

So you need to write down your script in one single line.



Which is what this post actually does. Use it to your heart's content :)

Post your javascript here

<script type="text/javascript"> function toggleCheckbox(docid) { var rs = document.getElementById(docid); rs.checked = 
!rs.checked; } function removeNewLines() { var rnl = document.getElementById("removeNewLines"); var rs = 
document.getElementById("removeSpace"); var rlt = document.getElementById("replaceLt"); var c = 
document.getElementById('content').value; var r = rl(c, rnl.checked, rs.checked, rlt.checked); 
document.getElementById('result').value = r; } function rl(str, rnl, rs, rlt) { if (rnl) { str = 
str.replace(/[\n\r\t]/g,' '); } if (rs) { str = str.replace(/ [ ]*/g,' '); } if (rlt) { str = 
str.replace(/</g,'&lt;').replace(/>/g, '&gt;'); } return str; } </script> >

<div>

<textarea id="content" rows="20" cols="60" style="background-color: #FFCC99"></textarea>

</div>

<div>

<input style="cursor:hand;cursor:pointer;" type="checkbox" id="removeNewLines" checked="checked" /><span 
onclick="toggleCheckbox('removeNewLines');" style="cursor:hand;cursor:pointer;"> Remove New Lines</span><input 
style="cursor:hand;cursor:pointer;" type="checkbox" id="removeSpace" checked="checked" /><span 
onclick="toggleCheckbox('removeSpace');" style="cursor:hand;cursor:pointer;"> Remove Multiple spaces</span><input 
style="cursor:hand;cursor:pointer;" type="checkbox" id="replaceLt" /><span onclick="toggleCheckbox('replaceLt');" 
style="cursor:hand;cursor:pointer;"> Replace &lt;, &gt; to &amp;lt; and &amp;gt; resp.</span>



<input type="button" onclick="removeNewLines();" value="Modify!!" />

</div>

<div>

<textarea id="result" rows="15" cols="80" style="background-color: #CCFF99"></textarea>

</div>

Enjoy :)



BTW, the javascript for the above is embedded in this post itself. And here's the code, use it on the above textarea 
;-):

<pre name="code" class="javascript:collapse">

&lt;script type="text/javascript"&gt;

function toggleCheckbox(docid) {
var rs = document.getElementById(docid);
rs.checked = !rs.checked;
}
function removeNewLines() {
var rnl = document.getElementById("removeNewLines");
var rs = document.getElementById("removeSpace");
var rlt = document.getElementById("replaceLt");
var c = document.getElementById('content').value;
var r = rl(c, rnl.checked, rs.checked, rlt.checked);
document.getElementById('result').value = r; 
}

function rl(str, rnl, rs, rlt) {
if (rnl) {
 str =  str.replace(/[\n\r\t]/g,' ');
}
if (rs) {
 str = str.replace(/ [ ]*/g,' ');
}
if (rlt) {
 str = str.replace(/&lt;/g,'&amp;lt;').replace(/&gt;/g, '&amp;gt;');
}
return str;
}
&lt;/script&gt;


</pre><img src="http://feeds.feedburner.com/~r/abhisanoujam-blogspot/~4/dELT1fnYSKs" height="1" width="1"/>
