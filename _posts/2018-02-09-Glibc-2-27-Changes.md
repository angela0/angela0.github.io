---
layout: post
title: "glibc 2.27 版本变动"
data: 2018-02-10
categories:
- Notes
tags:
- glibc
---

在 2018-02-02 gnu 发布了 glibc 2.27 版本，其中有很多修改，尤其是向后不兼容的修改，这里根据发布的邮件列表大致整理，如果有错误的地方请联系
我

原邮件列表地址：https://sourceware.org/ml/libc-alpha/2018-02/msg00054.html

### 主要的新特性

- 支持静态 PIE 可执行文件[^note_pie]

  详请参见 INSTALL 中的 --enable-static-pie 选项

  注意：使用 --enable-static-pie 选项编译的 libc.a 需要使用 gcc 8 的 -static-pie 来编译 PIE 可执行文件。并且该特性目前只支持 使用 binutils 2.29 的 i386、x86\_64 和 x32 平台，以及 使用 binutils 2.30 版本的 aarch64。

- 使用 FMA 指令集优化了 x86\_64 平台的以下函数

  asin, atan2, exp, expf, log, pow, atan, sin, cosf, sinf, sincosf, tan

- 使用 SSE4.1 指令集优化了 x86\_64 平台下的以下函数

  trunc, truncf

- 优化了通用的以下函数

   expf, exp2f, logf, log2f, powf, sinf, cosf, sincosf

- malloc 系列函数在检测到 heap corruption 的使用不再打印失败的地址以及栈帧

- abort 函数会立即终止进程，而不再刷新标准输入输出流

- 在以下 long double 类型是 IEEE 128位格式的平台上，math 库为该该类型实现了\_Float128

  aarch64, alpha, mips64, riscv, s390, sparc

- 在支持 \_Float64x 的以下平台上，math 库实现了接口

  aarch64, alpha, i386, ia64, mips64, powerpc64le, riscv, s390, sparc, x86\_64

- math 库为以下类型实现了接口

  \_Float32, \_Float64, \_Float32x

- 在 Linux 平台实现了memfd\_create 函数 和 mlock2 函数

- 添加了内存保护关键字，头文件 <sys/mman.h> 中声明了以下函数

  pkey\_alloc, pkey\_free, pkey\_mprotect, pkey\_set, pkey\_get

- 增加了 copy\_file\_range 函数

- 为 sparc M7 平台优化了一下函数

   memcpy, mempcpy, memmove, memset

- ldconfig 处理 `include` 指令将使用 C/POSIX 整理序[^note_collation_order]

- 支持 RISC-V ISA 运行在 Linux 上

  注意：需要 binutils-2.30, gcc-7.3.0, linux-4.15 以上版本

  支持以下 ISA/ABI 对：

    - rv64imac lp64
    - rv64imafdc lp64
    - rv64imafdc lp64d


### 废弃/移除的特性，以及改变而影响兼容性的特性

-

- 废弃了对 调用了 dlopen 函数的静态链接程序 的支持，将在未来的版本中被移除

