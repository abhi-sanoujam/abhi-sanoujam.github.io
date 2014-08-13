---           
layout: post
title: Maven + hibernate + jpa + ehcache + spring + terracotta + composite keys
date: 2008-12-17 13:44:06 UTC
updated: 2008-12-17 13:44:06 UTC
comments: false
categories: java
tags: java maven hibernate jpa ehcache spring terracotta composite-keys
---
 
Some user were having some <a href="http://forums.terracotta.org/forums/posts/list/1579.page">problem</a> using 
composite keys with hibernate and ehcache as second level cache with Terracotta.

I tried beefing up a sample app with composite keys so that I can run the app with Terracotta...  and it worked out 
smoothly in a quite small amount of time.

I reused much of what we did for <a href="http://reference.terracotta.org/">Examinator</a>, and came up with the app 
without much pain in very small amount of time. Really, <a 
href="http://www.terracotta.org/web/display/orgsite/Web+App+Reference+Implementation">Examinator</a> (<a 
href="http://svn.terracotta.org/repo/forge/projects/exam/trunk/">source</a>) contains quite a lot of things that can be 
re-used to come up with with these kind of apps.

I'll try to put in the main parts of the sample app that I came up here:

Used maven-quickstart archetype to generate a quick project skeleton.

First the domain classes -- Its a Product class, which is uniquely identified by a combination of its productId and 
groupId. It also has a description property.

<pre name="code" class="java">
package sample.model;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.IdClass;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

@Entity
@IdClass(ProductCompositeKey.class)
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Product {

@Id
private Long productId;

@Id
private Long groupId;

@Column(name = "DESCRIPTION")
private String description;

//...getters and setters...

}

</pre>

We are using JPA annotations to define the entities. We annotate the Product class with the @Entity annotation, and as 
normally, annotate the productId and groupId properties with @Id.
We are using hibernate annotation @Cache(usage = CacheConcurrencyStrategy.READ_WRITE) to enable second-level caching on 
this entity.
The @IdClass annotation refers to a class which will be the composite-key class.
The ProductCompositeKey is this class and is as follows:

<pre name="code" class="java:expand">
package sample.model;

import java.io.Serializable;

import javax.persistence.Embeddable;

@Embeddable
public class ProductCompositeKey implements Serializable {

private Long productId;
private Long groupId;

//...getters and setters...

@Override
public int hashCode() {
final int prime = 31;
int result = 1;
result = prime * result + ((groupId == null) ? 0 : groupId.hashCode());
result = prime * result + ((productId == null) ? 0 : productId.hashCode());
return result;
}

@Override
public boolean equals(Object obj) {
if (this == obj)
return true;
if (obj == null)
return false;
if (getClass() != obj.getClass())
return false;
ProductCompositeKey other = (ProductCompositeKey) obj;
if (groupId == null) {
if (other.groupId != null)
return false;
} else if (!groupId.equals(other.groupId))
return false;
if (productId == null) {
if (other.productId != null)
return false;
} else if (!productId.equals(other.productId))
return false;
return true;
}

}

</pre>


The ProductCompositeKey class is annotated with the @Embeddable annotation. Note that it is not annotated with @Entity
We need to override equals() and hashcode() and also implement the Serializable interface to make hibernate happy.


Next we define DAO classes for the Product. Here's the ProductDao interface:

~~~ java
package sample.dao;

import java.util.List;

import sample.model.Product;

public interface ProductDao {

    public boolean delete(final Product product);
    
    public boolean deleteById(final Long id);
    
    public Product findById(final Long id);
    
    public Product findByName(final String productName);
    
    public List<product> getAllProducts();
    
    public long getNumberOfProducts();
    
    public Product saveOrUpdate(final Product product);
}

~~~

And the ProductDaoImpl class:


~~~ java

package sample.dao;

import java.util.List;

import org.apache.log4j.Logger;

import sample.model.Product;

public class ProductDaoImpl implements ProductDao {
  private static final Logger logger = Logger.getLogger(ProductDaoImpl.class);

  final DaoHelper     daoHelper;

  public ProductDaoImpl(final DaoHelper daoHelper) {
    if (null == daoHelper) throw new IllegalArgumentException("daoHelper can't be null");
    this.daoHelper = daoHelper;
  }

