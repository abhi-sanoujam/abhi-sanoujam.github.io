---           
layout: post
title: bash command line editing + custom inputrc -> efficient editing
date: 2009-06-24 12:44:58 UTC
updated: 2009-06-24 12:44:58 UTC
categories: bash
tags: bash command-line
---
 
<script type="text/javascript">var dzone_style = '1';var dzone_url = 
'http://abhisanoujam.blogspot.com/2009/06/bash-command-line-editing-custom.html';</script> <script 
language="javascript" src="http://widgets.dzone.com/widgets/zoneit.js"></script>

Command line editing in bash is sometimes tiring when you have long commands accepting multiple arguments etc. Its hard 
to edit the command line when you want to change some parameter here and there... adding some parameters in the middle 
or even modifying existing parameters. I've seen people mostly using the arrow keys to go back and forth and deleting 
everything and typing in again, or sometimes using copy-paste from previous lines for editing those long long commands. 
I used to do it myself...


But then you can set command line editing modes in bash. This is where it helps a lot in editing those long long 
commands that you sometimes run.

The default mode is set to emacs, and you can choose between using the default or using vi mode. If you want to switch 
to vi mode, use the following:
<pre class="console">

 $ set -o vi

</pre>

In vi mode, you can edit the command line as you would normally edit using vi. Press ESC in the command line to switch 
to vi command mode. And you can go forward editing with all vi habits you got... moving forward-word, backward-word, 
delete, cut, paste...etc. Typing "i" in command mode will bring you back in vi insert mode.

If you are not into vi, you can switch back to emacs mode using:

<pre class="console">

 $ set -o emacs

</pre>


I have never used emacs myself and being a fan of vi, I used to have vi mode in bash. But I was never happy with that 
mode.... seemed like too many keystrokes needed to switch between command/insert mode. Also some of the default 
shortcuts didn't work in vi mode like control-a to move to beginning of line etc.

Using emacs mode, you don't need to switch between command/insert mode like in vi. One disadvantage is I don't know 
emacs and don't wanna learn :)

So here's I came up with - default emacs mode and a custom key mapping for most of the common editing functions. Yes, 
you can specify custom key mappings using a <a href="http://www.faqs.org/docs/bashman/bashref_89.html">.inputrc</a> in 
your home directory. You should probably go <a href="http://www.faqs.org/docs/bashman/bashref_89.html">here</a> if you 
want to find out about how to edit/manage your inputrc file....
 
I guess the most common editing functions that ppl would mostly care about would be (well its true for me at least)
<ul>
<li>Moving forward and backwards by character: Use left/right arrow keys. I guess am too used to using the arrow 
keys</li>
<li>Deleting backward and forward characters: Use backspace and delete keys of course, again too used to it</li>
<li>Moving forward and backwards by word: I didn't like the default mapping of using ESC+b and ESC+f. Felt kind of lazy 
reaching out for that far-off ESC key :) .... so I changed it to use control-b and control-f instead </li>
<li>Moving to beginning and end of line: Use the default mappings, control+a to move to beginning and control+e to move 
to end</li>
<li>Deleting everything from cursor to beginning: Use default mapping of control+u

When you feel like deleting whole of line, use control-e controle-u, i.e. goto end of line and delete everything upto 
beginning of command</li>
<li>Deleting one word backward from cursor: Use default control+w

If you want to delete the forward word, use control+f control+w, i.e. go forward one word and delete back one word</li>
<li>Undo: People might not need this normally, but it's handy sometimes. Use default control-x control-u</li>
</ul>

Here's the contents of my inputrc file:

<pre name="code" class="bash:collapse">

# This file controls the behaviour of line input editing for
# programs that use the Gnu Readline library.  Existing programs
# include FTP, Bash, and Gdb.
#
# You can re-read the inputrc file with C-x C-r.
# Lines beginning with '#' are comments.
#

set editing-mode emacs 

$if mode=emacs

"\C-f": forward-word
"\C-b": backward-word
"\C-a": beginning-of-line
"\C-e": end-of-line
"\C-u": unix-line-discard
"\C-w": unix-word-rubout
"\C-x\C-u": undo

$endif


</pre>

As in the comments, if you are editing you inputrc file its helpful to know you can reload your mappings with control-x 
control-r

I'm pretty sure if you have a handy .inputrc file, you won't be frustrated next time when you have one of those long 
command line and need to edit them, you'll be no longer using the arrow keys :)

Enjoy your bash command editing sessions...<img 
src="http://feeds.feedburner.com/~r/abhisanoujam-blogspot/~4/JTEPFTXbE5Q" height="1" width="1"/>
