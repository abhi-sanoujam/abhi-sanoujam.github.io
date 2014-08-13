---           
layout: post
title: CyclicBarrier on multiple VM's
date: 2010-02-17 21:09:20 UTC
updated: 2010-02-17 21:09:20 UTC
comments: false
tags: java concurrency 
---
 
Well, if you don't know what CyclicBarrier is, its probably best for you to skip this post and do something else :) ...

Just kidding... but if you really don't know what CyclicBarrier is, you should go read <a 
href="http://java.sun.com/j2se/1.5.0/docs/api/java/util/concurrent/CyclicBarrier.html">this</a>, spend some time 
googling and come back, its a useful class in case you are writing concurrent-multi-threaded programs in java.

One popular use-case of a CyclicBarrier is in computing tasks which can be broken down into independent sub-tasks. You 
create a bunch of threads and let each thread compute the result of the sub-tasks, wait for all threads to complete and 
combine the results from each thread/sub-task to get the final result.

All of this sounds cool. Now when you want to scale out, i.e. add more VM's/boxes/machines to get more throughput, it 
sounds kind of difficult.... how to distribute the sub-tasks, how to wait for all of the threads to complete their 
sub-tasks in different vm's/nodes etc.
If you've heard about Terracotta or used it before, you'd say its not really tough... u can drop in tc-config, add 
roots, make CyclicBarrier roots, start with dso-java etc.... 
For those who don't know terracotta, its kind of intimidating thinking of learning terracotta concept -- the roots, 
tc-config, bootjar and stuff.

Now with the latest Terracotta release that's coming up... its really easy. The new release supports a clustered 
Barrier, which is similar with CyclicBarrier ... and clustered on top of that. Which means you can have threads wait 
for each other on different vm's/nodes etc. And all you need to do is drop a jar and an API call to create the barrier.

To demonstrate it, here's a sample app and how to run it...
The app uses ehcache clustered with terracotta to share the results from each node. Creating clustered ehcache with 
terracotta is also dead easy.. its done programmatically here in the app, but you can also do it easily using 
ehcache.xml

Download the latest Terracotta kit (or build it from source) and start tc server
 
<pre name="code" class="console">

$ cd $TC_INSTALL_DIR/bin
$ ./start-tc-server.sh

</pre>

Download the source + libs of the sample app from <a 
href="http://abhi-sanoujam-blogspot-posts.googlecode.com/svn/trunk/ClusteredCyclicBarrier/">here</a>. 
Open up 3 terminals (the program is hardcoded to expect 3 nodes), and in each terminal, do the following:

<pre name="code" class="console">

$ cd ClusteredCyclicBarrier
$ ant run

</pre> 

You should see some kind of output like this:

<pre name="code" class="console">

$ ant run
Buildfile: build.xml

init:

clean:

compile:
    [javac] Compiling 1 source file to /Users/asingh/workspace/projects/ClusteredCyclicBarrier/target/classes

run:
     [java] 2010-02-18 01:59:42,355 INFO - Terracotta 3.3.0-SNAPSHOT, as of 20100217-120224 (Revision 14573 by 
asingh@paladin.local from trunk)
     [java] 2010-02-18 01:59:42,871 INFO - Configuration loaded from the server at 'localhost:9510'.
     [java] 2010-02-18 01:59:42,960 INFO - Configuration loaded from the file at 
'/var/folders/3R/3Rx0og6cF-KjD-C7zWtiD++++TM/-Tmp-/tc-config5414381556581263394.xml'.
     [java] 
     [java] WARN: The log directory, '/Users/asingh/terracotta/client-logs', is already in use by another Terracotta 
process. Logging will proceed to the console only.
     [java] 
     [java] 2010-02-18 01:59:44,464 INFO - Connection successfully established to server at 10.0.0.3:9510
     [java] 2010-02-18 01:59:45,801 INFO - Terracotta 3.3.0-SNAPSHOT, as of 20100217-120224 (Revision 14573 by 
asingh@paladin.local from trunk)
     [java] 2010-02-18 01:59:46,365 INFO - Configuration loaded from the server at 'localhost:9510'.
     [java] 2010-02-18 01:59:46,484 INFO - Configuration loaded from the file at 
