---           
layout: post
title: Unique maven surefire plugin configurations for individual tests
date: 2009-11-06 13:06:39 UTC
updated: 2009-11-06 13:06:39 UTC
categories: java
tags: java maven integration-test system-test test
---
 
<script type="text/javascript">var dzone_style = '1';var dzone_url = 
'http://abhisanoujam.blogspot.com/2009/11/unique-maven-surefire-plugin.html';</script> <script language="javascript" 
src="http://widgets.dzone.com/widgets/zoneit.js"></script>


Here's what I want to do:

I have a maven project, which has got multiple unit-tests, db-tests (e.g. DAO tests) and integration/system tests. One 
of the unit tests require high memory (e.g. 512 MB), but other unit tests runs fine with the default heap size (and 
doesn't need large heap).
I want to run all unit tests by default in the test phase of the build cycle, run the db-tests only when I know a db is 
present and run the system tests in the integration phase of the build cycle.

Lets assume some names for the tests:

1) Names of all unit tests end with Test.java, e.g. ClientTest.java, SomeLogicTest.java etc
2) The name of the unit test that require high-memory is TestTheWorldWithBigMemoryTest.java. Note that this is not a 
system tests, its a unit test and just that it requires large heap to run.
3) All db-tests end with DaoTest.java, e.g. UserDaoTest.java, CatalogDaoTest.java etc
4) All system/integration tests end with SystemTest.java, e.g. AddToShoppingCartSystemTest.java, 
PurchaseSystemTest.java etc

OK, so here's how to configure your pom to do it:

<pre name="code" class="xml:collapse">

&lt;project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd"&gt;
  &lt;modelVersion&gt;4.0.0&lt;/modelVersion&gt;
  &lt;groupId&gt;example&lt;/groupId&gt;
  &lt;artifactId&gt;MySampleProject&lt;/artifactId&gt;
  &lt;packaging&gt;jar&lt;/packaging&gt;
  &lt;version&gt;0.0.1-SNAPSHOT&lt;/version&gt;
  &lt;name&gt;MySampleProject&lt;/name&gt;
  &lt;url&gt;http://www.abhisanoujam.blogspot.com/&lt;/url&gt;
  &lt;dependencies&gt;
    &lt;dependency&gt;
      &lt;groupId&gt;junit&lt;/groupId&gt;
      &lt;artifactId&gt;junit&lt;/artifactId&gt;
      &lt;version&gt;3.8.1&lt;/version&gt;
      &lt;scope&gt;test&lt;/scope&gt;
    &lt;/dependency&gt;
  &lt;/dependencies&gt;

  &lt;build&gt;
    &lt;plugins&gt;

      &lt;plugin&gt;
        &lt;groupId&gt;org.apache.maven.plugins&lt;/groupId&gt;
        &lt;artifactId&gt;maven-surefire-plugin&lt;/artifactId&gt;
        &lt;inherited&gt;true&lt;/inherited&gt;
        &lt;configuration&gt;
          &lt;!--
            Skip tests by default. Will be using different executions
            setup to run different set of tests with different
            configurations
          --&gt;
          &lt;skip&gt;true&lt;/skip&gt;
          &lt;!-- other default configuration for all the tests, just an example --&gt;
          &lt;reportFormat&gt;plain&lt;/reportFormat&gt;
          &lt;systemProperties&gt;
            &lt;property&gt;
              &lt;name&gt;some.property.used.by.tests&lt;/name&gt;
              &lt;value&gt;what.you.want.value&lt;/value&gt;
            &lt;/property&gt;
          &lt;/systemProperties&gt;
        &lt;/configuration&gt;
        &lt;executions&gt;
          &lt;execution&gt;
            &lt;!-- run all tests except for system tests and the big memory test --&gt;
            &lt;id&gt;test-phase-execution&lt;/id&gt;
            &lt;phase&gt;test&lt;/phase&gt;
            &lt;goals&gt;
              &lt;goal&gt;test&lt;/goal&gt;
            &lt;/goals&gt;
            &lt;configuration&gt;
              &lt;skip&gt;false&lt;/skip&gt;
              &lt;includes&gt;
                &lt;include&gt;**/*Test.java&lt;/include&gt;
              &lt;/includes&gt;
              &lt;excludes&gt;
                &lt;!-- exclude inner classes --&gt;
                &lt;exclude&gt;**/*$*&lt;/exclude&gt;
                &lt;!-- exclude the test that need large heap --&gt;
                &lt;exclude&gt;**/TestTheWorldWithBigMemoryTest.java&lt;/exclude&gt;
                &lt;!-- exclude the system-tests --&gt;
                &lt;exclude&gt;**/*SystemTest.java&lt;/exclude&gt;
                &lt;!-- exclude the db-tests --&gt;
                &lt;exclude&gt;**/*DaoTest.java&lt;/exclude&gt;
              &lt;/excludes&gt;
            &lt;/configuration&gt;
          &lt;/execution&gt;
          &lt;execution&gt;
            &lt;!-- Run tests with 512 MB heap --&gt;
            &lt;id&gt;large-heap-test-execution&lt;/id&gt;
            &lt;phase&gt;test&lt;/phase&gt;
            &lt;goals&gt;
              &lt;goal&gt;test&lt;/goal&gt;
            &lt;/goals&gt;
            &lt;configuration&gt;
              &lt;skip&gt;false&lt;/skip&gt;
              &lt;includes&gt;
                &lt;!--
                  You can even follow some pattern for these kind of
                  tests and use the pattern here
                --&gt;
                &lt;!-- For example, **/*BigMemoryTest.java --&gt;
                &lt;include&gt;**/TestTheWorldWithBigMemoryTest.java&lt;/include&gt;
              &lt;/includes&gt;
              &lt;excludes&gt;
                &lt;exclude&gt;**/*$*&lt;/exclude&gt;
              &lt;/excludes&gt;
              &lt;argLine&gt;-Xms512m -Xmx512m&lt;/argLine&gt;
            &lt;/configuration&gt;
          &lt;/execution&gt;
          &lt;execution&gt;
            &lt;!-- Run the system tests in the integration-phase --&gt;
            &lt;id&gt;system-tests-execution&lt;/id&gt;
            &lt;phase&gt;integration-test&lt;/phase&gt;
            &lt;goals&gt;
              &lt;goal&gt;test&lt;/goal&gt;
            &lt;/goals&gt;
            &lt;configuration&gt;
              &lt;skip&gt;false&lt;/skip&gt;
              &lt;includes&gt;
                &lt;include&gt;**/*SystemTest.java&lt;/include&gt;
              &lt;/includes&gt;
              &lt;excludes&gt;
                &lt;exclude&gt;**/*$*&lt;/exclude&gt;
              &lt;/excludes&gt;
            &lt;/configuration&gt;
          &lt;/execution&gt;
        &lt;/executions&gt;
      &lt;/plugin&gt;
    &lt;/plugins&gt;
  &lt;/build&gt;

  &lt;profiles&gt;

    &lt;!-- Profile for running database tests  --&gt;
    &lt;profile&gt;
      &lt;id&gt;test-db&lt;/id&gt;
      &lt;build&gt;
        &lt;plugins&gt;
          &lt;plugin&gt;
            &lt;artifactId&gt;maven-surefire-plugin&lt;/artifactId&gt;
            &lt;groupId&gt;org.apache.maven.plugins&lt;/groupId&gt;
            &lt;configuration&gt;
              &lt;!--
                Skip tests as the other tests have been already executed
                in the "test" and "integration-test" phases
              --&gt;
              &lt;skip&gt;true&lt;/skip&gt;
            &lt;/configuration&gt;
            &lt;executions&gt;
              &lt;execution&gt;
                &lt;id&gt;db-test-execution&lt;/id&gt;
                &lt;phase&gt;test&lt;/phase&gt;
                &lt;goals&gt;
                  &lt;goal&gt;test&lt;/goal&gt;
                &lt;/goals&gt;
                &lt;configuration&gt;
                  &lt;skip&gt;false&lt;/skip&gt;
                  &lt;includes&gt;
                    &lt;!-- We only need to include the db tests here --&gt;
                    &lt;include&gt;**/*DaoTest.java&lt;/include&gt;
                  &lt;/includes&gt;
                &lt;/configuration&gt;
              &lt;/execution&gt;
            &lt;/executions&gt;
          &lt;/plugin&gt;
        &lt;/plugins&gt;
      &lt;/build&gt;
    &lt;/profile&gt;

  &lt;/profiles&gt;

