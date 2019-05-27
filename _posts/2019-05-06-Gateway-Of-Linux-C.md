---
layout: post
title:  "Linux C 开发上路指北"
data: 2019-05-06
categories:
- Notes
tag:
- Linux
- C
---

很多计算机专业的学生在大学时期想要学习 Linux C 开发，但由于跟学校设置的课程偏离较多而没有学习方向。这里提供一个分阶段方案作为上路指北吧。需要说明，仅供参考，每个人的情况不一样，据自己而调整。

整个学习过程分为 6 个阶段，每个阶段都需要阅读一些书籍，并完成所要求的练习，最好控制在 2~3 个月，全部阶段最多 18 个月完成。之后，即便感觉兴趣不在于此，这段时间的积累也将颇有用处。

<!-- more -->

既然是 Linux C，所必须的前置条件就是**要较为熟练地使用 Linux 操作系统**。熟练是一个宽泛的概念，这个自己体会吧；我只说一点，你需要清楚知道如何编译运行程序。


## 阶段一

计算机专业的学生在入学的第一学期应该就会学习 C 语言，这对我们非常有利。说实话，学校使用的教材真的不敢恭维；但如果连教材都无法理解的话，恐怕很难往下进行（你明白我的意思）。

### 推荐读物

- C Primer Plus
- C 和指针
- The C Programming Language（C 编程语言）

### 练习

你的教材以及推荐的这些读物都包含一些课后练习，把它们做了吧。尤其是编程练习，一定要做！


### 学习验收

在这个阶段结束之后，你应该对 C 语言有了初步认识，并能使用它编写一些计算器之类的小程序。这还不够，去实现一个 string 库吧，包含 `string.h` 头文件的所有函数功能。


## 阶段二

你在学习 C 语言的时候可能发现了它的许多问题，这个阶段就是要挑一下 C 语言的刺。

### 推荐读物

- C专家编程
- 你必须知道的495个C语言问题
- C语言深度解剖
- C99标准
- 深入理解计算机系统(第2章)

C专家编程、你必须知道的495个C语言问题、C语言深度解剖 这 3 本书带你深入 C 语言的方方面面，包括它所有的缺点和问题；C99 是 C 语言最新的标准，所以你有必要读一下的。

你在写程序的时候，可能很好奇数据在计算机里面是如何存储以及如何表示的，深入理解计算机系统 这本书的第二章就带你领略一下。对于这本书，暂时只阅读这一章就足够了，有些内容还比较高级，存着以后读吧。

### 练习

在之前的练习中，不管是由于 C 语言本身的问题，还是你没有考虑周全导致的问题，并不总是一次就把程序正确完成。所以你要学会调试程序。刚开始你可能使用 printf 大法，但这很麻烦，学习使用 GDB 吧。去搜索一份 GDB 教程，一般用不了半个小时就能熟悉它的基本用法；对于高级用法，现在用不到。

这几本书也有一些习题，可以挑选着做一下。

### 学习验收

有一种加密算法叫做 RC4，非常简单，你可以搜索了解一下，我们的目的是实现一个库，功能是 RC4 的加解密（RC4 已经被认定为不安全的加密算法，不要使用它了）。对密码学感兴趣而且还有时间的话，你可以再实现一下 AES、RSA 等。


## 阶段三

现在对 C 的了解差不多了，该了解 Linux 了。这里的了解不是系统使用，而是系统提供的 C 编程接口。

### 推荐读物

- Unix环境高级编程（3 ~ 10、 13、15 章）
- 现代操作系统

为啥是 Unix 环境呢？追根溯源的话，Linux 是 **类Unix** 系统。在以后的学习中你会发现，所有 类Unix 系统的编程接口都很像，这在编写可移植程序时省了不少老劲。关于这一点在这本书中也有提到，需要你从头看起。

现代操作系统 这本书作为辅助书籍吧。

### 练习

这本书课后练习比较少，且编程练习更少，但我们不能不练习。

