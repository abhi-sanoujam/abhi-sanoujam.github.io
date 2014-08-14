---           
layout: post
title: Odd Even printing threads... in multiple jvms -- Terracotta wow factor!
date: 2009-01-31 16:51:42 UTC
updated: 2009-01-31 16:51:42 UTC
categories: java
tags: java concurrency terracotta
---
 
Recently I got a comment asking about a small use-case demostrating <a href="http://terracotta.org/">Terracotta</a>

I hacked up a small app in which there are 2 threads (can be more), and each thread is printing numbers sequentially, 
each thread printing one after another.
With 2 threads, one of them will print odd numbers, and the other will print even numbers... when we have multiple 
number of threads, we want each thread to print one after another, the threads executing serially.

So lets take a look at the classes.
First, lets have a Counter class that will maintain the current value ...

~~~
/**
 * Jan 28, 2009
 * @author abhi.sanoujam
 */
package sample;

public class Counter {
  private final int numParties;
  private int value = 0;
  private final int maxValue;

  public Counter(int numParties, int maxValue) {
    this.numParties = numParties;
    this.maxValue = maxValue;
  }

  public synchronized boolean isMyTurn(int partyNum) {
    return value % numParties == partyNum;
  }

  public synchronized void setValue(int val) {
    this.value = val;
  }

  public int getMaxValue() {
    return maxValue;
  }

  public synchronized boolean isMaxValueReached() {
    return value >= maxValue;
  }

  public synchronized int increment() {
    this.value++;
    return value;
  }

  public synchronized int getValue() {
    return value;
  }
}
~~~

Here's the Runnable class that each thread will be using:

~~~
/**
* Jan 28, 2009
* @author abhi.sanoujam
*/
package sample;

import java.util.concurrent.CyclicBarrier;

public class OddEvenRunnable implements Runnable {

private final Counter counter;
private final int partyId;
private final CyclicBarrier barrier;

public OddEvenRunnable(int partyId, Counter counter, CyclicBarrier barrier) {
  this.partyId = partyId;
  this.counter = counter;
  this.barrier = barrier;
}

public void run() {
  try {
    System.out.println(Thread.currentThread().getName() + ": Waiting for GREEN signal from main guy...");
    barrier.await();
  } catch (Exception e) {
    e.printStackTrace();
  }
  while (true) {
    synchronized (counter) {
      while (!(counter.isMyTurn(partyId) || counter.isMaxValueReached())) {
        try {
          counter.wait();
        } catch (InterruptedException e) {
          System.out.println(partyId + ": Got Interrupted. Continuing for my turn...");
        }
      }
      if (counter.isMaxValueReached()) {
        // make sure other-threads don't keep waiting for my signal when I'm
        // leaving
        counter.notifyAll();
        break;
      }
      int value = counter.increment();
      System.out.println(Thread.currentThread().getName() + ": Counter Value=" + value);
      try {
        Thread.sleep(500);
      } catch (InterruptedException e) {
        // ignored
      }
      counter.notifyAll();
    }
  }

  System.out.println(Thread.currentThread().getName() + ": DONE!!");
}

}
~~~

Here's the Main class that drives the app.

~~~
/**
 * Jan 28, 2009
 * @author abhi.sanoujam
 */
package sample;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;

public class Main {

  private final int numParties;
  
  // @Root
  private final Counter counter;
  // @Root
  private final Set<String> runners = new HashSet<String>();
  // @Root
  private final CyclicBarrier barrier;
  private final Thread[] parties;

  public Main(int numParties, int maxCounterValue) {
    this.numParties = numParties;
    counter = new Counter(numParties, maxCounterValue);
    barrier = new CyclicBarrier(numParties + 1);
    parties = new Thread[numParties];

    for (int i = 0; i < numParties; i++) {
      parties[i] = new Thread(new OddEvenRunnable(i, counter, barrier), getThreadName(i));
    }
  }

  private void runInSingleJvm() throws BrokenBarrierException, InterruptedException {
    // start all the counting parties
    for (int i = 0; i < numParties; i++) {
      parties[i].start();
    }
    startCounting();
  }

  private void startCounting() throws InterruptedException, BrokenBarrierException {
    System.out.println(Thread.currentThread().getName() + ": Sleeping for 1 secs....");
    Thread.sleep(1000);
    System.out.println(Thread.currentThread().getName() + ": ... And letting all the counting threads go!!");
    // let thy parties proceed
    barrier.await();
  }

  private String getThreadName(int partyNum) {
    String prefix = "";
    for (int i = 0; i < partyNum; i++) {
      prefix += "  ";
    }
    return prefix + "Party-" + partyNum;
  }