- 废弃了对 使用 stdio 内部数据结构和函数的旧程序 的支持，包括 GCC 2.95 中 libstdc++ 提供的 C++ stream

  使用以下内部符号的程序将不能在未来的 glibc 版本下正常工作:

  \_IO\_adjust\_wcolumn, \_IO\_default\_doallocate, \_IO\_default\_finish,
  \_IO\_default\_pbackfail, \_IO\_default\_uflow, \_IO\_default\_xsgetn,
  \_IO\_default\_xsputn, \_IO\_doallocbuf, \_IO\_do\_write, \_IO\_file\_attach,
  \_IO\_file\_close, \_IO\_file\_close\_it, \_IO\_file\_doallocate, \_IO\_file\_fopen,
  \_IO\_file\_init, \_IO\_file\_jumps, \_IO\_fileno, \_IO\_file\_open,
  \_IO\_file\_overflow, \_IO\_file\_read, \_IO\_file\_seek, \_IO\_file\_seekoff,
  \_IO\_file\_setbuf, \_IO\_file\_stat, \_IO\_file\_sync, \_IO\_file\_underflow,
  \_IO\_file\_write, \_IO\_file\_xsputn, \_IO\_flockfile, \_IO\_flush\_all,
  \_IO\_flush\_all\_linebuffered, \_IO\_free\_backup\_area, \_IO\_free\_wbackup\_area,
  \_IO\_init, \_IO\_init\_marker, \_IO\_init\_wmarker, \_IO\_iter\_begin, \_IO\_iter\_end,
  \_IO\_iter\_file, \_IO\_iter\_next, \_IO\_least\_wmarker, \_IO\_link\_in,
  \_IO\_list\_all, \_IO\_list\_lock, \_IO\_list\_resetlock, \_IO\_list\_unlock,
  \_IO\_marker\_delta, \_IO\_marker\_difference, \_IO\_remove\_marker, \_IO\_seekmark,
  \_IO\_seekwmark, \_IO\_str\_init\_readonly, \_IO\_str\_init\_static,
  \_IO\_str\_overflow, \_IO\_str\_pbackfail, \_IO\_str\_seekoff, \_IO\_str\_underflow,
  \_IO\_switch\_to\_main\_wget\_area, \_IO\_switch\_to\_wget\_mode,
  \_IO\_unsave\_wmarkers, \_IO\_wdefault\_doallocate, \_IO\_wdefault\_finish,
  \_IO\_wdefault\_pbackfail, \_IO\_wdefault\_setbuf, \_IO\_wdefault\_uflow,
  \_IO\_wdefault\_xsgetn, \_IO\_wdefault\_xsputn, \_IO\_wdoallocbuf, \_IO\_wdo\_write,
  \_IO\_wfile\_jumps, \_IO\_wfile\_overflow, \_IO\_wfile\_sync, \_IO\_wfile\_underflow,
  \_IO\_wfile\_xsputn, \_IO\_wmarker\_delta, or \_IO\_wsetb

  注意：和其他的符号移除不同，这些旧程序不支持使用兼容的符号

- 在 GNU/Linux 上，废除的常量 `PTRACE_SEIZE_DEVEL` 不再定义在 <sys/ptrace.h> 中

- libm 不再支持 SVID 错误处理或者 `_LIB_VERSION` 变量 来控制错误处理

  使用旧版本的 glibc 库依然可以工作

  不再提供 libieee.a 库

  math.h 中不再定义 exception 结构体或者 `X_TLOSS, DOMAIN, SING, OVERFLOW, UNDERFLOW, TLOSS, PLOSS, HUGE` 等宏

- libm 中的以下函数将不再支持新程序

  pow10, pow10f, pow10l

  可以使用标准名字 exp10, exp10f, exp10l

- 类型 mcontext\_t 将不再和 结构体 sigcontext 相同

- add-ons 机制被移除

  configure 的 --enable-add-ons 选项会被忽略

- configure 的 --without-fp 选项被忽略

- 以下函数将会检查指定的字符串是否能被作为域名解析

  res\_hnok, res\_dnok, res\_mailok, res\_ownok

- 在 malloc\_info 的输出中，<heap> 元素可能会包含其他的 <aspace> 元素"subheaps"，其中包含了子堆的数量

- libresolv 库中的函数 p\_secstodate 不再支持新的程序

- 不再支持 `tilepro-*-linux-gnu` 配置

- 废弃了非标准头文件 `<libio.h>` 和 `<_G_config.h>`，在未来的版本中将被移除


### 构建和运行时需求的修改

- bison 2.7 以及以上版本需要在 intl 子文件夹中生成代码

### 安全相关的修改

- CVE-2009-5064
- CVE-2017-15670
- CVE-2017-15671
- CVE-2017-15804
- CVE-2017-17426
- CVE-2017-1000408
- CVE-2017-1000409
- CVE-2017-16997
- CVE-2018-1000001
- CVE-2018-6485

[^note_pie]: pie 的[wiki](https://zh.wikipedia.org/wiki/%E5%9C%B0%E5%9D%80%E6%97%A0%E5%85%B3%E4%BB%A3%E7%A0%81)

[^note_collation_order]: 关于整理序的解释参见[这个wiki](http://wiki.analytica.com/index.php?title=Collation_Order)
