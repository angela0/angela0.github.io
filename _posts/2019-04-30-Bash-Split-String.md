---
layout: post
title:  "Bash 中分隔字符串到数组"
data: 2019-04-30
categories:
- Howto
---

本文教你几种将字符串分隔后存入数组的方法。（注：针对 Beginner 的小文，老司机不用点进来了）

<!-- more -->

你可能有一段话，每个词都是用空格，逗号或者下划线分隔，这时你想把这些单词都分隔出来并存进数组，下面这几种方法都能实现。


## 使用 read 命令

``` bash
#!/bin/bash
# Script to split a string based on the delimiter

my_string="Ubuntu;Linux Mint;Debian;Arch;Fedora"
# 下面这句用来将 my_string 变量分隔保存在 my_array 数组中
IFS=';' read -ra my_array <<< "$my_string"

#Print the split string
for i in "${my_array[@]}"
do
    echo $i
done
```

`IFS` 是 `read` 命令用来分隔单词的分隔符，在这个例子中，我们把它设置为 `;`。你可以根据你的情况，像空格啦，逗号啦都行。

这里的 `-r` 选项指的是怎么输出怎么读，不会转义反斜线（在这里对我们的结果没啥影响）。`-a` 就是把读到的内容放到数组。

简而言之，这条命令就是把一句话用 `;` 分隔，然后存人数组。

下面那个 `for` 语句是把数组的内容打印出来，方便验证结果。


## 使用 trim(tr) 命令

``` bash
#!/bin/bash
# Script to split a string based on the delimiter

my_string="Ubuntu;Linux Mint;Debian;Arch;Fedora"  
my_array=($(echo $my_string | tr ";" "\n"))

#Print the split string
for i in "${my_array[@]}"
do
    echo $i
done
```

这个命令似乎比上一个麻烦，确实是这样。它实际起作用的是最外面的那一对括号（所以你并不一点要用 tr 命令，换成你喜欢的比如 `cut`、`awk` 也是可以的）。它会根据空白符将字符串分隔进数组。所以理论上讲，对我们这个例子来说，这其实是错误的。因为它把 `Linux Mint` 也分隔了。所以，如果有空格的话，你还是使用上一个方法吧。


## 写在最后

这篇小文的内容主要来自 [How to Split String in Bash Script](https://linuxhandbook.com/bash-split-string/)。