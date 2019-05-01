---
layout: post
title:  "数数文件夹中有多少文件"
data: 2019-05-02
categories:
- Howto
---

本文教你查看文件夹中文件数量的方法。（注：针对 Beginner 的小文，老司机不用点进来了）

不像图形界面，在命令行里面不能直接看出文件夹中有多少文件 -- 当然你可以通过修改 `PS1` 或者其他插件来实现这一功能 -- 但通常我们觉得没有必要。

这个工作看起来还是蛮简单的，只要你知道了 `wc` 命令和 `ls` 命令的用法。但实际情况根据你的目的还是有一些小复杂的。

<!-- more -->

开始之前，让我们先用 `ls` 命令看看文件夹中的内容：

```
abhishek@linuxhandbook:~/tutorials$ ls -la
total 64
drwxr-xr-x 4 abhishek abhishek 4096 Apr 29 17:53 .
drwxr-xr-x 55 abhishek abhishek 4096 Apr 29 15:50 ..
-rwxr–r– 1 abhishek abhishek 456 Mar 6 16:21 agatha.txt
-rw-r–r– 1 abhishek abhishek 0 Apr 16 19:53 .a.t
-rwxr–r– 1 abhishek abhishek 140 Mar 22 16:41 bash_script.sh
-rw-rw-r– 1 abhishek abhishek 95 Feb 11 13:12 cpluplus.cpp
-rw-r–r– 1 abhishek abhishek 1778 Apr 29 16:16 my_zip_folder.zip
drwxr-xr-x 4 abhishek abhishek 4096 Apr 19 19:07 newdir
-rw-r–r– 1 abhishek abhishek 163 Apr 13 15:07 prog.py
-rw-r–r– 1 abhishek abhishek 19183 Mar 18 18:46 services
-rw-r–r– 1 abhishek abhishek 356 Dec 11 21:35 sherlock.txt
-rwxrw-r– 1 abhishek abhishek 72 Jan 21 15:44 sleep.sh
drwxr-xr-x 3 abhishek abhishek 4096 Jan 4 20:10 target
```

你可以看到一共有 9 个文件（包括一个隐藏文件）和 2 个文件夹。这是比较少，你可以数出来，多的话怎么办呢？


## 数数有多少文件和文件夹（不包含隐藏文件）

这个非常简单：

``` bash
ls | wc -l
```

输出是这样的：

```
abhishek@linuxhandbook:~/tutorials$ ls | wc -l
10
```

这个命令的问题是它不算隐藏文件，所以结果是 10 而不是 11。


## 带上隐藏文件

这就需要用到 `ls` 命令的 `-A` 标志了。我们知道，`-a` 的话用把 `.` 和 `..` 也输出，这不是我们想要的，所以我们使用 `-A`：

``` bash
ls -A | wc -l
```

我们如愿以偿得到了 11 这个结果。


## 带上子文件夹

那如果我们想要数数包含子文件夹的所有文件怎么办呢？别急，我们还有 `tree` 命令：

``` bash
abhishek@linuxhandbook:~/tutorials$ tree -a
.
├── agatha.txt
├── .a.t
├── bash_script.sh
├── cpluplus.cpp
├── my_zip_folder.zip
├── newdir
│   ├── new_dir
│   │   ├── c.xyz
│   │   ├── myzip1.zip
│   │   └── myzip2.zip
│   └── test_dir
│   ├── c.xyz
│   ├── myzip1.zip
│   └── myzip2.zip
├── prog.py
├── services
├── sherlock.txt
├── sleep.sh
└── target
├── agatha.txt
├── file1.txt
└── past
├── file1.txt
├── file2.txt
└── source1
└── source2
└── file1.txt
7 directories, 19 files
```

最后一行的统计信息很明确啦。但需要知道的是，`tree` 命令很有可能需要你自己安装。


## 只数文件

这就需要祭出我们强大的 `find` 命令了：

``` bash
find . -type f | wc -l
```

这会在当前文件夹及其子文件夹中找到所有的普通文件。如果你只想看看当前文件夹的，需要在 `find` 命令上下点功夫：

``` bash
find . -maxdepth 1 -type f | wc -l
```


## 总结

在 Linux 中，你有无数中方法来实现这个目的。这就是 Linux（Unix）哲学的好处。我相信你可以尝试其他命令来实现！


## 写在最后

这篇小文的主要内容来自 [Count Number of Files in a Directory in Linux](https://linuxhandbook.com/count-files-directory-linux/)。