&lt;/project&gt;


</pre>


I'll try to explain in words (not xml ;-) ) what I did above:
By default, maven runs the "test" goal of maven surefire plugin. First we tell it to skip tests by adding the plugin in 
the &lt;build&gt; section of the pom and specifying &lt;skip&gt;true&lt;/skip&gt; in the main configuration of the 
plugin. Here, you can specify other configurations that you want for your tests as a whole.
Then we specify other executions for the plugin and play around with the include/exclude pattern and the configurations 
for each setup. We can setup multiple executions and also have different set of configurations for each execution 
setup. Just as a note, adding multiple &lt;plugin&gt; sections for the same plugin in the build section does not work, 
in fact this is the sole reason of this blog post, and to figure out how to have different configurations depending on 
your requirements for the same plugin.
In the "test-phase-execution", we include all tests with the <tt>**/*Test</tt> and exclude the big memory test, dao 
tests and the system tests.
For the unit-test that requires large heap, its just a matter of adding <tt>&lt;argLine&gt;-Xms512m 
-Xmx512m&lt;/argLine&gt;</tt> in the configuration for that execution setup. Also we include only that test to run in 
the include tag.
We bind another execution in the "integration-test" phase to run the system tests by matching the include pattern to 
only system tests.

We add another profile "test-db", which we can use when we know we have a database is up and running (you don't want 
your dao tests to fail all the time during development when you don't have a DB running in your environment). In the 
profile, we again set up the maven-surefire plugin to execute only the dao tests by playing around with the 
include/exclude pattern. You can activate this profile whenever you want to run the dao tests.

You can check-out a very simple project from <a 
href="http://abhi-sanoujam-blogspot-posts.googlecode.com/svn/trunk/mavenTestsPomSetup">here</a> and see the above pom 
in action.

Here's how you would run them:

<pre class="console">

mvn clean package
 -- This will run all the unit-tests (including the big memory test) but not the system tests and the dao tests

mvn -Ptest-db clean package
 -- This will the all the unit tests (like above) and also run the dao tests. This still excludes the system test.

mvn clean install
 -- This will run all the unit tests + the system tests. This won't run the dao tests.
 
mvn -Ptest-db clean install
 -- This will run all the tests -- unit tests, big memory test, dao tests and the system tests
 
</pre>
 
Regarding the system/integration tests, instead of doing like above, you can separate all your system-tests in a 
separate sub-module too, which I guess is more appropriate when your project is kind of large.

Enjoy...<img src="http://feeds.feedburner.com/~r/abhisanoujam-blogspot/~4/qPcst1Og4Sc" height="1" width="1"/>