'/var/folders/3R/3Rx0og6cF-KjD-C7zWtiD++++TM/-Tmp-/tc-config7095574028684913201.xml'.
     [java] 
     [java] WARN: The log directory, '/Users/asingh/terracotta/client-logs', is already in use by another Terracotta 
process. Logging will proceed to the console only.
     [java] 
     [java] 2010-02-18 01:59:48,787 INFO - Connection successfully established to server at 10.0.0.3:9510
     [java] Waiting for all nodes to arrive (3 total nodes) ...
     [java] This is node-1
     [java] Worker-1 is working (may take 10 to 20 secs)... 
     [java] ==================================
     [java] Worker-1: Computed value: "1:is"
     [java] ==================================
     [java] All workers done! Combining result of all workers (might take some time)...
     [java] Final result, after combining results of all workers... 
     [java] ==================================
     [java] this is awesome! 
     [java] ==================================
$
</pre>

So what happened is that each of the node is computing a value (here just adding one word from "this is awesome!") to 
the clustered cache. And after waiting for all nodes using the <bold>clustered</bold> CyclicBarrier, it just builds up 
the final result "this is awesome!"... and indeed its awesome :)


Here's the source of the app:

<pre name="code" class="java:collapse">
package demo.cyclicbarrier;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

import net.sf.ehcache.Cache;
import net.sf.ehcache.CacheManager;
import net.sf.ehcache.Element;
import net.sf.ehcache.config.CacheConfiguration;
import net.sf.ehcache.config.Configuration;
import net.sf.ehcache.config.TerracottaConfigConfiguration;
import net.sf.ehcache.config.TerracottaConfiguration;

import org.terracotta.express.util.Barrier;
import org.terracotta.express.util.ExpressTerracottaClusteredInstanceFactory;

public class CyclicBarrierDemo {
  private static final Random   RANDOM        = new Random(System.currentTimeMillis());
  private static final String[] words         = new String[] { "this", "is", "awesome!" };
  private static final String   TC_CONFIG_URL = "localhost:9510";

  // u need to start 3 nodes for this
  public static void main(String[] args) throws Exception {
    CyclicBarrierDemo main = new CyclicBarrierDemo();
    main.execute();
  }

  private void execute() throws Exception {
    Barrier barrier = new ExpressTerracottaClusteredInstanceFactory(TC_CONFIG_URL)
        .createClusteredBarrierAsRoot("clusteredBarrier", words.length);

    CacheManager cacheManager = createCacheManagerWithTerracotta(TC_CONFIG_URL, "demoCacheManager");
    Cache resultCache = createAndAddTerracottaCache(cacheManager, "resultCache");

    System.out.println("Waiting for all nodes to arrive (" + words.length + " total nodes) ...");
    // this is a clustered barrier
    int index = barrier.barrier();
    System.out.println("This is node-" + index);
    // do a computation on each node
    compute(resultCache, index);

    barrier.barrier();
    System.out.println("All workers done! Combining result of all workers (might take some time)...");
    // imitating long computation
    doSleep(10);

    List&lt;Value&gt; result = new ArrayList&lt;Value&gt;();
    // all the nodes share the result in the clustered cache
    for (Object keyObj : resultCache.getKeys()) {
      String key = (String) keyObj;
      Value v = (Value) resultCache.get(key).getValue();
      result.add(v);
    }
    Collections.sort(result);
    System.out.println("Final result, after combining results of all workers... ");
    System.out.println("==================================");
    for (Value value : result) {
      System.out.print(value.word + " ");
    }
    System.out.println("\n==================================");
  }

  private Cache createAndAddTerracottaCache(CacheManager cacheManager, String cacheName) {
    CacheConfiguration cacheConfig = new CacheConfiguration(cacheName, 1000).eternal(true);
    // add terracotta clustered to cache config
    cacheConfig.addTerracotta(new TerracottaConfiguration().clustered(true).coherent(true));
    // add cache to cache-manager
    cacheManager.addCache(new Cache(cacheConfig));
    Cache resultCache = cacheManager.getCache(cacheName);
    return resultCache;
  }

