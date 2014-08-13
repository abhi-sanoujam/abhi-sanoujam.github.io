---
layout: post
title: The webapp -- starting the engine
date: 2008-11-18 15:11:41 UTC
updated: 2008-11-18 15:11:41 UTC
comments: false
categories: java
tags: java sample-tc-webapp spring
---

I plan to create a simple webapp and illustrate using maven, hibernate, jpa, spring mvc, spring security, spring
webflow etc.
And at the last point add Terracotta and see how easy it is to cluster a webapp and scale out.

Basically most of the stuffs that I am going to post here are things that I learnt when building <a
        href="http://reference.terracotta.org/examinator">http://reference.terracotta.org/examinator.</a>
Yes the Examinator is live. And now you can play around with it.
You can find out more about it <a
        href="http://www.terracotta.org/web/display/orgsite/Web+App+Reference+Implementation"><span 
style="text-decoration:
underline;">here</span>.</a>

I do not plan to rewrite the whole Examinator here, but show the glue points of making those cool technologies together.

Lets get going...

First we need a project. I am going to use the <a
        href="http://forge.terracotta.org/releases/projects/webapp-archetype/index.html">webapp-archetype</a> to 
generate a
skeleton for our project.
Using the <a href="http://forge.terracotta.org/releases/projects/webapp-archetype/docs/quickstart.html">quickstart</a>
guide, I changed the groupId and the artifactId to generate a project for myself like this:


    mvn org.apache.maven.plugins:maven-archetype-plugin:1.0-alpha-7:create \
    -DarchetypeGroupId=org.terracotta.maven.archetypes \
    -DarchetypeArtifactId=webapp-archetype \
    -DarchetypeVersion=1.2.1 \
    -DgroupId=org.sanoujam \
    -DartifactId=sample-tc-webapp \
    -Dversion=1.0.0 \
    -DremoteRepositories=http://www.terracotta.org/download/reflector/maven2

This created a project for me called sample-tc-webapp and generated a working project skeleton for me.

If you want, you can verify its running by:

    cd sample-tc-webapp
    mvn tc:run
    
This will bring up two tomcat nodes on your localhost. Accessing http://localhost:8080/sample-tc-webapp should show you
a working web-app which is clustered with Terracotta. The other tomcat is running at
http://localhost:8081/sample-tc-webapp


You can find the source code of this project at <a
        href="http://code.google.com/p/sample-tc-webapp/">http://code.google.com/p/sample-tc-webapp/</a>
The source can be browsed at <a href="http://sample-tc-webapp.googlecode.com/svn/tags/day1/">http://sample-tc-webapp
.googlecode.com/svn/tags/day1/</a>

Stopping here for today...
Lets see if we can add Spring next time....
