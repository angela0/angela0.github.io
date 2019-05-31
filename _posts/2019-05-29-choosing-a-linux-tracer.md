---
layout: post
title:  "选择一个 Linux 跟踪器(2015)"
start: 2019-05-17
data: 2019-05-29
uuid: 85102788034068275503171465196289229726
categories:
- Translate
tag:
- Linux
---

追踪器是一种高级的性能分析及优化工具，但别让这吓到你... 如果你用过 strace(1) 或者 tcpdump(8) 那你就用过追踪器。系统追踪器不止能看
到系统调用或者报文，它们通常能追踪任何内核或者应用软件。

Linux 上有许多追踪器，所以选择众多。由于每个人都有官方（或非官方）小马玉米吉祥物，我们有足够的儿童节目啦。

![](/assets/img/85102788034068275503171465196289229726/000.png)

哪我们应该用哪种追踪器呢？

<!-- more -->

我从两个受众来回答这个问题：大多数人和内核性能工程师。这可能随着时间推移而变化，所以我将会发布后续文章，可能每年一次。


## 对于大多数人

大多数人（开发者、系统管理员、开发运维工程师(DEVOPS)、SRE 等等）不用去学习系统追踪器的细节。你最可能需要知道以及做的是：

### 1. 使用 `perf_events` 进行 CPU 剖析