  public boolean delete(final Product product) {
    if (logger.isDebugEnabled()) logger.debug("delete: " + product.getId());
    
    return daoHelper.deleteById(Product.class, product.getId());
  }

  public boolean deleteById(final Long id) {
    if (logger.isDebugEnabled()) logger.debug("deleteById: " + id);

    return daoHelper.deleteById(Product.class, id);
  }

  public Product findById(final Long id) {
    if (logger.isDebugEnabled()) logger.debug("findById: " + id);

    return daoHelper.findById(Product.class, id);
  }

  public Product findByName(final String productName) {
    if (logger.isDebugEnabled()) logger.debug("findByName: " + productName);

    final List<Product> list = daoHelper.findByAttribute(Product.class, "name", productName);
    if (null == list || 0 == list.size()) return null;
    assert list.size() == 1;

    return list.get(0);
  }

  public List<Product> getAllProducts() {
    if (logger.isDebugEnabled()) logger.debug("getAllProducts");

    return daoHelper.getAllEntities(Product.class);
  }

  public long getNumberOfProducts() {
    if (logger.isDebugEnabled()) logger.debug("getNumberOfProducts");

    return daoHelper.countEntities(Product.class);
  }

  public Product saveOrUpdate(final Product product) {
    if (logger.isDebugEnabled()) logger.debug("saveOrUpdate: " + product);

    if (null == product) throw new IllegalArgumentException("product can't be null");
    if (product.getId() == null) {
      return daoHelper.save(Product.class, product);
    } else {
      return daoHelper.update(Product.class, product);
    }
  }

//  public PageData<Product> getProductsByPage(final PageRequest pageRequest) {
//    if (logger.isDebugEnabled()) logger.debug("getProductsByPage: pageRequest=" + pageRequest);
//    return daoHelper.getEntitiesByPage(Product.class, pageRequest, "isDeleted", Boolean.FALSE);
//  }
}

~~~

As you have seen, the ProductDaoImpl class delegates all its work to the DaoHelper class. The DaoHelper class is copied 
from the <a 
href="http://svn.terracotta.org/svn/forge/projects/exam/tags/release-1.0.0/src/main/java/org/terracotta/reference/exam/d
ao/impl/DaoHelper.java">Examinator project</a> (the api's related to paging are commented, as we don't need the paging 
api's here... hope to come up with a post for the paging soon).
The DaoHelper class is given here for reference:

~~~
package sample.dao;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

/**
 * The GenericDao is a helper class providing common data access functionality for use (via delegation) by Dao
 * implementations.
 */
public class DaoHelper {

  @PersistenceContext
  private EntityManager entityManager;

  /**
   * Defines ASC and DESC sort orders for queries.
   */
  public enum SortOrder {
    ASC, DESC
  }

  public DaoHelper() {
    // entityManager will be set via JSR250 injection
  }

  /**
   * Custom entity manager that will not automatically be injected.
   */
  public DaoHelper(final EntityManager entityManager) {
    this.entityManager = entityManager;
  }

  public <T> T findById(final Class<T> entityClass, final Object id) {
    if (null == entityClass) throw new IllegalArgumentException("entityClass can't be null");
    if (null == id) throw new IllegalArgumentException("id can't be null");

    return entityManager.find(entityClass, id);
  }

  public boolean delete(final Object entity) {
    if (null == entity) throw new IllegalArgumentException("entity can't be null");

    entityManager.remove(entity);
    return true;
  }

  public <T> boolean deleteById(final Class<T> entityClass, final Object id) {
    if (null == entityClass) throw new IllegalArgumentException("entityClass can't be null");
    if (null == id) throw new IllegalArgumentException("id can't be null");

    return delete(findById(entityClass, id));
  }

  public int deleteByAttribute(final Class entityClass, final String attributeName, final Object attributeValue) {
    if (null == entityClass) throw new IllegalArgumentException("entityClass can't be null");
    if (null == attributeName) throw new IllegalArgumentException("attributeName can't be null");
    if (null == attributeValue) throw new IllegalArgumentException("attributeValue can't be null");

    return entityManager.createQuery(
                                     "delete from " + entityClass.getSimpleName() + " e where e." + attributeName
                                         + " = ?1").setParameter(1, attributeValue).executeUpdate();
  }

