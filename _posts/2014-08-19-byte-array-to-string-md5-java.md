---           
layout: post
title: Byte array to String + md5 in java
date: 2014-08-19 12:41 IST
updated: 2014-08-19 12:41 IST
tagline: Bits and bytes...
categories: java
tags: java tips how-to 
---

So, how do you get [md5](http://en.wikipedia.org/wiki/MD5) hash of a given input String in java?

MessageDigest can give you md5 digest (byte array) for any String input

    String data = "some input text";
    MessageDigest messageDigest = MessageDigest.getInstance("MD5");
    byte[] byteArray = messageDigest.digest(data.getBytes("UTF-8"));


Once you get the byte[], you can get a String representation of it using the following code


    import javax.xml.bind.DatatypeConverter;    
    
    String stringFromBytes = DatatypeConverter.printHexBinary(byteArray);
    
What it does is get the hex representation of the byte array.

    private static final char[] hexCode = "0123456789ABCDEF".toCharArray();
    
    public String printHexBinary(byte[] data) {
        StringBuilder r = new StringBuilder(data.length * 2);
        for (byte b : data) {
            r.append(hexCode[(b >> 4) & 0xF]);
            r.append(hexCode[(b & 0xF)]);
        }
        return r.toString();
    }

    
One byte converts to two chars. One char each for 4 bits. The resultant string will have twice as many chars as there
 are bytes in the input.
 
Here's the full method for getting the md5 hash combining the above

    public static String md5(String data) throws Exception {
        MessageDigest messageDigest = MessageDigest.getInstance("MD5");
        byte[] digest = messageDigest.digest(data.getBytes("UTF-8"));
        return DatatypeConverter.printHexBinary(digest);
    }
    
 Enjoy...
 