  public static void main(String[] args) throws Exception {
    Main main = new Main(2, 30);
    if (args.length == 0) {
      // run in a single node/jvm
      main.runInSingleJvm();
    } else {
      if (args.length != 1) {
        printUsageAndExit();
      }
      if ("odd".equals(args[0])) {
        main.startFirstThread();
      } else if ("even".equals(args[0])) {
        main.startSecondThread();
      } else if ("main".equals(args[0])) {
        main.startMainThread();
      } else if ("reset".equals(args[0])) {
        main.reset();
      } else
        printUsageAndExit();
    }

  }

  private void reset() {
    for (int i = 0; i < numParties; i++) {
      parties[i] = new Thread(new OddEvenRunnable(i, counter, barrier), getThreadName(i));
    }
    synchronized (runners) {
      this.runners.clear();
      counter.setValue(0);
    }
    System.out.println("Reset Done.");
  }

  private void startMainThread() throws Exception {
    if (runners.size() != 2) {
      System.out.println("Make sure that you have started both the odd and even threads.");
      printUsageAndExit();
    }
    synchronized (runners) {
      runners.add("main");
    }
    startCounting();
  }

  private void startSecondThread() {
    if (runners.contains("even")) {
      System.out.println("You have already started the even-printing thread.");
      printUsageAndExit();
    }
    synchronized (runners) {
      runners.add("even");
    }
    parties[1].start();
    System.out.println("Started even thread");
  }

  private void startFirstThread() {
    if (runners.contains("odd")) {
      System.out.println("You have already started the odd-printing thread.");
      printUsageAndExit();
    }
    synchronized (runners) {
      runners.add("odd");
    }
    parties[0].start();
    System.out.println("Started odd thread");
  }

  private static void printUsageAndExit() {
    System.out.println("USAGE: java Main [odd | even | main | reset]");
    System.out.println("   No-arguments - Starts 2 threads printing odd and even values in single jvm.");
    System.out.println("   odd - starts the odd-number printing thread in this node.");
    System.out.println("   even - starts the even-number printing thread in this node.");
    System.out.println("   main - starts a thread which lets the odd and even threads go ahead.");
    System.out.println("   reset - Resets all states so you can start all over again.");
    System.exit(1);
  }

}
~~~

When running in a single-node (without Terracotta), the only method of interest is runInSingleJvm().

You can check-out the code, a maven project, from <a 
href="http://abhi-sanoujam-blogspot-posts.googlecode.com/svn/trunk/terracotta-in-action/">http://abhi-sanoujam-blogspot-
posts.googlecode.com/svn/trunk/terracotta-in-action/</a>
using "svn checkout http://abhi-sanoujam-blogspot-posts.googlecode.com/svn/trunk/terracotta-in-action/ "

You can run in a single node like:

<pre class="console">

$ mvn exec:java -Dexec.mainClass=sample.Main

</pre>

Or you can even use regular java for doing it:

<pre class="console">

$ mvn compile
$ java -cp target/classes/ sample.Main

</pre>

You should be seeing some output like:

<pre class="console">

sample.Main.main(): Sleeping for 1 secs....
Party-0: Waiting for GREEN signal from main guy...
  Party-1: Waiting for GREEN signal from main guy...
sample.Main.main(): ... And letting all the counting threads go!!
Party-0: Counter Value=1
  Party-1: Counter Value=2
Party-0: Counter Value=3
  Party-1: Counter Value=4
Party-0: Counter Value=5
  Party-1: Counter Value=6
Party-0: Counter Value=7
  Party-1: Counter Value=8
Party-0: Counter Value=9
  Party-1: Counter Value=10
Party-0: Counter Value=11
  Party-1: Counter Value=12
Party-0: Counter Value=13
  Party-1: Counter Value=14
Party-0: Counter Value=15
  Party-1: Counter Value=16
Party-0: Counter Value=17
  Party-1: Counter Value=18
Party-0: Counter Value=19
  Party-1: Counter Value=20
Party-0: Counter Value=21
  Party-1: Counter Value=22
Party-0: Counter Value=23
  Party-1: Counter Value=24
Party-0: Counter Value=25
  Party-1: Counter Value=26
Party-0: Counter Value=27
  Party-1: Counter Value=28
Party-0: Counter Value=29
  Party-1: Counter Value=30
Party-0: DONE!!
  Party-1: DONE!!

</pre>

We create two threads and the two threads wait on a barrier. The main thread when calls "startCounting()" method, makes 
the two waiting threads proceed.
You can see that the two threads are running sequentially, one by one. Each thread printing the next value on the 
counter, one thread prints odd numbers and the other thread prints even numbers.

Nice and cool. For testing, we can even change the number of parties when calling the Main constructor by passing in 
the required number of parties. E.g. if we pass in 5, then there will be 5 threads and each thread will print the 
counter sequentially, the threads executing one after another.