  public <T> List<T> findByAttribute(final Class<T> entityClass, final String attributeName, final 
Object attributeValue) {
    if (null == entityClass) throw new IllegalArgumentException("entityClass can't be null");
    if (null == attributeName) throw new IllegalArgumentException("attributeName can't be null");
    if (null == attributeValue) throw new IllegalArgumentException("attributeValue can't be null");

    return entityManager.createQuery(
                                     "select e from " + entityClass.getSimpleName() + " e where e." + attributeName
                                         + " = ?1").setParameter(1, attributeValue).getResultList();
  }

  public <T> List<T> findByAttribute(final Class<T> entityClass, final String attributeName,
                                     final Object attributeValue, final String orderByAttributeName,
                                     final SortOrder sortOrder) {
    if (null == entityClass) throw new IllegalArgumentException("entityClass can't be null");
    if (null == attributeName) throw new IllegalArgumentException("attributeName can't be null");
    if (null == attributeValue) throw new IllegalArgumentException("attributeValue can't be null");
    if (null == orderByAttributeName) throw new IllegalArgumentException("orderByAttributeName can't be null");

    return entityManager.createQuery(
                                     "select e from " + entityClass.getSimpleName() + " e where e." + attributeName
                                         + " = ?1 ORDER BY e." + orderByAttributeName + " " + sortOrder.name())
        .setParameter(1, attributeValue).getResultList();
  }

  public <T> List<T> getAllEntities(final Class<T> entityClass) {
    if (null == entityClass) throw new IllegalArgumentException("entityClass can't be null");

    return entityManager.createQuery("select e from " + entityClass.getSimpleName() + " e").getResultList();
  }

  public <T> List<T> getAllEntities(final Class<T> entityClass, final String orderByAttributeName,
                                    final SortOrder sortOrder) {
    if (null == entityClass) throw new IllegalArgumentException("entityClass can't be null");
    if (null == orderByAttributeName) throw new IllegalArgumentException("orderByAttributeName can't be null");

    return entityManager.createQuery(
                                     "select e from " + entityClass.getSimpleName() + " e order by e."
                                         + orderByAttributeName + " " + sortOrder.name()).getResultList();
  }

  public <T> T save(final Class<T> entityClass, final T entity) {
    if (null == entityClass) throw new IllegalArgumentException("entityClass can't be null");
    if (null == entity) throw new IllegalArgumentException("entity can't be null");

    entityManager.persist(entity);
    return entity;
  }

  public <T> T update(final Class<T> entityClass, final T entity) {
    if (null == entityClass) throw new IllegalArgumentException("entityClass can't be null");
    if (null == entity) throw new IllegalArgumentException("entity can't be null");

    return entityManager.merge(entity);
  }

  public long countEntities(final Class entityClass) {
    if (null == entityClass) throw new IllegalArgumentException("entityClass can't be null");

    return (Long) entityManager.createQuery("select count(entity) from " + entityClass.getSimpleName() + " entity")
        .getSingleResult();
  }

  public long countEntitiesByAttribute(final Class entityClass, final String attributeName, final Object 
attributeValue) {
    if (null == entityClass) throw new IllegalArgumentException("entityClass can't be null");
    if (null == attributeName) throw new IllegalArgumentException("attributeName can't be null");
    if (null == attributeValue) throw new IllegalArgumentException("attributeValue can't be null");

    return (Long) entityManager.createQuery(
                                            "select count(e) from " + entityClass.getSimpleName() + " e where e."
                                                + attributeName + " = ?1").setParameter(1, attributeValue)
        .getSingleResult();
  }