  private CacheManager createCacheManagerWithTerracotta(String tcConfigUrl, String cacheManagerName) {
    Configuration cacheManagerConfig = new Configuration();
    cacheManagerConfig.setDefaultCacheConfiguration(new CacheConfiguration("default", 1000));
    cacheManagerConfig.setName(cacheManagerName);
    TerracottaConfigConfiguration tcConfigConfiguration = new TerracottaConfigConfiguration();
    tcConfigConfiguration.setUrl(tcConfigUrl);
    cacheManagerConfig.addTerracottaConfig(tcConfigConfiguration);
    CacheManager cacheManager = new CacheManager(cacheManagerConfig);
    return cacheManager;
  }

  private void compute(Cache resultCache, int index) {
    System.out.println("Worker-" + index + " is working (may take 10 to 20 secs)... ");
    // imitate long computation...
    doSleep(RANDOM.nextInt(11) + 10);
    Value value = new Value(index, words[index]);
    resultCache.put(new Element("key" + index, value));
    System.out.println("==================================");
    System.out.println("Worker-" + index + ": Computed value: \"" + value + "\"");
    System.out.println("==================================");
  }

  private void doSleep(int secs) {
    try {
      Thread.sleep(secs * 1000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }

  private static class Value implements Serializable, Comparable&lt;Value&gt; {

    private final int    index;
    private final String word;

    public Value(int index, String string) {
      this.index = index;
      this.word = string;
    }

    public String toString() {
      return index + ":" + word;
    }

    public int compareTo(Value o) {
      return this.index - o.index;
    }

  }

}

</pre>

The below snippet is of main interest:


<pre name="code" class="java:collapse">
Barrier barrier = new ExpressTerracottaClusteredInstanceFactory(TC_CONFIG_URL)
        .createClusteredBarrierAsRoot("clusteredBarrier", words.length);

    CacheManager cacheManager = createCacheManagerWithTerracotta(TC_CONFIG_URL, "demoCacheManager");
    Cache resultCache = createAndAddTerracottaCache(cacheManager, "resultCache")
</pre>

<code>new ExpressTerracottaClusteredInstanceFactory(TC_CONFIG_URL)</code> creates clustered instance factory which you 
can use to create clustered cyclic barriers. TC_CONFIG_URL is hardcoded to "localhost:9510" for this demo, you can 
replace this with where you are running your terracotta server.
<code>createClusteredBarrierAsRoot("clusteredBarrier", words.length);</code> creates a clustered-cyclic-barrier using 
the name "clusteredBarrier". So if you create multiple barriers using the same name, its same as sharing the 
cyclic-barrier cluster-wide. The second argument <tt>words.length</tt> is the number of parties that you want to wait 
for in each of the nodes, hardcoded to 3 for this demo.
Calling barrier.barrier() will not return until the expected number of parties (read threads) have called it. It does 
not matter whether you are calling from the same JVM or not.... and thats really cool.
The next two lines is also an example of how to create Terracotta clustered ehcache cacheManagers and caches. You can 
take a look at the functions <tt>createCacheManagerWithTerracotta</tt> and <tt>createAndAddTerracottaCache</tt> to see 
how its done.

To run the app, u'll need the following jars:
<ul>
<li>ehcache-core-&lt;version&gt;.jar : ehcache jar file</li>
<li>slf4j-api-1.5.8.jar : needed for ehcache-core</li>
<li>slf4j-jdk14-1.5.8.jar : needed for ehcache-core, u can choose other slf4j impls</li>
<li>ehcache-terracotta-&lt;version&gt;.jar : needed for using terracotta clustered ehcache</li>
<li>express-util-&lt;version&gt;.jar : Needed for Barrier interface</li>
<li>express-util-terracotta-&lt;version&gt;.jar : Needed for the ExpressTerracottaClusteredInstanceFactory</li>
</ul>

<tt>express-util-&lt;version&gt;.jar</tt> and <tt>express-util-terracotta-&lt;version&gt;.jar</tt> are the new jars 
that you need to use the clustered CyclicBarrier.

Try downloading the sample and running it to get a feel of the real "awesomeness" :)
Have fun...
By the way, we also use this extensively in our system-tests where we need synchronization between different test 
threads... threads waiting for each other to complete some operations before asserting things. Its cool and 
"awesome"!