Now here comes the wow-after-cool part :)
With Terracotta, you can make the threads run on different jvm's and the threads will co-ordinate with each other -- 
while running in different JVM's. [Imagine 
doing Object.wait() on one jvm and another thread Object.notify()'ing from another thread]
({% post_url 2008-10-02-Definitely-Terracotta %})... 

OK, lets have a look at the tc-config.xml for this..., oh by the way, if you are new to Terracotta, you don't need any 
code-level change to make it work cross-jvm, you just plug in a tc-config and start up with terracotta.

Lets have a look at the tc-config for this app:

<pre name="code" class="xml:collapse">

&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;tc:tc-config
 xmlns:tc="http://www.terracotta.org/config"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xsi:schemaLocation="http://www.terracotta.org/config http://www.terracotta.org/schema/terracotta-4.xsd"&gt;
 &lt;servers&gt;
  &lt;server
   name="localhost"
   host="localhost"&gt;
   &lt;dso-port&gt;9510&lt;/dso-port&gt;
   &lt;jmx-port&gt;9520&lt;/jmx-port&gt;
   &lt;data&gt;target/terracotta/server/data&lt;/data&gt;
   &lt;logs&gt;target/terracotta/server/logs&lt;/logs&gt;
   &lt;statistics&gt;target/terracotta/server/statistics&lt;/statistics&gt;
  &lt;/server&gt;
 &lt;/servers&gt;
 &lt;clients&gt;
  &lt;logs&gt;target/terracotta/clients/logs/%(tc.nodeName)%D&lt;/logs&gt;
     &lt;statistics&gt;target/terracotta/clients/statistics/%(tc.nodeName)%D&lt;/statistics&gt;
  &lt;/clients&gt;

  &lt;application&gt;
    &lt;dso&gt;
     &lt;roots&gt;
      &lt;root&gt;
       &lt;field-name&gt;sample.Main.counter&lt;/field-name&gt;
      &lt;/root&gt;
      &lt;root&gt;
       &lt;field-name&gt;sample.Main.runners&lt;/field-name&gt;
      &lt;/root&gt;
      &lt;root&gt;
       &lt;field-name&gt;sample.Main.barrier&lt;/field-name&gt;
      &lt;/root&gt;
     &lt;/roots&gt;
     &lt;locks&gt;
      &lt;autolock&gt;
       &lt;lock-level&gt;write&lt;/lock-level&gt;
       &lt;method-expression&gt;* sample.Main.reset()&lt;/method-expression&gt;
      &lt;/autolock&gt;
      &lt;autolock&gt;
       &lt;lock-level&gt;write&lt;/lock-level&gt;
       &lt;method-expression&gt;* sample.Main.start*()&lt;/method-expression&gt;
      &lt;/autolock&gt;
      &lt;autolock&gt;
       &lt;lock-level&gt;write&lt;/lock-level&gt;
       &lt;method-expression&gt;* sample.OddEvenRunnable.run()&lt;/method-expression&gt;
      &lt;/autolock&gt;
      &lt;autolock&gt;
       &lt;lock-level&gt;write&lt;/lock-level&gt;
       &lt;method-expression&gt;* sample.Counter.increment()&lt;/method-expression&gt;
      &lt;/autolock&gt;
      &lt;autolock&gt;
       &lt;lock-level&gt;write&lt;/lock-level&gt;
       &lt;method-expression&gt;* sample.Counter.setValue()&lt;/method-expression&gt;
      &lt;/autolock&gt;
      &lt;autolock&gt;
       &lt;lock-level&gt;read&lt;/lock-level&gt;
       &lt;method-expression&gt;* sample.Counter.isMaxValueReached()&lt;/method-expression&gt;
      &lt;/autolock&gt;
      &lt;autolock&gt;
       &lt;lock-level&gt;read&lt;/lock-level&gt;
       &lt;method-expression&gt;* sample.Counter.getValue()&lt;/method-expression&gt;
      &lt;/autolock&gt;
      &lt;autolock&gt;
       &lt;lock-level&gt;read&lt;/lock-level&gt;
       &lt;method-expression&gt;* sample.Counter.isMyTurn()&lt;/method-expression&gt;
      &lt;/autolock&gt;
     &lt;/locks&gt;
     &lt;instrumented-classes&gt;
      &lt;include&gt;
       &lt;class-expression&gt;sample.Counter&lt;/class-expression&gt;
      &lt;/include&gt;
      &lt;include&gt;
       &lt;class-expression&gt;sample.OddEvenRunnable&lt;/class-expression&gt;
      &lt;/include&gt;
     &lt;/instrumented-classes&gt;
    &lt;/dso&gt;
  &lt;/application&gt;