  // public <T> PageData<T> getEntitiesByPage(final Class<T> entityClass, final
  // PageRequest pageRequest) {
  // return getEntitiesByPage(entityClass, pageRequest, null, null, "id",
  // SortOrder.ASC);
  // }
  //
  // public <T> PageData<T> getEntitiesByPage(final Class<T> entityClass, final
  // PageRequest pageRequest, final String attributeName,
  // final Object attributeValue) {
  // return getEntitiesByPage(entityClass, pageRequest, attributeName,
  // attributeValue, "id", SortOrder.ASC);
  // }
  //
  // public <T> PageData<T> getEntitiesByPage(final Class<T> entityClass, final
  // PageRequest pageRequest, final String attributeName,
  // final Object attributeValue, final String orderByAttributeName,
  // final SortOrder sortOrder) {
  // if (null == entityClass) throw new
  // IllegalArgumentException("entityClass can't be null");
  // if (null == pageRequest) throw new
  // IllegalArgumentException("pageRequest can't be null");
  // if (null == orderByAttributeName) throw new
  // IllegalArgumentException("orderByAttributeName can't be null");
  //
  // String queryStr = "";
  // if (attributeName != null) {
  // queryStr = "select e from " + entityClass.getSimpleName() + " e where e." +
  // attributeName + " = ?1 ORDER BY e."
  // + orderByAttributeName + " " + sortOrder.name();
  // } else {
  // queryStr = "select e from " + entityClass.getSimpleName() +
  // " e ORDER BY e." + orderByAttributeName + " "
  // + sortOrder.name();
  // }
  // long total;
  // if (attributeName != null) total = countEntitiesByAttribute(entityClass,
  // attributeName, attributeValue);
  // else total = countEntities(entityClass);
  //    
  // final PageRequest newPageRequest =
  // PageRequest.adjustPageRequest(pageRequest, total);
  //    
  // Query query;
  // if (attributeName != null) query =
  // entityManager.createQuery(queryStr).setParameter(1, attributeValue);
  // else query = entityManager.createQuery(queryStr);
  // final List<T> data = query.setFirstResult(newPageRequest.getStart() -
  // 1).setMaxResults(newPageRequest.getPageSize()).getResultList();
  // return new PageData<T>(newPageRequest, total, data);
  // }
}


~~~

This is the class that does the main work for talking with your DB through JPA. You can note that the class does 
not have any compile time dependency on Spring or any other external library except for JPA. So if you are going to 
work with JPA, this class will make you happy :).
If you are thinking about writing your own dao's, you can consider reusing this class, its cool.

Next, coming to the service classes, I'll add a ProductService class which can add/remove/list products (from the DB of 
course). Here's the interface:

~~~
package sample.service;

import java.util.List;

import sample.model.Product;

public interface ProductService {

public void addProduct(Product product);

public void deleteProduct(Product product);

public List<product> getAllProducts();
}
~~~

The ProductServiceImpl implements the above interface:

~~~
package sample.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sample.dao.ProductDao;
import sample.model.Product;

public class ProductServiceImpl implements ProductService {

@Autowired
private ProductDao productDao;

@Transactional(readOnly = false)
public void addProduct(Product product) {
try {
productDao.saveOrUpdate(product);
} catch (Exception e) {
e.printStackTrace();
throw new RuntimeException(e);
}
}

@Transactional(readOnly = false)
public void deleteProduct(Product product) {
try {
productDao.delete(product);
} catch (Exception e) {
e.printStackTrace();
throw new RuntimeException(e);
}
}

@Transactional(readOnly = true)
public List<product> getAllProducts() {
try {
return productDao.getAllProducts();
} catch (Exception e) {
e.printStackTrace();
throw new RuntimeException(e);
}
}

}

~~~

You can see that I am using Spring's @Transactional annotation to demarcate my transactions. I will show you shortly 
how it is configured.
Am also using the @Autowired annotation, doing so I just need to declare a bean of type ProductDao and Spring will 
inject the bean into this ProductService bean. Saves me some xml in my application-context file from instead of 
explicitly setting the dao bean ;-)

And here's my application-context file:

~~~
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xmlns:context="http://www.springframework.org/schema/context"
 xsi:schemaLocation="
   http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-2.5.xsd
   http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd">

 
 <context:annotation-config />
 
 <bean id="productService" class="sample.service.ProductServiceImpl" />
 
 <bean id="daoHelper" class="sample.dao.DaoHelper" />
 <bean id="productDao" class="sample.dao.ProductDaoImpl">
  <constructor-arg ref="daoHelper" />
 </bean>
 <import resource="data-access.xml"/>
</beans>
~~~

This just declares my beans and imports the data-access.xml which configures my settings for talking with the DB.

Here's the data-access.xml:

~~~
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xsi="http://www.w3.org/2001/XMLSchema-instance" 
tx="http://www.springframework.org/schema/tx" schemalocation="            http://www.springframework.org/schema/beans 
http://www.springframework.org/schema/beans/spring-beans-2.5.xsd            http://www.springframework.org/schema/tx 
http://www.springframework.org/schema/tx/spring-tx-2.5.xsd">
           
 <!-- Instructs Spring to perform declarative transaction management on annotated classes -->
 <tx:annotation-driven>
 
 <bean class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
  <property name="location" value="classpath:jdbc.properties">
  <!-- This PPC does not need to resolve every placeholder; needed to support multiple PPCs -->
  <property name="ignoreUnresolvablePlaceholders" value="true">
 </bean>
 

 <!-- Drives transactions using local JPA APIs -->
 <bean id="transactionManager" class="org.springframework.orm.jpa.JpaTransactionManager">
  <property name="entityManagerFactory" ref="entityManagerFactory">
 </bean>
 
 <bean id="entityManagerFactory" class="org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean">
  <property name="dataSource" ref="dataSource">
  <property name="jpaVendorAdapter" ref="hibernateJpaVendorAdapter">
  <property name="persistenceUnitName" value="samplewebapp">
  <property name="jpaProperties">
   <value>
    # Tooling
    hibernate.dialect=${hibernate.dialect}
    hibernate.hbm2ddl.auto=${hibernate.hbm2ddl.auto}
    
    # Debugging / logging
    hibernate.show_sql=${hibernate.show_sql}
    hibernate.format_sql=${hibernate.format_sql}
    hibernate.use_sql_comments=${hibernate.use_sql_comments}
    hibernate.generate_statistics=${hibernate.generate_statistics}

    # Auto-detect annotated JPA entities
    hibernate.archive.autodetection=class
   
    # Caching
    hibernate.cache.provider_class=net.sf.ehcache.hibernate.SingletonEhCacheProvider
    hibernate.cache.use_query_cache=false
    hibernate.cache.use_second_level_cache=true
   </value>
  </property>
 </bean>
 <bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource" method="close">
  <!-- Connection Info -->
  <property name="driverClassName" value="${jdbc.driverClassName}">
  <property name="url" value="${jdbc.url}">
  <property name="username" value="${jdbc.username}">
  <property name="password" value="${jdbc.password}">
  
  <!-- Connection Pooling DBCP -->
  <property name="initialSize" value="5">
  <property name="maxActive" value="100">
  <property name="maxIdle" value="30">
  <property name="maxWait" value="1000">
  <property name="poolPreparedStatements" value="true">
  <property name="defaultAutoCommit" value="false">
 </bean>
 <bean id="hibernateJpaVendorAdapter" class="org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter">
  <property name="showSql" value="true">
  <property name="generateDdl" value="false">
 </bean>
</beans>

~~~

The &lt;tx:annotation-driven&gt; tag tells Spring to provide transactions to my annotated classes (ProductServiceImpl 
class).

I am configuring my properties from a properties file called "jdbc.properties" from the classpath.
I am using commons-dbcp connection pooling library and hence the org.apache.commons.dbcp.BasicDataSource datasource 
property for the LocalContainerEntityManagerFactoryBean

We are using ehcache as the hibernate second-level cache provider.
We are setting hibernate.cache.use_second_level_cache to true to enable hibernate second level caching and using 
net.sf.ehcache.hibernate.SingletonEhCacheProvider as the cache provider.

The name of the Persistence unit is samplewebapp as defined in the META-INF/persistence.xml (which basically contains 
nothing other than the PU name)


~~~
<persistence xmlns="http://java.sun.com/xml/ns/persistence" xsi="http://www.w3.org/2001/XMLSchema-instance" 
schemalocation="http://java.sun.com/xml/ns/persistence http://java.sun.com/xml/ns/persistence/persistence_1_0.xsd" 
version="1.0">
 <persistence-unit name="samplewebapp">
</persistence>
~~~

Here's my jdbc.properties:

~~~
## Properties file for JDBC settings

