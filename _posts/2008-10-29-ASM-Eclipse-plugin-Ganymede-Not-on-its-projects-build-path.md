---           
layout: post
title: ASM Eclipse plugin + Ganymede + Not on its project's build path
date: 2008-10-29 10:25:10 UTC
updated: 2008-10-29 10:25:10 UTC
comments: false
categories: java
tags: java asm eclipse eclipse-plugin
---
 
ASM plugin for eclipse found <a href="http://asm.objectweb.org/eclipse/index.html">here</a> works neat upto Eclipse 3.3

If you have updated to Eclipse Ganymede, you will see that it no longer works.
It complains something like:


    Error (Bytecode Outline) src/Foo.java [in BarProject] is not on its project's build path.
    
Where Foo.java is the java class for which you want to view the bytecode and MyProject is the eclipse project in which 
it
is present.

After a little bit of googling found out that a new version of the plugin is available for Eclipse Ganymede. 
You can get the new version at <a 
href="http://andrei.gmxhome.de/bytecode/index.html">http://andrei.gmxhome.de/bytecode/index.html</a>.
Use <a href="http://andrei.gmxhome.de/eclipse/">http://andrei.gmxhome.de/eclipse/</a> as the update URL with the update 
manager and install the new version.


Works cool now :)
