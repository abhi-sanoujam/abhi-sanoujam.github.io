---           
layout: post
title: Meet Mac's "sandbox-exec"
date: 2009-06-26 09:30:51 UTC
updated: 2009-06-26 09:30:51 UTC
categories: mac
tags: mac sandbox
---
 
I was working on something to block outgoing connections for one particular app *only*. And I use a mac, leopard... the 
first place I went to look was System Preferences -> Security -> Firewall pane. And I was disappointed to find no 
"Block Outgoing Connections"
It can only block incoming connections. Anyway...

Then I met sandbox-exec :) It runs apps in a sandbox, which you can define to restrict access to different resources, 
network, file-systems etc Here's a simple sandbox file which denies network access...

<pre name="code" class="bash:collapse">

(version 1)
(allow default)
(deny network*)

</pre>

Running sandbox-exec with the above file will deny all network access to your app, both outgoing and incoming. Here's a 
screenshot example showing running bash with and without it:

<pre class="console">

$ ping -t3 google.com
PING google.com (74.125.67.100): 56 data bytes
64 bytes from 74.125.67.100: icmp_seq=0 ttl=49 time=368.312 ms
64 bytes from 74.125.67.100: icmp_seq=1 ttl=49 time=318.240 ms
64 bytes from 74.125.67.100: icmp_seq=2 ttl=49 time=319.793 ms

--- google.com ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss
round-trip min/avg/max/stddev = 318.240/335.448/368.312/23.247 ms
$ 
$
$ cat block-network.sb 
(version 1)
(allow default)
(deny network*)
$ 
$ sandbox-exec -f block-network.sb /bin/bash 
$ ping -t3 google.com
bash: /sbin/ping: Operation not permitted
$ ping -t3 yahoo.com
bash: /sbin/ping: Operation not permitted
$ ping -t3 apple.com
bash: /sbin/ping: Operation not permitted
$ exit
exit
$ ping -t3 google.com
PING google.com (74.125.67.100): 56 data bytes
64 bytes from 74.125.67.100: icmp_seq=0 ttl=49 time=321.997 ms
64 bytes from 74.125.67.100: icmp_seq=1 ttl=49 time=321.350 ms
64 bytes from 74.125.67.100: icmp_seq=2 ttl=49 time=321.676 ms

--- google.com ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss
round-trip min/avg/max/stddev = 321.350/321.674/321.997/0.264 ms
$

</pre>


If you want to write more sophisticated sandbox files, you should probably check out the files present in 
<tt>/usr/share/sandbox/</tt>


Enjoy...<img src="http://feeds.feedburner.com/~r/abhisanoujam-blogspot/~4/c7mAmEQ6Ky0" height="1" width="1"/>