&lt;/tc:tc-config&gt;

</pre>


You define roots and provide auto-locking for your methods in which you are synchronizing. You should probably go <a 
href="http://terracotta.org/web/display/docs/Concept+and+Architecture+Guide">here</a> if you want to read more.

Roots are basically objects that get shared across the cluster. You can note that the <tt>counter</tt> object is a 
root, thats how the threads in different nodes are going to get the updated value in each node.

For demo purpose, I've written the Main class to take arguments to start up in a parametrized way across the cluster, 
so that you can start the threads individually across different nodes.

Here's the script that I'm using to run with Terracotta (runWithTc.sh). (Again, you can find the whole project <a 
href="http://abhi-sanoujam-blogspot-posts.googlecode.com/svn/trunk/terracotta-in-action/">here</a>)

<pre name="code" class="bash:collapse">
#!/bin/bash

TC_INSTALL_DIR=/Users/asingh/terracottaKit/terracotta-2.7.1

mvn compile

CP_FILE=cp.txt
mvn dependency:build-classpath -Dmdep.outputFile=$CP_FILE
echo ":./target/classes"  >> $CP_FILE

$TC_INSTALL_DIR/bin/dso-java.sh -cp `cat $CP_FILE` sample.Main $*

if [[ -f $CP_FILE ]]
then
 rm $CP_FILE
fi
</pre>

Change <tt>TC_INSTALL_DIR</tt> with the path where you have installed Terracotta.

First, you need to start the Terracotta-server. Go to $TC_INSTALL_DIR/bin and type

<pre class="console">

./start-tc-server.sh

</pre>

This should start the Terracotta server in localhost (note that we have referred to 'localhost' in the server-section 
in tc-config.xml. You can always run this in multiple machines too if you so desire).

To start the Odd printing thread, run it like:

<pre class="console">

$ ./runWithTc.sh odd

</pre>

You should see an output something like:

<pre class="console">
Started odd thread
Party-0: Waiting for GREEN signal from main guy...
</pre>

Now on another terminal/console, start the Even-printing thread like:

<pre class="console">

$ ./runWithTc.sh even

</pre>

Again, you should see some output like:

<pre class="console">
Started even thread
  Party-1: Waiting for GREEN signal from main guy...
</pre>

Now you have 2 different threads started in different jvm's and both the threads are waiting on the shared barrier.
Lets start the main thread which will make the threads go ahead. Open another terminal/console and type in the 
following:

<pre class="console">

$ ./runWithTc.sh main

</pre>

You should be seeing an output like this:

<pre class="console">
main: Sleeping for 1 secs....
main: ... And letting all the counting threads go!!
</pre>

Now, at this point you can see that the other two threads in the other jvm's have started to run. The output in the 
console's should be like this:

<pre class="console">
Started odd thread
Party-0: Waiting for GREEN signal from main guy...
Party-0: Counter Value=1
Party-0: Counter Value=3
Party-0: Counter Value=5
Party-0: Counter Value=7
Party-0: Counter Value=9
Party-0: Counter Value=11
Party-0: Counter Value=13
Party-0: Counter Value=15
Party-0: Counter Value=17
Party-0: Counter Value=19
Party-0: Counter Value=21
Party-0: Counter Value=23
Party-0: Counter Value=25
Party-0: Counter Value=27
Party-0: Counter Value=29
Party-0: DONE!!
</pre>

And for the even-printing node,

<pre class="console">
Started even thread
  Party-1: Waiting for GREEN signal from main guy...
  Party-1: Counter Value=2
  Party-1: Counter Value=4
  Party-1: Counter Value=6
  Party-1: Counter Value=8
  Party-1: Counter Value=10
  Party-1: Counter Value=12
  Party-1: Counter Value=14
  Party-1: Counter Value=16
  Party-1: Counter Value=18
  Party-1: Counter Value=20
  Party-1: Counter Value=22
  Party-1: Counter Value=24
  Party-1: Counter Value=26
  Party-1: Counter Value=28
  Party-1: Counter Value=30
  Party-1: DONE!!
</pre>

You can see that the two-threads are co-ordinating across jvm boundaries.

Apart from the thread-coordination, this app contains the data-sharing across nodes also. 
In the tc-config, you can see that we have another root called <tt>runners</tt>. This is a <tt>Set&lt;String&gt;</tt> 
which just remembers which threads have been started.
If you run <tt>runWithTc.sh odd</tt> multiple times in multiple consoles, it won't let you start multiple odd-printing 
threads. It remembers this fact by just putting "odd" in the <tt>runners</tt> which gets shared across the nodes.


Hope you have a great time playing around ... and enjoy clustering your app with Terracotta :)

P.S. Someday soon, I'm gonna really post something to change things like &lt; to &amp;lt ...
