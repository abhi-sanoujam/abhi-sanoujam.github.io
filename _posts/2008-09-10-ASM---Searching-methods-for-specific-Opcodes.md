---
layout: post
title: ASM - Searching methods for specific Opcodes
date: 2008-09-10 11:55:07 UTC
updated: 2008-09-10 11:55:07 UTC
comments: false
categories: java
tags: aaload asm bytecode classadapter classreader java opcode
---

Doing bytecode manipulation is cool, and [ASM](http://asm.objectweb.org/) makes the job quite easy. Its a cool 
framework that lets us do bytecode manipulation, analyse, modify or even dynamically generate bytecodes on the fly.

The [User guide]("http://download.forge.objectweb.org/asm/asm-guide.pdf) on their web-site is quite a nice doc and 
explains things neatly.

ASM is quite simple and easy to use. Following is a simple Class adapter that can be used to search for methods which
 contains specific Opcodes. I actually intend to write a use case about resolving types of AALOAD, 
 but I guess I'll cover this simple Adapter first which will be used later on.


So here goes...


    package adapters;
    
    import org.objectweb.asm.ClassAdapter;
    import org.objectweb.asm.ClassVisitor;
    
    import org.objectweb.asm.MethodVisitor;
    import org.objectweb.asm.Opcodes;
    importorg.objectweb.asm.MethodAdapter;
    
    
    import java.util.HashMap;
    import java.util.Map;
    
    //a class adapter that will search for specific opcode in all its methods and remember those
    //methods
    public class OpcodeSearchClassAdapter extends ClassAdapter implements Opcodes {
    
    // the opcode to be searched as defined in com.objectweb.asm.Opcodes
    private int searchOpcode;
    // mapping of method names -> method signatures
    private Map methodsWithSearchOpcode;
    private boolean done;
    
    public OpcodeSearchClassAdapter(final ClassVisitor classVisitor, int searchOpCode) {
      super(classVisitor);
      methodsWithSearchOpcode = new HashMap();
      searchOpcode = searchOpCode;
    }
    
    public MethodVisitor visitMethod(final int access, final String name, final String desc,
        final String signature, final String[] exceptions) {
      final MethodVisitor mv = super.visitMethod(access, name, desc, signature, exceptions);
      return new OpcodeSearchMethodAdapter(access, name, desc, mv, searchOpcode,
          methodsWithSearchOpcode);
    }
    
    public void visitEnd() {
      this.done = true;
      super.visitEnd();
    }
    
    public int getSearchOpcode() {
      return searchOpcode;
    }
    
    public Map getMethodsWithSearchOpcode() {
      if (!done) {
        return null;
      }
      return methodsWithSearchOpcode;
    }
    
    private static class OpcodeSearchMethodAdapter extends MethodAdapter implements Opcodes {
    
      private Map methodsWithOpcode;
      private int searchOpcode;
      private String name;
      private String desc;
    
      private OpcodeSearchMethodAdapter(final int access, final String name, final String desc,
          final MethodVisitor mv, final int searchOpcode, final Map methodsWithOpcode) {
        super(mv);
        this.name = name;
        this.desc = desc;
        this.searchOpcode = searchOpcode;
        this.methodsWithOpcode = methodsWithOpcode;
      }
    
      public void visitInsn(final int opcode) {
        if (opcode == searchOpcode) {
          this.methodsWithOpcode.put(name + " " + desc, name);
        }
        super.visitInsn(opcode);
      }
    }
    }



Lets write a simple example that demonstrates this class adapter. We'll write a simple Test class that will contain 
some methods with the instruction that we want to search for. We will then load the bytes of this Test class, 
go through the bytecode of this class and look inside all the methods searching for the required Opcode instruction.

For example, lets say we are going to search for the AALOAD instruction, lets write our Test class as follows:


    package test;
    
    public class TestClass {
    
      public void fooSquare(Integer[] bar, int i) {
        System.out.println("Method with AALOAD");
        bar[i] = new Integer(bar[i].intValue() * bar[i].intValue());
      }
    
      public int getFoo(int[] bar, int i) {
        System.out.println("Method with IALOAD, not with AALOAD");
        return bar[i];
      }
      
      public void foobar() {
        System.out.println("Method with no AALOAD");
      }
      
      public void foo(Foo[] fooArr, int i) {
        System.out.println("Another method with AALOAD");
        System.out.println("Invokes method on the array element");
        fooArr[i].bar();
      }
      
      public static class Foo {
        public void bar() {
          System.out.println("Foo.bar()");
        }
      }
    
    }


The TestClass contains some methods with AALOAD. It also contains other methods which doesn't contain it. The methods
<code>public void fooSquare(Integer[] bar, int i)</code> and <code>public void foo(Foo[] fooArr, int
    i)</code> are the methods that contain the AALOAD instruction as seen in the code.


Lets now write the Main class that will load the bytes of <code>TestClass</code> and run the <code>OpcodeSearchClassAdapter</code>


    package test;
    
    import java.io.IOException;
    import java.io.InputStream;
    import java.util.Iterator;
    import java.util.Map;
    
    import org.objectweb.asm.ClassReader;
    import org.objectweb.asm.ClassVisitor;
    import org.objectweb.asm.Opcodes;
    import org.objectweb.asm.commons.EmptyVisitor;
    
    import adapters.OpcodeSearchClassAdapter;
    
    public class MainTest {
    
      public static void main(String[] args) throws IOException {
        new MainTest().test();
      }
    
      private void test() throws IOException {
        String testClassName = TestClass.class.getName().replace('.', '/');
        String fileName = testClassName.substring(testClassName.lastIndexOf('/') + 1) + ".class";
        InputStream is = this.getClass().getResourceAsStream(fileName);
        ClassReader reader = new ClassReader(is);
        ClassVisitor emptyVisitor = new EmptyVisitor();
        OpcodeSearchClassAdapter searchClassAdapter = new OpcodeSearchClassAdapter(emptyVisitor,
            Opcodes.AALOAD);
        reader.accept(searchClassAdapter, ClassReader.SKIP_FRAMES);
    
        System.out.println("Methods with AALOAD: ");
        Map methods = searchClassAdapter.getMethodsWithSearchOpcode();
        for (Iterator it = methods.keySet().iterator(); it.hasNext();) {
          String key = (String) it.next();
          String val = (String) methods.get(key);
          System.out.println("method name: " + val + " desc:" + key);
        }
      }
    }


The MainTest class loads the TestClass and runs our class adapter through the TestClass bytecode.

It first creates an InputStream of the TestClass bytecodes by loading the bytes using getResourceAsStream method in 
ClassLoader. A ClassReader is instantiated using the inputstream which "accepts" an instance of 
OpcodeSearchClassAdapter. We create an instance of OpcodeSearchClassAdapter which takes an EmptyVisitor and the 
Opcode we are searching for -- which is AALOAD in this example.

We are using an EmptyVisitor as we are only reading through the bytecode and not changing anything. The methods 
containing the Opcode we are searching is remembered by the OpcodeSearchClassAdapter.

After the reader accepts the Adapter, we use getMethodsWithSearchOpcode() in the OpcodeSearchClassAdapter to get the 
methods which contain AALOAD and simply print it out.

If you compile and run the above, you will get an output like:


    Methods with AALOAD: 
    method name: foo desc:foo ([Ltest/TestClass$Foo;I)V
    method name: fooSquare desc:fooSquare ([Ljava/lang/Integer;I)V

In the next post I will show how to analyse bytecode and get the type reference of AALOAD which can be used to instrument this access.
