---           
layout: post
title: Just a quick note.... Maven + dependencies + classpath
date: 2008-11-21 13:29:32 UTC
updated: 2008-11-21 13:29:32 UTC
comments: false
categories: java 
tags: java maven
---
 
Just wanted to capture this for personal purpose...

How to find out/export the classpath from a maven project so that it can be used from scripts etc?

-- Using the <a 
href="http://maven.apache.org/plugins/maven-dependency-plugin/build-classpath-mojo.html">build-classpath goal</a> of 
the Maven dependency plugin.

The parameter name
<code>maven.dep.cpFile</code> given at the <a href="http://maven.apache.org/plugins/maven-dependency-plugin/usage.html">
usage</a> of this goal is deprecated and does 
not work. Its recommended to use the ouputFile parameter instead.

So some examples...

    mvn dependency:build-classpath

prints the classpath in the console... and

    mvn dependency:build-classpath -Dmdep.outputFile=cp.txt
    
puts the classpath in the file called cp.txt
