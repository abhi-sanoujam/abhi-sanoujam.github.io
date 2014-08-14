---           
layout: post
title: Browser cached pages + override + refresh
date: 2009-04-17 05:23:41 UTC
updated: 2009-04-17 05:23:41 UTC
categories: web
tags: web browser
---
 
This is one of those "just a quick note..."

There are pages in the web which are enabled to be "cached" on the browser and most browsers do cache these pages. But 
there are times when you want to refresh and get the "latest" copy on the server, at which times what I do normally is 
open up tools menu for the browser and do something like "clear browser cache". (One place where I normally do this is 
on the development svn server where the pages are cached, and after creating a branch/adding a directory etc, it 
doesn't show up.)

Here's a quick workaround to refresh the page and get the latest copy from the server overriding the local cached copy 
in the browser. 
Just add some random parameters at the end of the page.
e.g. If I'm looking at <a href="http://www.abhisanoujam.blogspot.com/">http://www.abhisanoujam.blogspot.com/</a>, what 
you type is <a href="http://www.abhisanoujam.blogspot.com/?a=b">http://www.abhisanoujam.blogspot.com/?a=b</a> in the 
browser address bar.
This will make sure that your browser actually hits the server bringing back the latest. Don't use the same random 
parameters as it may as well end up being cached :)

For the non-geeks: Don't forget the ? mark before the random parameters...<img 
src="http://feeds.feedburner.com/~r/abhisanoujam-blogspot/~4/nnbDAnDHPZ0" height="1" width="1"/>