##-----------------
# MySQL DB Settings
##-----------------
jdbc.driverClassName=com.mysql.jdbc.Driver
jdbc.url=jdbc:mysql://localhost:3306/samplewebapp?createDatabaseIfNotExist=true&amp;useUnicode=true&amp;characterEncodin
g=utf-8
jdbc.username=root
jdbc.password=


##--------------------
# Hibernate properties
##--------------------
hibernate.dialect=org.hibernate.dialect.MySQL5InnoDBDialect
hibernate.hbm2ddl.auto=validate

# Debugging
hibernate.show_sql=false
hibernate.format_sql=true
hibernate.use_sql_comments=true
hibernate.generate_statistics=false

~~~


We need to add dependency on all these libraries that we are using - spring, persistence-api (JPA), hibernate, ehcache, 
dbcp, mysql connector classes etc. This is declared in pom.xml

~~~
<project xmlns="http://maven.apache.org/POM/4.0.0" xsi="http://www.w3.org/2001/XMLSchema-instance" 
schemalocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
 <modelversion>4.0.0</modelversion>
 <groupid>sample</groupid>
 <artifactid>hibernateEhcacheTest</artifactid>
 <packaging>jar</packaging>
 <version>0.0.1-SNAPSHOT</version>
 <name>hibernateEhcacheTest</name>
 <url>http://maven.apache.org</url>
 <dependencies>
  <dependency>
   <groupid>junit</groupid>
   <artifactid>junit</artifactid>
   <version>3.8.1</version>
   <scope>test</scope>
  </dependency>
  <dependency>
   <artifactid>spring-aop</artifactid>
   <version>${spring.version}</version>
   <groupid>org.springframework</groupid>
  </dependency>
  <dependency>
   <artifactid>spring-beans</artifactid>
   <version>${spring.version}</version>
   <groupid>org.springframework</groupid>
  </dependency>
  <dependency>
   <artifactid>spring-context</artifactid>
   <version>${spring.version}</version>
   <groupid>org.springframework</groupid>
  </dependency>
  <dependency>
   <artifactid>spring-core</artifactid>
   <version>${spring.version}</version>
   <groupid>org.springframework</groupid>
  </dependency>
  <dependency>
   <artifactid>spring-dao</artifactid>
   <version>${spring-ext.version}</version>
   <groupid>org.springframework</groupid>
  </dependency>
  <dependency>
   <artifactid>spring-jdbc</artifactid>
   <version>${spring.version}</version>
   <groupid>org.springframework</groupid>
  </dependency>
  <dependency>
   <artifactid>spring-orm</artifactid>
   <version>${spring.version}</version>
   <groupid>org.springframework</groupid>
  </dependency>
  <dependency>
   <artifactid>persistence-api</artifactid>
   <version>${persistence-api.version}</version>
   <groupid>javax.persistence</groupid>
  </dependency>
  <dependency>
   <artifactid>commons-dbcp</artifactid>
   <version>${commons-dbcp.version}</version>
   <scope>compile</scope>
   <groupid>commons-dbcp</groupid>
  </dependency>
  <dependency>
   <artifactid>hibernate</artifactid>
   <version>${hibernate.version}</version>
   <groupid>org.hibernate</groupid>
  </dependency>
  <dependency>
   <artifactid>hibernate-annotations</artifactid>
   <version>${hibernate-annotations.version}</version>
   <groupid>org.hibernate</groupid>
  </dependency>
  <dependency>
   <artifactid>hibernate-entitymanager</artifactid>
   <version>${hibernate-entitymanager.version}</version>
   <groupid>org.hibernate</groupid>
  </dependency>
  <dependency>
   <artifactid>hibernate-validator</artifactid>
   <version>${hibernate-validator.version}</version>
   <groupid>org.hibernate</groupid>
  </dependency>
  <dependency>
   <artifactid>hibernate-commons-annotations</artifactid>
   <version>${hibernate-commons-annotations.version}</version>
   <groupid>org.hibernate</groupid>
  </dependency>
  <dependency>
   <artifactid>concurrent</artifactid>
   <version>${concurrent.version}</version>
   <groupid>concurrent</groupid>
  </dependency>
  <dependency>
   <artifactid>mysql-connector-java</artifactid>
   <version>${mysql.version}</version>
   <scope>compile</scope>
   <groupid>mysql</groupid>
  </dependency>
  <dependency>
   <artifactid>log4j</artifactid>
   <version>${log4j.version}</version>
   <groupid>log4j</groupid>
   <exclusions>
    <exclusion>
     <groupid>javax.jms</groupid>
     <artifactid>jms</artifactid>
    </exclusion>
    <exclusion>
     <groupid>com.sun.jdmk</groupid>
     <artifactid>jmxtools</artifactid>
    </exclusion>
    <exclusion>
     <groupid>com.sun.jmx</groupid>
     <artifactid>jmxri</artifactid>
    </exclusion>
    <exclusion>
     <groupid>javax.mail</groupid>
     <artifactid>mail</artifactid>
    </exclusion>
   </exclusions>
  </dependency>
  <dependency>
   <artifactid>ehcache</artifactid>
   <version>${ehcache.version}</version>
   <groupid>net.sf.ehcache</groupid>
  </dependency>
  <dependency>
   <artifactid>tim-hibernate-3.2.5</artifactid>
   <version>${tim-hibernate-3.2.5.version}</version>
   <groupid>org.terracotta.modules</groupid>
   <scope>provided</scope>
  </dependency>
  <dependency>
   <artifactid>tim-ehcache-1.3</artifactid>
   <version>${tim-ehcache-1.3.version}</version>
   <groupid>org.terracotta.modules</groupid>
   <scope>provided</scope>
  </dependency>
 </dependencies>
 <properties>
  <spring-ext.version>2.0.7</spring-ext.version>
  <spring.version>2.5.4</spring.version>
  <persistence-api.version>1.0</persistence-api.version>
  <commons-dbcp.version>1.2.2</commons-dbcp.version>
  <hibernate-commons-annotations.version>3.0.0.ga</hibernate-commons-annotations.version>
  <hibernate-annotations.version>3.3.1.GA</hibernate-annotations.version>
  <hibernate-entitymanager.version>3.3.1.ga</hibernate-entitymanager.version>
  <hibernate-validator.version>3.0.0.ga</hibernate-validator.version>
  <hibernate.version>3.2.5.ga</hibernate.version>
  <concurrent.version>1.3.4</concurrent.version>
  <mysql.version>5.0.5</mysql.version>
  <hibernate3-plugin.version>2.1</hibernate3-plugin.version>
  <log4j.version>1.2.15</log4j.version>
  <ehcache.version>1.3.0</ehcache.version>
  <tim-hibernate-3.2.5.version>1.2.1</tim-hibernate-3.2.5.version>
  <tim-ehcache-1.3.version>1.2.1</tim-ehcache-1.3.version>
 </properties>
 <build>
  <plugins>
   <plugin>
    <artifactid>hibernate3-maven-plugin</artifactid>
    <version>${hibernate3-plugin.version}</version>
    <groupid>org.codehaus.mojo</groupid>
    <configuration>
     <componentproperties>
      <implementation>jpaconfiguration</implementation>
      <propertyfile>target/classes/hibernate3hbm2ddl.properties</propertyfile>
      <drop>true</drop>
      <export>true</export>
      <outputfilename>schema.sql</outputfilename>
     </componentproperties>
    </configuration>
   </plugin>
   <plugin>
    <artifactid>maven-compiler-plugin</artifactid>
    <groupid>org.apache.maven.plugins</groupid>
    <configuration>
     <source>1.5</source>
     <target>1.5</target>
    </configuration>
   </plugin>
  </plugins>
  <extensions>
   <extension>
    <artifactid>mysql-connector-java</artifactid>
    <version>${mysql.version}</version>
    <groupid>mysql</groupid>
   </extension>
  </extensions>
 </build>
 <pluginrepositories>
  <pluginrepository>
   <id>terracotta-repository</id>
   <url>http://www.terracotta.org/download/reflector/maven2</url>
   <releases>
    <enabled>true</enabled>
   </releases>
   <snapshots>
    <enabled>true</enabled>
   </snapshots>
  </pluginrepository>
  <pluginrepository>
   <id>mortbay-snapshot-repo</id>
   <name>MortBay Snapshot Repo</name>
   <url>http://jetty.mortbay.org/maven2/snapshot</url>
   <releases>
    <enabled>false</enabled>
   </releases>
   <snapshots>
    <enabled>true</enabled>
   </snapshots>
  </pluginrepository>
 </pluginrepositories>
