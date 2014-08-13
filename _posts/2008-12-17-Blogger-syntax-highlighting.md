---           
layout: post
title: Blogger + syntax highlighting
date: 2008-12-17 13:14:47 UTC
updated: 2008-12-17 13:14:47 UTC
comments: false
categories: bash syntax highlight blogger properties syntax highlight syntax-highlight
---
 
I was frustrated to see my
 [last post]({% post_url 2008-12-17-Maven-hibernate-jpa-ehcache-spring-terracotta-composite-keys %})
how blogger was 
displaying my source-codes for xml, properties file and bash script. It was just un-readable.

At last thought I'll clean stuff up a little bit, and also by the way thought of covering up the changes that I made to 
my blog template for syntax highlighting. Just wanted to keep my changes somewhere, last time forgot to keep a back-up 
of my working template before editing and had to start all over.

I'll be using the <a href="http://code.google.com/p/syntaxhighlighter/">syntax-highlighter</a> to highlight my 
source-codes in my blog.
Things that are needed for this are:

Download <a 
href="http://syntaxhighlighter.googlecode.com/files/SyntaxHighlighter_1.5.1.rar">syntax-highlighter</a> and upload it 
somewhere in the internet where you have access to. I chose <a href="http://pages.google.com/">google-pages</a> to host 
my files.
The main files that need to be uploaded are:
<ul><li>dp.SyntaxHighlighter/Scripts/clipboard.swf
</li><li>dp.SyntaxHighlighter/Scripts/shBrushJava.js
</li><li>dp.SyntaxHighlighter/Scripts/shCore.js
</li><li>dp.SyntaxHighlighter/Styles/SyntaxHighlighter.css
</li></ul>I uploaded only the shBrushJava.js brush at start as I thought I would normally be posting only java 
source-codes. Later I uploaded most of the brushes (including shBrushXml, which was why my earlier post was screwed 
up).... in fact I'll be creating some new brushes myself today ;-)

Add links in you blog template to link to the files uploaded in the above step. For this add the following 
code snippet at the head of your template, just after the &lt;head&gt; tag

~~~
<link href='http://highlighter.abhi.sanoujam.googlepages.com/SyntaxHighlighter.css' rel='stylesheet' 
type='text/css'/>
<script language='javascript' src='http://highlighter.abhi.sanoujam.googlepages.com/shCore.js'/>
<script language='javascript' src='http://highlighter.abhi.sanoujam.googlepages.com/shBrushJava.js'/>
<script language='javascript' src='http://highlighter.abhi.sanoujam.googlepages.com/shBrushJScript.js'/>
<script language='javascript' src='http://highlighter.abhi.sanoujam.googlepages.com/shBrushXml.js'/>
<script language='javascript' src='http://highlighter.abhi.sanoujam.googlepages.com/shBrushProperties.js'/>
<script language='javascript' src='http://highlighter.abhi.sanoujam.googlepages.com/shBrushBash.js'/>
<style type='text/css'>
.console {
background-color: black;
color: #ffffff;
font-family: courier;
}
</style>
~~~

Now, replace http://highlighter.abhi.sanoujam.googlepages.com with your own url where you have uploaded your files.
Again notice that shBrushProperties.js and shBrushBash.js are actually not present in the syntax-highlighter that you 
downloaded. We'll create them in this post :)
Also we'll talk later about the .console CSS later.

Activate (call the js function) the highlighter. You can do this by adding the following code snippet at the 
end of your template just before the </body>tag:


    <script language='javascript'>
      dp.SyntaxHighlighter.ClipboardSwf = 'http://highlighter.abhi.sanoujam.googlepages.com/clipboard.swf'; 
      dp.SyntaxHighlighter.BloggerMode();
      dp.SyntaxHighlighter.HighlightAll('code'); 
    </script>

</li></ol>Now you are all done to start posting source codes. You can either use the <span 
style="font-weight: bold;"><pre></span> or <span style="font-weight: bold;">&lt;textarea></span> to enclose 
your source-codes, and give the name="code" attribute and class="java" for your java source. eg.

    <pre name="code" class="java">
    public class HelloBlogger {
    public static void main(String [] args) {
      System.out.println("Hello Blogger!!");
    }
    }
    </pre>

will look like:

<pre name="code" class="java:collapse">
public class HelloBlogger {
public static void main(String [] args) {
 System.out.println("Hello Blogger!!");
}
}
</pre>

I personally prefer using the <span style="font-weight: bold;"><pre></span> tag for java and <span 
style="font-weight: bold;">&lt;textarea></span> tag for posting xml/html codes which normally contains characters 
like <, >

Now here is <a href="{{ ASSET_PATH }}/highlighter/shBrushProperties.js">shBrushProperties.js</a>
<textarea name="code" class="js">
dp.sh.Brushes.Properties = function()
{
 this.regexList = [
  { regex: dp.sh.RegexLib.SingleLinePerlComments,       css: 'comment' },  // one line comments
  { regex: new RegExp('\\b([\\d]+(\\.[\\d]+)?|0x[a-f0-9]+)\\b', 'gi'), css: 'number' },  // numbers
 ];
}
dp.sh.Brushes.Properties.prototype = new dp.sh.Highlighter();
dp.sh.Brushes.Properties.Aliases = ['properties'];
</textarea>

I just created this brush so that my source for properties file can look nice.
Same for my bash scripts, which is <a 
href="{{ ASSET_PATH }}/highlighter/shBrushBash.js">shBrushBash.js</a>:
<textarea name="code" class="js">
dp.sh.Brushes.Bash = function()
{
 var keywords = 'break case esac if fi do done in while ' +
   'echo ls touch uname rm ' +
   'mvn svn' +
   '';
 this.regexList = [
  { regex: dp.sh.RegexLib.SingleLinePerlComments,        css: 'comment' },  // one line comments
  { regex: dp.sh.RegexLib.DoubleQuotedString,        css: 'string' },  // strings
  { regex: dp.sh.RegexLib.SingleQuotedString,        css: 'string' },  // strings
  { regex: new RegExp('\\b([\\d]+(\\.[\\d]+)?|0x[a-f0-9]+)\\b', 'gi'), css: 'number' },  // numbers
  { regex: new RegExp(this.GetKeywords(keywords), 'gm'),     css: 'keyword' }  // bash keyword
  ];
}
dp.sh.Brushes.Bash.prototype = new dp.sh.Highlighter();
dp.sh.Brushes.Bash.Aliases = ['bash'];
</textarea>

You can see that there are only a handful of keywords for the Bash script brush right now. I intend to expand as my 
blogs keep rolling. For starters, its kinda ok.

Now coming to the console CSS style, this is just a small hack for displaying command lines to get a feeling of 
console/terminals
You can use this like;

    <pre class="console">
    $ javac HelloBlogger.java
    $ java HelloBlogger
    Hello Blogger!!
    </pre>

Which will look something like:

<pre class="console">
$ javac HelloBlogger.java
$ java HelloBlogger
Hello Blogger!!
</pre>

You don't need to specify the name attibute :)

And ohh, forgot to mention and found out again when clicking "Publish Post", if you are posting XML/HTML, anything 
which has < or >, replace them with &amp;lt; and &amp;gt; am thinking of putting up a post that will specifically 
do that.

Enjoy...<img src="http://feeds.feedburner.com/~r/abhisanoujam-blogspot/~4/OGxRWKQ7ZjI" height="1" width="1"/>