结果可以用 [flame graph](http://www.brendangregg.com/FlameGraphs/cpuflamegraphs.html) 来可视化。例如：

```
git clone --depth 1 https://github.com/brendangregg/FlameGraph
perf record -F 99 -a -g -- sleep 30
perf script | ./FlameGraph/stackcollapse-perf.pl | ./FlameGraph/flamegraph.pl > perf.svg
```
 
Linux `perf_events` (又叫 "perf", 这是它的命令) 是 Linux 用户的官方追踪器/剖析器。它是内核带的工具，并维护得很好（现在还在快速增强
）。一般情况可以通过 `linux-tools-common` 包来安装。

`perf` 可以做很多事情，但如果我必须要推荐你只学习一个，那肯定是 CPU 剖析。尽管这从技术上讲并不算事件“追踪”，因为它是取样。最难的部分是获得完整的堆栈和符号，这我在 [Linux Profiling at Netflix](http://www.brendangregg.com/blog/2015-02-27/linux-profiling-at-netflix.html) 演讲中有说到。

![](/assets/img/85102788034068275503171465196289229726/001.png)

### 2. 知道它还能干什么

就像一个朋友说的：“你不需要知道如果操作一台 X 光机，但你*需要*知道如果你吞了一分钱，你需要做 X 光。”你需要知道跟踪器能干什么，以在你以后需要的时候学习它，或者是雇人去做。

简而言之：通过跟踪可以理解几乎任何事物的表现。文件系统内部，TCP/IP 处理，设备驱动程序，应用程序内部。阅读我在 lwn.net 上关于 `ftrace` 文章，并看看我的 [`perf_events`](http://www.brendangregg.com/perf.html) 页面，可以作为一些跟踪（和分析）功能的示例。

### 3. 寻找前端

如果你要为性能分析工具付费的话（确实有许多公司在卖），去寻求 Linux 追踪支持吧。想象一下直观的点击式界面就可以展示内核内部，包括不同堆栈位置的延迟热图。我在 [Monitorama 演讲](http://www.brendangregg.com/blog/2015-06-23/netflix-instance-analysis-requirements.html) 中提到了这样一个工具。

我自己创建并开源了一些前端，但是对于 CLI（不是 GUI）。这些也使人们能够更快速、轻松地受益于从追踪器。例如，用我的 [perf 工具](http://www.brendangregg.com/blog/2015-03-17/linux-performance-analysis-perf-tools.html)中，跟踪一个新进程：

```
# ./execsnoop
Tracing exec()s. Ctrl-C to end.
   PID   PPID ARGS
 22898  22004 man ls
 22905  22898 preconv -e UTF-8
 22908  22898 pager -s
 22907  22898 nroff -mandoc -rLL=164n -rLT=164n -Tutf8
[...]
```

在 Netflix，我们创造了 [Vector](http://techblog.netflix.com/2015/04/introducing-vector-netflixs-on-host.html)，它是一个实例分析工
具，本质上应该也是一个 Linux 追踪器的前端。


## 对于性能/内核工程师

我们的工作要困难得多，因为大多数人可能会要求我们弄清楚如何追踪某些东西，以及使用哪种追踪器。要正确理解追踪器，通常需要花费至少一百个小时。了解所有 Linux 追踪器，以便在它们之间作出合理的决定是一项艰巨的任务。（我可能是唯一一个接近这样做的人。）

我的推荐是，要么：

A) 选择一个全能的追踪器，并对其进行标准化。这将需要花费大量时间来在测试环境中确定它们的细微差别和安全性。我目前推荐最新版本的 SystemTap（即从[源代码](https://sourceware.org/git/?p=systemtap.git;a=blob_plain;f=README;hb=HEAD)构建）。我知道很多公司选择了 LTTng，并对它感到满意，虽然它不是那么强大（尽管它更安全）。如果 sysdig 添加了跟踪点或 kprobes，它可以是另一个候选项。

B) 通过我在 [Velocity tutorial](http://www.slideshare.net/brendangregg/velocity-2015-linux-perf-tools) 中使用的流程图来判断。这意味着会尽可能多地使用 `ftrace` 或 `perf_events`，`eBPF`, 因为这些都是内核集成的，然后是 SystemTap/LTTng 等其它追踪器来填补空白。这就是我目前在 Netflix 的工作。

![](/assets/img/85102788034068275503171465196289229726/002.png)

### 对各个追踪器的评价

1. `ftrace`

    我爱 [ftrace](http://lwn.net/Articles/370423/)。它是内核黑客最好的朋友。它内置于内核，可以使用 tracepoint、kprobe 和 uprobe，并提供一些功能：事件跟踪、带有可选的过滤器和参数；事件计数和计时，内核概述；以及函数流遍历。示例请参阅内核源代码中的 [ftrace.txt](https://www.kernel.org/doc/Documentation/trace/ftrace.txt)。它通过 `/sys` 控制，只适用于 root 用户（尽管你可以使用缓冲区实例 hack 成多用户支持）。它的界面有时可能很繁琐，但它很容易 hack，并且有前端：`ftrace` 的主要作者 Steven Rostedt 创建了 `trace-cmd`，并且我还创建了 `perf-tools` 集合。我对它最大的意见是不可编程，比如，你不能保存和获取时间戳，计算延迟，然后将其存储为直方图。你需要费一点儿劲将事件转储到用户级然后处理。它可以通过 `eBPF` 编程。

2. `perf_events`

    [perf_events](https://perf.wiki.kernel.org/index.php/Main_Page) 是 Linux 用户的主要追踪工具，它的源代码在 Linux 内核中，一般通过 `linux-tools-common` 包安装。也叫 “perf”，即它的前端，常用来跟踪并转储到文件（perf.data），它相对有效地进行（动态缓冲），然后进行后处理。它可以完成 ftrace 能做的大部分工作。但不能进行函数流遍历，并且不那么易于 hack（因为它具有更好的安全性/错误检查）。但它可以进行性能分析（采样）、CPU 性能计数器、用户级堆栈转换，并且可以使用 debuginfo 对本地变量进行跟踪。它还支持多个并发用户。与 ftrace 一样，它还不是内核可编程的，直到将来可能的 eBPF 支持（已经提出补丁）。如果要我推荐一个跟踪器去学习，那就是 perf，因为它可以解决大量问题，而且相对安全。


3. `eBPF`

    扩展的 Berkeley 包过滤器（extended Berkeley Packet Filter）是内核中的虚拟机，可以有效地在事件上运行程序（JIT）。它很可能为 ftrace 和 perf 提供内核编程并且能增强其它追踪器。它现在还在由 Alexei Starovoitov 开发中，还没有完全集成在内核，但已经有一些非常棒的内核（4.1 版本）工具了：比如，块设备 I/O 的延迟热图。更多内容参考 Alexei 的 [BPF 幻灯片](http://www.phoronix.com/scan.php?page=news_item&px=BPF-Understanding-Kernel-VM) 和 [eBPF 样例](https://github.com/torvalds/linux/tree/master/samples/bpf)。

4. `SystemTap`

    [SystemTap](https://sourceware.org/systemtap/wiki) 是最强大的追踪器。它可以做任何事：profiling， tracepoints， kprobes， uprobes（它就来自于 SystemTap），USDT，内核编程等等。它将程序编译为内核模块并加载它们 -- 这样比较不安全。它也是以 out-of-tree 形式开发的（译注：out-of-tree 的解释参见 [stackexchange](https://unix.stackexchange.com/questions/208638/linux-kernel-meaning-of-source-tree-in-tree-and-out-of-tree)），过去曾经有过问题（错误/panic 或 死机/freeze）。许多并不是 SystemTap 的错 -- 通常是首次在内核中使用某些跟踪功能，因而首次遇到错误。SystemTap 的最新版本要好得多了（你必须从源代码编译），但许多人仍然对早期版本感到害怕。如果您想使用它，请在测试环境中花一些时间，并与 irc.freenode.net 上 #systemtap 频道中的开发人员交流。（Netflix 有一个容错架构，我们使用过 SystemTap，但我们可能不太关心安全性）。我最大的意见是它似乎认为你有内核 debuginfo，但我通常并没有。它实际上可以做很多事情，但缺乏文档和示例（我已经开始自己做）。

5. `LTTng`

    [LTTng](http://lttng.org/) 拥有优化的事件收集，它的性能要好于其它追踪器，并且支持非常多的事件类型，包括 USDT。也是以 out-of-tree 形式开发的。它的核心很简单：通过一个小的固定指令集向追踪缓冲里写事件。这让它既安全又快。缺点是没有简单的方法来多内核编程。我经常听到说这没什么大不了的，因为它已经优化得很好了，即使需要后期处理，也可以进行充分扩展。它也开创了一种不同的分析技术，主要是一个黑盒，记录了所有感兴趣的事件，可以以后在 GUI 中研究。我担心这样会缺失那些我没有事先想要记录的事件，但我真的需要花更多的时间来观察它在实践中的效果。这是我花费最少时间的追踪器（没有特别的原因）。

6. `ktap`

    [ktap](http://ktap.org/) 是一个非常有前途的追踪器，它使用内核中的 lua 虚拟机进行处理，并且不需要 debuginfo 也能工作得很好，在嵌入式设备上也能很好地工作。它进入了升级阶段，似乎它会在 Linux 上赢得跟踪器这场竞赛。因为 eBPF 开始内核集成，所以 ktap 集成被推迟了，直到它可以使用 eBPF 而不是自己的 VM。由于 eBPF 在接下来几个月仍在整合，因此 ktap 开发人员已经等了很长时间。我希望它能在今年晚些时候重新开始开发。

7. `dtrace4linux`

    [dtrace4linux](https://github.com/dtrace4linux/linux) 主要是一个人兼职（Paul Fox）将 Sun DTrace 移植到 Linux 上。它令人印象深刻，有些提供商也在努力，从某些方面来说是完成了，但更多的是一个实验工具（不安全）。我认为由于许可的原因使得人们不愿意做出贡献：它可能永远不会进入 Linux 内核，因为 Sun 根据 CDDL 许可证发布了DTrace；保罗对此的处理方法是将其作为附加组件。我很想在 Linux 上看到 DTrace 并完成这个项目，并且当我加入 Netflix 时，我认为我会花时间帮助它完成。但是，我一直在使用内置的跟踪器 ftrace 和 perf_events。

8. `OL DTrace`

    [Oracle Linux DTrace](http://docs.oracle.com/cd/E37670_01/E38608/html/index.html) 正艰巨地努力将 DTrace 引入 Linux，特别是 Oracle Linux。多年来的各种发布都取得了稳步进展。开发人员甚至谈到了改进 DTrace 测试套件的问题，该测试套件对项目有促进作用。许多有用的功能已经完成：syscall，profile，sdt，proc，sched 和 USDT。我还在等待 fbt（函数边界跟踪，用于内核动态跟踪），这在 Linux 内核上会很棒。它最终能否成功取决于它是否足以吸引人们运行 Oracle Linux（并为支持付费）。另一个问题是它可能不是完全开源的：内核组件是，但我还没有看到用户级代码。

9. `sysdig`

    [sysdig](http://www.sysdig.org/) 是一个新的跟踪器，可以使用类似 tcpdump 的语法和 lua 后期处理操作系统调用事件。令人印象深刻的是，很高兴看到系统追踪领域的创新。它的局限性在于它目前只有系统调用，并且它将所有事件转储到用户级以进行后期处理。虽然我希望看到它支持 tracepoints，kprobes 和 uprobes，但你可以使用系统调用做很多事情了。我还希望看到它支持 eBPF，用于内核摘要。sysdig 开发人员目前正在添加容器支持。关注这个领域吧。


## 扩展阅读

我自己针对追踪器的工作包括：

**ftrace**： 我的 [perf-tools](http://www.brendangregg.com/blog/2015-03-17/linux-performance-analysis-perf-tools.html) 工具集（参考样例目录）；我在 lwn.net 上关于 [ftrace 的文章](http://lwn.net/Articles/608497/)；[LISA14 演讲](http://www.brendangregg.com/blog/2015-03-17/linux-performance-analysis-perf-tools.html)；还有这些文章：[function counting](http://www.brendangregg.com/blog/2014-07-13/linux-ftrace-function-counting.html)，[iosnoop](http://www.brendangregg.com/blog/2014-07-16/iosnoop-for-linux.html)，[opensnoop](http://www.brendangregg.com/blog/2014-07-25/opensnoop-for-linux.html)，[execsnoop](http://www.brendangregg.com/blog/2014-07-28/execsnoop-for-linux.html)，[TCP retransmits](http://www.brendangregg.com/blog/2014-09-06/linux-ftrace-tcp-retransmit-tracing.html)，[uprobes](http://www.brendangregg.com/blog/2015-06-28/linux-ftrace-uprobe.html)，[USDT](http://www.brendangregg.com/blog/2015-07-03/hacking-linux-usdt-ftrace.html)。

**perf_events**：我的 [perf_events 示例页面](http://www.brendangregg.com/perf.html)； 一个针对 SCALE 的演讲 [Linux Profiling at Netflix](http://www.brendangregg.com/blog/2015-02-27/linux-profiling-at-netflix.html)；文章 [CPU Sampling](http://www.brendangregg.com/blog/2014-06-22/perf-cpu-sample.html)，[Static Tracepoints](http://www.brendangregg.com/blog/2014-06-29/perf-static-tracepoints.html)，[Heat Maps](http://www.brendangregg.com/blog/2014-07-01/perf-heat-maps.html)，[Counting](http://www.brendangregg.com/blog/2014-07-03/perf-counting.html)，[Kernel Line Tracing](http://www.brendangregg.com/blog/2014-09-11/perf-kernel-line-tracing.html)，[off-CPU Time Flame Graphs](http://www.brendangregg.com/blog/2015-02-26/linux-perf-off-cpu-flame-graph.html)。

**eBPF**： [文章 eBPF: One Small Step](http://www.brendangregg.com/blog/2015-05-15/ebpf-one-small-step.html) 以及一些工具 [BPF-tools](https://github.com/brendangregg/BPF-tools) （我需要再发布一些）。

**SystemTap**：很久之前写过一篇[使用 SystemTap](http://dtrace.org/blogs/brendan/2011/10/15/using-systemtap/) 的文章，有点过时了。最近我发布 [https://github.com/brendangregg/systemtap-lwtools](https://github.com/brendangregg/systemtap-lwtools)，展示了 SystemTap 如果在没有内核 debuginfo 时使用。

**LTTng**： 用过一点点，不够写的。

**ktap**： 我的 [ktap 示例](http://www.brendangregg.com/ktap.html) 中包含了一些单行命令以及一些脚本，尽管这些都是针对更早版本的。

**dtrace4linux**： 我在 [Systems Performance 这本书里](http://www.brendangregg.com/sysperfbook.html) 包含了一些例子，并且过去我也做了一些 bug 修复，比如[时间戳](https://github.com/dtrace4linux/linux/issues/55)。

**OL DTrace**： 因为这是 DTrace 的直接移植, 很多我之前关于 DTrace 的工作应该都相关 (链接太多就不列了，可以在[我的首页](http://www.brendangregg.com/)搜索)。一旦更加完整，我可能会开发一些特定的工具。

**sysdig**： 我贡献了 [fileslower](https://github.com/brendangregg/sysdig/commit/d0eeac1a32d6749dab24d1dc3fffb2ef0f9d7151) 和 [subsecond offset spectrogram](https://github.com/brendangregg/sysdig/commit/2f21604dce0b561407accb9dba869aa19c365952)。

其它： 我曾写过一篇关于 [strace](http://www.brendangregg.com/blog/2014-05-11/strace-wow-much-syscall.html) 的警告文章。

求求你，够多了，不要再来了！！！如果你在想为什么 Linux 不能只有一种追踪器，或者就 DTrace 吧，我在 [From DTrace to Linux 演讲中](http://www.brendangregg.com/blog/2015-02-28/from-dtrace-to-linux.html) 提到过，从幻灯片的 28 页开始。

感谢 Deirdré Straughan 的编辑, 以及制作了这些小马驹 (使用了 General Zoi 的小马驹制作器).

---

本文翻译自 [Brendan D. Gregg](http://www.brendangregg.com) 发表于其博客的文章 [Choosing a Linux Tracer (2015)](http://www.brendangregg.com/blog/2015-07-08/choosing-a-linux-tracer.html)。
