---
layout: post
title:  "使用 whereis 定位命令"
data: 2019-05-16
categories:
- Howto
tag:
- 命令行
- Linux
---

在之前的文章 [使用 which 定位命令](/which-command/) 中，我们介绍了如果查找一个命令的位置。这篇文章再介绍一个类似功能的命令
`whereis`。但 `whereis` 不仅能搜索命令，还包括命令的手册和源代码。

<!-- more -->


## 安装

`whereis` 命令来自于内核的 `util-linux` 包，所以基本所有的发行版都预装的有，你不用额外安装。


## 基本用法

`whereis` 的用法也比较简单：

```
whereis [options] [-BMS directory... -f] name...
```

其中选项有：

- `-b`

    只搜索二进制文件
- `-m`

    只搜索手册
- `-s`

    只搜索源代码
- `-u`

    只输出结果不止一个的条目
- `-B list`

    指定二进制的搜索路径
- `-M list`

    指定文档的搜索路径
- `-S list`

    指定源代码的搜索路径
- `-f`

    用于终止搜索路径。如果使用了 `-B`、`-M`、`-S` 就一定要使用 `-f`
- `-l`

    输出有效的搜索路径


## 示例

最简单的用法就是：

```
$ whereis whereis
whereis: /usr/bin/whereis /usr/share/man/man1/whereis.1.gz
```

再举个例子，搜索 `/bin` 目录下二进制不止一个的项目：

```
$ cd /bin
$ whereis -u -b -B /bin -f *
sh: /bin/sh /bin/sh.distrib
sh: /bin/sh /bin/sh.distrib
```

这里 sh 有两行输出是因为有 2 个相关的结果。


## whereis 的搜索路径

默认情况下 `whereis` 使用自己硬编码的路径，以及 `$PATH` 和 `$MANPATH` 这两个环境变量。要查看当前的搜索路径，就使用 `-l` 参数吧。


## 提示

`whereis` 提供了一个调试开关 `WHEREIS_DEBUG=all`，设置了该环境变量就会输出大量的调试信息。
