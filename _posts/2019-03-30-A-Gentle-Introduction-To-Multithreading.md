---
layout: post
title:  "多线程漫谈：走向并发的世界，一步一个脚印"
data: 2019-03-28
categories:
- Translate
tags:
- 多线程
- 并发
---

现代计算机具有一次执行多个操作的能力。得益于硬件的精进以及更加聪明的操作系统，这个特性会让你的程序跑得更快，无论是执行速度还是响应速度。

编写具有这种巨大优点的程序非常有趣，但又是复杂的：你必须理解你的计算机到底发生了什么。在第一章，我将揭开 **线程** 的面纱，它是操作系统提供的以施展上述魔法的一种工具。让我们开始吧。


## 进程和线程：以正确的方式命名

现代操作系统可以同时运行多个程序。这就是为什么你可以边在浏览器（一个程序）里阅读这篇文章，边使用媒体播放器（另一个程序）听音乐。每一个程序被称作一个正在执行的 **进程**。操作系统有很多让多个进程一起工作的技巧，同时也会利用底层硬件的优势。不管哪种方式，最后你看到的结果都是你的所有程序在同时运行。

在一个操作系统里运行多个进程并不是同时执行多个操作的唯一方法。每个进程也可以同时运行多个子任务，他们叫做 **线程**。你可以把线程看成是进程它自己的一片。每一个进程在启动是都至少会启动一个线程，这个线程叫做 **主线程**。然后，根据程序或者程序员的需要，另外的线程会被启动或者终止。**多线程** 就是在一个进程里运行多个线程。

例如，你的媒体播放器很可能就是多线程：一个线程用于渲染界面 —— 这个通常是主线程，另外一个线程播放音乐，等等。

你可以认为操作系统是乘放多个进程的容器，而每个进程又是乘放多个线程的容器。在这篇文章里，我将只关注线程，但是并发的话题是非常有趣并且未来值得更深入的分析。

