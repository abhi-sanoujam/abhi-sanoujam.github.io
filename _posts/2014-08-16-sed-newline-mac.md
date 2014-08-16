---           
layout: post
title: sed newline in mac
date: 2014-08-16 14:26 IST
updated: 2014-08-16 14:26 IST
tagline: 
categories: bash
tags: bash sed tips 
---
If you love sed and are using a Mac, you know that its frustrating using newlines `\n` - using `\n` in replace part in 
sed just doesn't work in Mac :(

For example, below doesn't replace with newlines

`sed 's/search-for/\n/g'`

To use newlines in sed in mac, use the following instead
    
`sed 's/search-for/\'$'\n/g'`

That is, use `\'$'\n` instead of simple `\n`. That gets the job done!!