- 写一个 INI 配置文件解析器，练习文件读写，了解 IO
- 写一个多进程计算素数的程序，想方设法提高运行效率（可以对比观察多进程是否提高效率）

### 学习验收

这一期的书籍虽然比较少，但它非常重要，对自己的验收就是有没有对所有细节了如指掌。

另外，还是编写一个总结性的程序吧，功能要求如下：

1. 能对文件加解密
2. 可以探测文件是否加密
3. 使用多进程提高程序效率


## 阶段四

经过前面的学习，你已经对整个框架熟悉了。接下来学习一下 IO 编程中的一个重要分支 -- 网络编程。

### 推荐读物

- Unix网络编程卷一(TCP、 UDP部分)
- Unix环境高级编程

Unix网络编程卷一 这本书算是把 环境高编 中的 IO 部分的网络独立出来了（如果以后你学习 Linux 内核 时候，你会发现会把网络子模块独立一本书出来）。如果你想学习网络编程，是绕不开这本书的。我们目前不需要对所有协议都了解（除非你以后要做网络相关的编程，如 SDN），所以只看 TCP 和 UDP 部分。

你发现我又把 Unix环境高级编程 列出来了。没错，前面没看到的，看；看过的，再来一遍。

### 练习

既然是网络编程，那就写一个网络编程里的 helloworld 吧 -- echo 服务端和客户端。

功能很简单，服务端监听某个端口，当有客户端连接进来，将客户端发来的所有数据都发送回去；客户端更简单了，连上服务端后发送一些数据，并将服务端返回的数据打印出来。

### 学习验收

这将是一个有挑战性的验收：开发一个 FTP 服务器。嗯，就一句话。


## 阶段五

实际上到这里你已经成功入门了，因为你在路上走了好久了。但入门还不够，我们要有工匠精神。

### 推荐读物

- Unix环境高级编程(多线程部分)
- 编写可读代码的艺术
- The Linux Programming Interface（Linux 编程接口）
- C语言接口与实现：创建可重用软件的技术

这些书籍都可以教你如何编写更好、更优雅的 C 代码。

### 练习

多线程编程是不可或缺的技能，所以，练习使用多线程吧。如果这时候你已经学习过 操作系统 这门课，编写一个生产者消费者模型吧。

### 学习验收

C语言接口与实现 这本书提供了许多典型数据结构，自己实现它们！


## 阶段六

到这里我都已经没什么可说的了，但忽然想起 HTTP -- 这个支撑了大壁互联网的应用层协议。

### 推荐读物

- HTTP权威指南
- 图解HTTP
- Unix网络编程卷一（TCP）

HTTP权威指南 也是一本非常厚重的书，因为 HTTP 经过这么年的发展已经非常庞大了。所以，以 图解HTTP 为基准，学习那些重要的东西。

因为目前的 HTTP 协议使用 TCP 协议（在 HTTP3 中会引入 HTTP over UDP），所以对 TCP 也要非常得熟悉。

### 练习

这里不做什么练习了，多回想一下之前的练习吧，为验收做准备。

### 学习验收

Web 服务器。不用实现所有功能，但至少能够正确处理那些常用的 HTTP 方法，还有别忘了使用学过的一切方法（多进程、多线程、poll、epoll 等等等等）提高它的性能。


## 写在最后

在学习过程中，肯定会遇到很多问题，我相信你可以通过 查阅、搜索、咨询 等一切手段来解决这些问题。也许能从某个点扩展出你感兴趣的领域。去吧，去扩展吧。

在学习完上述阶段之后，你应该对 Linux 编程甚至计算机体系都有了非常清晰的了解，再学习其它内容不会有束手缚脚的感觉了。

如果你想在 Linux 编程中继续深入挖掘的话，可以考虑的方向有 `Linux 网络协议栈`、`Linux 内核` 以及 `SDN` 等。

此外，这份指北是结合以前的经历突发奇想的结果，以后可能会慢慢完善、更新。