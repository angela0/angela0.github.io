---
layout: post
title:  "并发与并行之不同"
data: 2019-04-11
categories:
- Translate
tags:
- concurrency
- parallelism
- 并发
- 并行
---

你听起来似乎并发和并行没什么不同，这是因为你不了解问题的本质。让我们来看看它们有啥不同。

![](https://luminousmen.com/media/concurrency-and-parallelism-are-different.jpg)

**并发** 是指应用内的多个任务在同一时间同时被处理。一个重要的细节是，这些任务**不一定同时被执行**（但可能是同时执行的）。所以它们可以分为更小的、可交替的任务。比如，线程可以同时执行，但这不是必需的。

任务之间没什么联系，那么谁先结束谁后结束就没多大关系了。因此并发可以有多种实现方式 -- 绿色线程、进程、只工作在一个 CPU 上的异步操作等等。

让我们进行类比：秘书接听电话，但有时会检查会议安排。他需要停止接听电话才能前往办公桌检查会议安排，然后继续接电话并重复此过程，直到这一天结束。

就像你注意到的，并发更多注重组织工作。要不然秘书只能等待到会议时间到了只有做好安排才能去接电话。

![](https://luminousmen.com/media/concurrency.jpg)


**并行** 是任务同时执行。从它的名字就能看出任务是并行执行的。并行是通过抽象工作线程或进程来实现并发执行的方法之一。此外，为了实现并行，必须至少有两个 CPU 核心。

回到办公室的例子：现在我们有 2 个秘书。一个接电话，另一个安排会议。工作一分为二了，因为办公室里有 2 个秘书在工作。

![](https://luminousmen.com/media/parallelism.jpg)

**并行是并发的子集**：在执行多个同时任务之前，你必须先正确的组织它们。

我建议你读一下 [Andrew Gerrand 的文章](https://blog.golang.org/concurrency-is-not-parallelism)，看一下 [Rob Pike 的演讲](https://vimeo.com/49718712)。

---

本文翻译自 [luminousmen](https://luminousmen.com/) 发表在其博客上文章，原文地址在 [Concurrency and parallelism are two different things](https://luminousmen.com/post/concurrency-and-parallelism-are-different)。