</project>
~~~


Now the last thing that we need is the main class that will demonstrate all these glued together.
Here's the main class that I am using to drive the App,

~~~
package sample;

import java.util.List;
import java.util.Random;
import java.util.UUID;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import sample.model.Product;
import sample.service.ProductService;

public class App {

private static Random random = new Random();

public static final ApplicationContext ctxt;
static {
 ctxt = new ClassPathXmlApplicationContext("application-context.xml");
}

private ProductService productService = (ProductService) ctxt.getBean("productService");

public static void main(String[] args) {
 new App().test();
}

private void test() {
 listProducts();
 addRandomProducts(random.nextInt(10) + 1);
 listProducts();
}

private void addRandomProducts(int numProducts) {
 System.out.println("======= Adding " + numProducts + " random products...");
 for (int i = 0; i <> allProducts = productService.getAllProducts();
 System.out.println("Number of products: " + allProducts.size());
 for (Product prod : allProducts) {
   System.out.println("Product: " + prod);
 }
}

private Product getRandomProduct() {
 Product product = new Product();
 product.setProductId(Long.valueOf(UUID.randomUUID().getLeastSignificantBits()));
 product.setGroupId(Long.valueOf(UUID.randomUUID().getLeastSignificantBits()));
 product.setDescription("A description : " + System.currentTimeMillis());
 return product;
}
}
~~~


You can try out running this class using

<pre class="console">

$ mvn exec:java -Dexec.mainClass=sample.App

</pre>


Now the interesting part: clustering the app with Terracotta.
For this we create a tc-config.xml and just tell Terracotta that we are using hibernate and ehcache and it will 
automatically cluster the app.


~~~
<?xml version="1.0" encoding="UTF-8"?>
<tc:tc-config tc="http://www.terracotta.org/config" xsi="http://www.w3.org/2001/XMLSchema-instance" 
schemalocation="http://www.terracotta.org/config http://www.terracotta.org/schema/terracotta-4.xsd">
 <servers>
  <server name="localhost" host="localhost">
   <dso-port>9510</dso-port>
   <jmx-port>9520</jmx-port>
   <data>target/terracotta/server/data</data>
   <logs>target/terracotta/server/logs</logs>
   <statistics>target/terracotta/server/statistics</statistics>
  </server>
 </servers>
 <clients>
  <logs>target/terracotta/clients/logs/%(tc.nodeName)</logs>
    <statistics>target/terracotta/clients/statistics/%(tc.nodeName)</statistics>
    <modules>
      <module name="tim-hibernate-3.2.5" version="1.2.1">
      <module name="tim-ehcache-1.3" version="1.2.1">
      <module name="clustered-commons-collections-3.1" version="2.7.1">
    </modules>
  </clients>
  <application>
    <dso>
     <instrumented-classes>
         <include>
           <class-expression>sample.model.ProductCompositeKey</class-expression>
         </include>
         </instrumented-classes>
    </dso>
  </application>
</tc:tc-config>

~~~

That's all that's needed to cluster with Terracotta.
Here's a script that will launch the app with Terracotta, just replace the TC_INSTALL_DIR with the location where you 
have <a href="http://terracotta.org/web/display/orgsite/DownloadCatalog">downloaded</a> and installed Terracotta:

~~~
#!/bin/bash

TC_INSTALL_DIR=/Users/asingh/terracottaKit/terracotta-2.7.1

mvn compile

CP_FILE=cp.txt
mvn dependency:build-classpath -Dmdep.outputFile=$CP_FILE
echo ":./target/classes"  >> $CP_FILE

$TC_INSTALL_DIR/bin/dso-java.sh -cp `cat $CP_FILE` sample.App

rm $CP_FILE

~~~


I am sure I must have missed some parts of explaining the glue-points here and there.
You can download the attached tarball from <a 
href="http://forums.terracotta.org/forums/posts/downloadAttach/721.page">here</a> and play around with this simple app.

Looks like this was quite a long (hopefully not boring) post. Hope you are still with me and reading this :)... and do 
leave a comment if you are <span style="font-weight: bold;">not</span> reading this ;-)
