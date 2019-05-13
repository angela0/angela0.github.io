---
layout: post
title:  "使用 which 定位命令"
data: 2019-05-13
categories:
- Tools
tag:
- 命令行
- Linux
---

有时候我们需要找到一个命令的位置，`which` 就派上用场了（你可自行查看 man 手册；如果你看过的话，就不用点进来了）。

<!-- more -->

它的原理很简单，就是在所有的 `PATH` 中搜索你要找的命令；并且它的用法也非常简单。

**注意：Debian 系列和 REDHAT 系列的 `which` 有些差别，REDHAT 系的有更多的搜索选项。但我使用的是 Debian，如果你使用 CentOS 等，可自行查看其 man 手册**。


## 安装

`which` 算是核心组件里的工具，所以几乎在所有的发行版里都有。


## 使用

如果你看了其 man 手册，短小到令人惊讶。用法非常简单：

```
which [-a] filename ...
```

只有一个选项 `-a`。默认情况下，当 `which` 搜索到目标就会停止，并输出路径；但如果加了 `-a` 选项，它会继续搜索，直到搜索 `PATH` 中的所有路径。

你看到它后面的 `...` 可能已经意识到它是可以跟多个搜索目标的，例如：

```
# which -a which bash
/usr/bin/which
/bin/which
/bin/bash
```

## 相关命令

和搜索文件位置相关的命令还有 `whereis` 、`locate` 和 `find` 等，以后会一一介绍。