![](https://raw.githubusercontent.com/monocasual/internalpointers-files/master/2019/02/processes-threads.png)

### 进程和线程的差异

每个进程都有他自己的内存块，是由操作系统分配的。默认情况下，这块内存是不能和其他进程共享的：你的浏览器无法访问媒体播放器的内存，反之亦然。即便你运行一个程序的 2 个实例（译注：进程可以称做程序的实例），结果也是一样，比如你运行浏览器两次。操作系统把每一个实例当作一个新的进程，都有它自己的隔离的内存区域。因此，默认情况下，两个或多个进程不能共享数据，除非使用一些高级技巧 -- 就是所谓的进程间通信（IPC）。

不像进程，所有线程可以共享操作系统分配给他们进程的内存块：媒体播放器里，音频引擎可以很容易访问主界面的数据，反之亦然。因此，两个线程更容易相互通信。最重要的是，线程要比进程轻量：他们占用更少的资源，也创建得更快，这就是为什么他们也被称为轻量级进程。


### 绿色线程，纤程

迄今为止我们提到的线程都是和操作系统有关的：一个进程要启动一个线程必须要告诉操作系统。但不是每个平台都原生支持线程的。**绿色线程**，也叫 **纤程**，可以在不支持多线程的环境中模拟多线程。例如一个虚拟机可以在操作系统层面不支持原生线程的情况下实现绿色线程。

绿色线程可以更快地创建和管理，因为他们完全不经过操作系统，但也有一定的缺点。这个话题将放在下一章来说。

绿色线程这个名字来源于 Sun 公司的 Green 小组，他们在 90 年代设计了原始的 Java 线程库。如今 Java 不再使用绿色线程：他们在 2000 年换成了原生线程。其他的一些语言 -- Go，Haskell 以及 Rust 等等 -- 实现了类似绿色线程的东东，而不是使用原生线程。


## 线程的用处

为什么一个进程需要使用多个线程？就像我之前提到的，并行地干活可以极大的提速。就拿你使用电影编辑器来渲染一个电影来说吧。编辑器会聪明地把渲染操作分散给过个线程来做，每个线程处理影片的一段。因此，如果一个线程要用一个小时，那两个线程的话只需要 30 分钟；4 个线程只要 15 分钟，等等。

真的这么简单么？还有 3 个重要的点要考虑：

1. 不是每个程序都需要多线程。如果你的应用执行的顺序操作或者经常要等待用户的操作，多线程就没有那么有用了;
2. 不是简单开出多个线程就可以让你的应用跑地更快：每一个子任务都需要认真考量和设计以使得能都执行并行操作;
3. 并不能 100% 保证线程 *同一时间* 真的在并行执行他们的操作：它完全取决于底层的硬件。

最后这一条非常关键：如果你的计算机不支持同时多任务，那么操作系统只要伪造了。等下我们就知道如何做到的。现在我们可以认为 **并发** 就是有多个任务在同时运行的 *感觉*，而 **并行** 就像字面意思一样，就是在同时运行。

![](https://raw.githubusercontent.com/monocasual/internalpointers-files/master/2019/02/concurrency-parallelism.png)


## 如何实现并发和并行

你电脑上的 **中央处理器** （CPU）在努力地运行程序。它分为好几部分，最主要的就是所谓的核：这里是计算实际被执行的地方。一个核一次智能运行一个操作。

这当然是一个主要的缺点。为此，操作系统开发了高级的技术来给用户一次执行多个进程（或线程）的能力，尤其是在图形环境，即使是在只有一个核的机器上。最重要的一个技术是 **抢占式多任务处理**，这里的 **抢占** 是中断一个任务并切换到其他任务，在一段时间后再恢复之前任务的能力。

因此，如果你的 CPU 只有一个核，操作系统的一部分工作是将单个核心计算能力分散到多个进程或线程中，这些进程或线程一个接一个地执行，循环往复。这种操作给你了并行执行多个程序的假象，或者一个程序同时做多件事情（如果使用了多线程）的假象。这就有了并发，但真正的并行 -- 同时运行多个进程的能力 -- 不存在的。

今天的现代 CPU 都不止一个核，那每一个核同时都能执行一个单独的操作。这就意味着有个多个核，真正的并行就可能实现了。例如，我的 Intel Core i7 有 4 个核心：它同时可以执行 4 个不同的进程或者线程。

操作系统能够探测到 CPU 核心的数量，并将进程或者线程分配给每一个核心。一个线程可能分配给任意一个核，这种调度对程序来说是完全透明的。此外，在所有核心都繁忙时，抢占式多任务处理就会起作用。这就让你能够运行的进程和线程数量比你机器实际的核心数量多。


### 单核上的多线程：有意义吗？

真正的并行在单核机器上是不可能的。但多线程程序萦绕就有意义，但一个进程起了多个线程，抢占式多任务处理依然可以让你的应用保持运行，即使其中一个线程执行得非常慢或者被阻塞了。

假如说你正在开发一个桌面应用，它要从一个非常慢的磁盘读数据。如果你的程序只用一个线程，那整个程序就假死了，直到磁盘操作完成：假设只有这一个线程，那 CPU 在等待磁盘操作完成时就浪费掉了。当然，操作系统还运行了许多其他进程，但你那个应用没有半点进展。

让我们重新想象一下你的应用的多线程方式下。线程 A 负责磁盘访问，而线程 B 负责主界面。如果 A 由于磁盘设备较慢而陷入等待，那么 B 仍然可以继续运行，让你的程序保持可响应状态。这是因为有 2 个线程，操作系统可以在他们之间切换 CPU 资源，而不用一直陷死到较慢的那个线程。

## 线程越多，问题越多

我们都知道，线程共享他们进程的内存块。这让一个应用中的多个线程交换数据非常简单。例如：一个电影编辑器可能拥有一大块进程内共享的内存，里面包含了视频的时间线。这块内存可以被几个用于渲染视频的工作线程使用。他们都只需要一个句柄（比如说，一个指针）来读取这块内存。

事情一切顺利，只要多个线程只从相同的内存地址读数据。但只要有一个线程要向这块内存写数据，而其他的都是要读，那麻烦就来了。这里会出现 2 个问题：

- **数据竞争** -- 当一个写线程修改内存的时候，一个渲染线程可能正在读里面的数据。如果渲染线程在读的时候，写操作还没有完成，那渲染线程读到的可能就是损坏的数据。
- **竞争条件** -- 读线程应该只能在写完后读。那反过来怎么办？比数据竞争更微妙的是，一个竞争条件，多个线程以不可预知的顺序在执行，而实际上这些操作只有在正确顺序下才能正确完成。你的程序可能会触发竞争条件，即便它免于数据竞争。

### 线程安全的概念

要说一段代码是 **线程安全** 的，那它要正确工作，而没有数据竞争，也没有竞争条件，即使多个线程同时执行这段代码。你可能注意到一些编程库声称他们是线程安全的：如果你要编写多线程程序，你可能想要确保其他第三方函数在多个线程中同时使用而不会触发并发问题。


## 数据竞争的根本原因

我们知道一个 CPU 核心一次只能执行一个机器指令。我们称这些执行是 **原子的**，因为他们不能再分了：就是不能再分成更小的操作了。希腊语中的 "atom" 就是 *不可再分* 的意思。

这种不可再分的特性使得原子操作自然是线程安全的。当一个线程在一个共享数据上执行原子写操作，其他线程在写操作没有完成前是不能读的。反过来，当一个线程在执行原子读的时候，它读到了完整的数据，对于一个线程来说，没有方法可以 *偷越* 原子操作，自然就没有数据竞争发生了。

坏消息是大量的常用操作并不是原子的。即使像 `x = 1` 这样细小的赋值操作，在一些硬件上也是由多个原子的机器指令组成，使得这个赋值操作就是非原子操作了。那么如果一个线程在读 `x` 时别的线程在执行赋值操作，数据竞争就发生了。


## 竞争条件的根本原因

抢占式多任务处理给了操作系统在线程管理上的完全控制：它可以根据高级的调度算法来启动、停止或者暂停线程。你作为程序员并不能控制时间或者执行顺序。实际上，即便是下面这种简单的代码也不能保证：

```
writer_thread.start()
reader_thread.start()
```

这段代码以指定顺序启动了 2 个线程。如果你多次运行程序，你会发现每次运行的表现都不一样：有时 writer 先执行，有时 reader 先执行。如果你的程序需要 writer 一定在 reader 前执行的话，那么恭喜你，你触发了一次竞争条件。

这种行为被称作 **不确定性**：结果每次都改变，你无法预言。调试一个受竞争条件影响的程序非常恼人，因为你无法以可控的方式复现问题。


## 使得线程相处：并发控制

数据竞争和竞争条件都是真实存在的问题：有人甚至[因他们而死](https://en.wikipedia.org/wiki/Therac-25)。容纳多个并发线程的艺术被称为 **并发控制**：操作系统和编程语言提供了一些解决方案。主要的几条如下：

- **同步** -- 是一种确保一个资源一次只会被一个线程使用的方法。同步是把那部分特殊的代码“保护”起来，使得多个并发线程不会同时执行到它，进而不会损坏你的共享数据；
- **原子操作** -- 一系列的非原子操作（比如前面说的赋值操作）可以通过操作系统提供的特殊指令而变成原子的。这样的话，共享数据永远都是可用状态，不用再担心有多少线程使用它了。
- **不可变数据** -- 共享数据被标记成不可变的，什么也无法改变它：线程只允许读取数据，这样就消除了根本原因。我们知道多个线程是可以安全地同时读取共享数据，只要没人修改它。这也是[函数式编程](https://en.wikipedia.org/wiki/Functional_programming)的主要哲学。

我将在这个 mini 系列的下一章讲述所有迷人的细节。敬请关注。


## 资料来源

8 bit avenue - [Difference between Multiprogramming, Multitasking, Multithreading and Multiprocessing](https://www.8bitavenue.com/difference-between-multiprogramming-multitasking-multithreading-and-multiprocessing/)

Wikipedia - [Inter-process communication](https://en.wikipedia.org/wiki/Inter-process_communication)

Wikipedia - [Process (computing)](https://en.wikipedia.org/wiki/Process_%28computing%29)

Wikipedia - [Concurrency (computer science)](https://en.wikipedia.org/wiki/Concurrency_%28computer_science%29)

Wikipedia - [Parallel computing](https://en.wikipedia.org/wiki/Parallel_computing)
Wikipedia - [Multithreading (computer architecture)](https://en.wikipedia.org/wiki/Multithreading_%28computer_architecture%29)

Stackoverflow - [Threads & Processes Vs MultiThreading & Multi-Core/MultiProcessor: How they are mapped?](https://stackoverflow.com/questions/1713554/threads-processes-vs-multithreading-multicore-multiprocessor-how-they-are)

Stackoverflow - [Difference between core and processor?](https://stackoverflow.com/questions/19225859/difference-between-core-and-processor)

Wikipedia - [Thread (computing)](https://en.wikipedia.org/wiki/Thread_%28computing%29)

Wikipedia - [Computer multitasking](https://en.wikipedia.org/wiki/Computer_multitasking)

Ibm.com - [Benefits of threads](https://www.ibm.com/support/knowledgecenter/en/ssw_aix_71/com.ibm.aix.genprogc/benefits_threads.htm)

Haskell.org - [Parallelism vs. Concurrency](https://wiki.haskell.org/Parallelism_vs._Concurrency)

Stackoverflow - [Can multithreading be implemented on a single processor system?](https://stackoverflow.com/questions/16116952/can-multithreading-be-implemented-on-a-single-processor-system)

HowToGeek - [CPU Basics: Multiple CPUs, Cores, and Hyper-Threading Explained](https://stackoverflow.com/questions/16116952/can-multithreading-be-implemented-on-a-single-processor-system)

Oracle.com - [1.2 What is a Data Race?](https://docs.oracle.com/cd/E19205-01/820-0619/geojs/index.html)

Jaka's corner - [Data race and mutex](http://jakascorner.com/blog/2016/01/data-races.html)

Wikipedia - [Thread safety](https://en.wikipedia.org/wiki/Thread_safety)

Preshing on Programming - [Atomic vs. Non-Atomic Operations](https://preshing.com/20130618/atomic-vs-non-atomic-operations/)

Wikipedia - [Green threads](https://en.wikipedia.org/wiki/Green_threads)

Stackoverflow - [Why should I use a thread vs. using a process?](https://stackoverflow.com/questions/617787/why-should-i-use-a-thread-vs-using-a-process)


---

本文翻译自 TRIANGLES 的文章，原文发布在 [**internal / pointers](https://www.internalpointers.com/post/gentle-introduction-multithreading)。

