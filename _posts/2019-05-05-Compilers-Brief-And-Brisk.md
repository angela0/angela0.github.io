---
layout: post
title:  "编译器架构概览"
data: 2019-05-05
uuid: 172898069233232527398201728856511025806
published: false
categories:
- Translate
tag:
- Compiler
---

大部分的编译器架构都长这样：

![](/assets/img/172898069233232527398201728856511025806/001-Compiler_design.svg)

<!-- more -->


## 前言

在本文中，我打算逐步详细地剖析这个架构。

考虑一下本文是编译器上过多资源的补充。它作为一个独立的资源存在，让您的脚趾在编程语言设计和实现的世界中变得潮湿。

本文的读者是关于编译器如何工作的知识非常有限的人，即您知道他们最多编译成汇编。虽然我确实认为读者对数据结构和算法有很好的理解。

它绝不反映具有数百万行代码的现代“生产”编译器！而是一个非常简短/快速的“傻瓜”资源编译器，以了解编译器中发生的事情。


## 介绍

目前，我正在研究一种名为Krug的编程语言，这是一种系统编程语言，它从Rust和Go中获得了很多灵感。我将在本文中多次引用Krug进行比较并帮助说明我的观点。Krug仍处于非常重要的发展阶段，但您可以在GitHub上的“krug-lang”组织中找到它作为caasper和krug。与典型的编译器体系结构相比，语言本身有点不寻常，这部分激发了我写这篇文章的灵感，尽管这将在文章中进一步讨论。


## Hello!

感谢你的阅读。希望你喜欢这篇文章。你可以在 Twitter [@Felix_Angell](https://twitter.com/Felix_Angell) 上关注我。

以后我可能会更新这篇文章，更新时，我可能会发推文通知。

如果你想编辑、更正文章或要求接下来的文章要写的内容，请随时给我发送[电子邮件](mailto:mail@felixangell.com)，

### 延展阅读

- [Jack Crenshaw](https://compilers.iecc.com/crenshaw/) -- 我进入编程语言实现领域的领门人
- [Crafting Interpreters](https://craftinginterpreters.com/)
- [An Introduction to LLVM (with Go)](https://blog.felixangell.com/an-introduction-to-llvm-in-go) -- 我的文章!
- [PL/0](https://en.wikipedia.org/wiki/PL/0)
- 龙书（The Dragon Book） -- 包罗一切的经典书籍
- [8cc](https://github.com/rui314/8cc)


---

本文翻译自 [FELIX ANGELL](https://blog.felixangell.com) 发表于其博客的文章 [A Brief And Brisk Overview of Compiler Architecture](https://blog.felixangell.com/compilers-brief-and-brisk)。
