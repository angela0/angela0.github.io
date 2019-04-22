---
layout: post
title:  "了解你的 Linux 系统的内存使用"
data: 2019-04-19
categories:
- Howto
---

了解系统的内存使用情况非常重要，这里教你几种查看内存情况的方法。（注：针对 Beginner 的小文，老司机不用点进来了）

作为系统管理员，了解你的系统的资源（如 CPU，内存，磁盘）情况非常重要。在之前的文章 [how to check CPU info in Linux](https://linuxhandbook.com/check-cpu-info-linux/) 介绍了如何查看 CPU 使用情况，这里就在介绍一下内存使用情况。

注：内存，物理内存都是 RAM 的术语。换句话说，你想查看 RAM 的使用情况，要使用内存相关的命令。


## 5 个查看内存使用的命令

这里我们介绍几个不同的命令，并解释一下这些命令如何工作的。


### free

这个命令很简单，输出也很简单。它就打印你的 Linux 系统使用了多少内存，还剩多少内存。包括物理内存，交换内存，内核的 buffer 情况等。

使用很简单，只要输入 `free` 就好了：

![](https://i2.wp.com/linuxhandbook.com/wp-content/uploads/check-momory-linux-free-command.png?w=734&ssl=1)

你可以看到，free 只输出了一些必要的信息。


### top

这是个很常用的命令。它显示了关于 CPU 和 内存的相关信息。类似下图：

![](https://i1.wp.com/linuxhandbook.com/wp-content/uploads/top.png?w=731&ssl=1)

在头部里，你可以看到有内存总量，使用总量，剩余总量等信息，即有物理内存，也有交换内存。


### htop

htop 算是 top 的加强版本，更加得图形化了。

![](https://i2.wp.com/linuxhandbook.com/wp-content/uploads/htop.png?w=731&ssl=1)


### /proc/meminfo

其实之前的几个命令的信息都来自于 proc 文件系统，而直接查看这个文件，你会发现不只内存的基本信息，还有包括内存使用页数等信息。下面是使用 cat 命令查看该文件的截图：

![](https://i1.wp.com/linuxhandbook.com/wp-content/uploads/proc.png?w=733&ssl=1)


解释每一项要花费长篇大论，以后再说。


### vmstat -m

实际上 vmstat 也会从 proc 里读信息。而且只有超级用户（root）才能使用（或者使用 sudo）。它给出的信息也是非常详细：

![](https://i2.wp.com/linuxhandbook.com/wp-content/uploads/vmstat.png?w=734&ssl=1)


## 额外介绍：使用 dmidecode 查看 RAM 信息

dmidecode 更多的是查看内存的物理信息，主要关于你电脑实际内存芯片。通过它你可以知道你当前使用的内存条的信息：物理位置（在哪个插槽里），什么类型的内存条（DIMM 还是 SIMM），速度，制造商，电压，甚至是检测到的出错信息。

运行 `sudo dmidecode -t 17```，输出信息类似下面截图：

![](https://i2.wp.com/linuxhandbook.com/wp-content/uploads/demidecode.png?w=731&ssl=1)


## 总结

Linux 提供了很多方法来查询某个信息，使用哪种方法取决于你想了解哪方面的信息。


## 写在后面

这篇小文的原内容主要来自 [What You Need to Know About Linux System Memory](https://linuxhandbook.com/linux-memory-usage/)。