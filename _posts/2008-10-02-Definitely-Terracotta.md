---           
layout: post
title: Definitely Terracotta
date: 2008-10-02 23:11:09 UTC
updated: 2008-10-02 23:11:09 UTC
categories: java 
tags: java terracotta
---
 
<blockquote>
Imagine being able to call <tt>wait()</tt> on a Java object in one JVM, 
and imagine that later a thread in another JVM on another computer calls <tt>notify()</tt> on that same object and 
that <tt>notify()</tt> call penetrates the impermeable process boundary between the two JVMs to wake your thread from
its slumber. Further imagine that all of the changes to that object made in the other JVM while you were waiting are
now visible to your thread. Imagine now that the code you wrote to make this happen looked no <i>different</i> than
code you would have written were this program to run only on a single JVM—no concessions to special frameworks, 
no callouts to special APIs, no stubs, no skeletons, no copies, no put-backs, and no magic beans.

What 
would it be like if you could automatically share Java heap between virtual machines so that threads running in 
different JVMs could interact with each other exactly as if they were running in the same JVM? Imagine what you could
do with that kind of power -— the power to express a computing problem in the simplest possible terms that stay true 
to the problem at hand yet be able to run that program on multiple computers at once while the program thinks it’s 
running on one big computer. What would such a thing be? And wouldn’t you really, really want it if you could have 
it?

Terracotta was born out of just such imaginings.
Terracotta is Java infrastructure software that 
allows you to scale your application to as many computers as needed, without expensive custom code or databases. 
Throughout this book, it is referred to as JVM-level clustering or network-attached memory. The question you now face
 is how to understand and leverage this technology best.
</blockquote>
 
 
Doesn't that sound cool? Its an excerpt from the introduction in <a href="http://www.amazon.com/Definitive-Guide-Terracotta-Hibernate-Scalability/dp/1590599861/ref=pd_bbs_sr_1?ie=UTF8&s=books&qid=1222986439&sr=8-1">
The Definitive Guide to Terracotta</a> about <a href="http://terracotta.org/">Terracotta</a> from the same people who
made all this imaginations a reality.

I am working for <a href="http://terracottatech.com/">Terracotta</a>
these days, and since joining had been doing real cool stuff. 

We are developing a reference app these days on
the <a href="http://tech.puredanger.com/2008/07/08/narrowing-the-focus/">sessions-clustering use case</a>. Its not only 
about developing a web-app and clustering a web application with Terracotta, but get out the best practices and design 
patterns and best ways to solve problems for similar use cases, to say the least. We had focussed down on the <a 
href="http://tech.puredanger.com/2008/07/29/settling-on-a-stack/">technology stack</a> and almost done developing the 
app. 


In the process, I learnt a lot personally and got exposed to cool new technologies and how to leverage 
Terracotta. I plan to share my experience and hope that it helps others out there.

More posts coming up on 
Spring, Spring MVC, Spring Web-flow, Spring security, JPA, hibernate, maven... and other cool stuffs!!

Stay tuned... ;-)
