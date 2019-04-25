---
layout: post
title:  "Linux 文件时间戳"
data: 2019-04-25
categories:
- Howto
---

在 Linux 中，每个文件都有一些时间戳，用来记录文件什么时候被访问、被修改内容、被改动属性等等。让我们看看都有哪些时间戳吧。（注：针对 Beginner 的小文，老司机不用点进来了）

<!-- more -->

## 什么是 Linux 时间戳

任何 Linux 中的文件都有 3 个时间戳：

- atime -- 访问时间
- mtime -- 内容修改时间
- ctime -- 属性改动时间


### atime

atime 代表访问时间，是最后一次文件被访问的时间。访问指的是使用 cat，vim，less 或者其他工具读了这个文件。


### mtime

mtime 代表内容修改时间，是最后一次文件内容被修改的时间。修改指的是文件内容被编辑了。


### ctime

ctime 代表属性改动时间，是最后一次文件属性和元数据被改动的时间。元数据包括文件权限，属主，名字以及位置等。


## 如何查看文件的时间戳

`stat` 命令可以查看文件的详细信息，包括所有的时间戳。并且 `stat` 使用非常简单，后跟文件名就行了：

``` bash
stat <filename>
```

输出类似下面：

```
stat abhi.txt 
  File: abhi.txt
  Size: 0         	Blocks: 0          IO Block: 4096   regular empty file
Device: 10305h/66309d	Inode: 11936465    Links: 1
Access: (0644/-rw-r--r--)  Uid: ( 1000/abhishek)   Gid: ( 1000/abhishek)
Access: 2018-08-30 12:19:54.262153704 +0530
Modify: 2018-08-30 12:19:54.262153704 +0530
Change: 2018-08-30 12:19:54.262153704 +0530
 Birth: -
```

你可以看到上面的输出中有 3 个时间戳（access，modify，change）。这里它们都是一样的，那是因为这个文件是我刚用 `touch` 命令创建的。


如果我使用 `less` 命令查看一下文件，atime 就会改变，而 mtime 和 ctime 还和之前一样：

```
$ less abhi.txt 
$ stat abhi.txt 
  File: abhi.txt
  Size: 0             Blocks: 0          IO Block: 4096   regular empty file
Device: 10305h/66309d    Inode: 11936465    Links: 1
Access: (0644/-rw-r--r--)  Uid: ( 1000/abhishek)   Gid: ( 1000/abhishek)
Access: 2018-08-30 12:25:13.794471295 +0530
Modify: 2018-08-30 12:19:54.262153704 +0530
Change: 2018-08-30 12:19:54.262153704 +0530
 Birth: -
```

只要我用 `cat` 命令往文件里写些内容，mtime 就会改变，这样做可以不让 atime 改变（如果你用编辑器打开的话 atime 也会改变）。

```
$ cat >> abhi.txt 
 demo text
 ^C
$ stat abhi.txt 
  File: abhi.txt
  Size: 10            Blocks: 8          IO Block: 4096   regular file
Device: 10305h/66309d    Inode: 11936465    Links: 1
Access: (0644/-rw-r--r--)  Uid: ( 1000/abhishek)   Gid: ( 1000/abhishek)
Access: 2018-08-30 12:25:13.794471295 +0530
Modify: 2018-08-30 12:32:34.751320967 +0530
Change: 2018-08-30 12:32:34.751320967 +0530
 Birth: -
```

你有没有发现很奇怪的一点：你只是想改变 mtime，而 ctime 也一起改变了。你要记住，ctime 会随着 mtime 的改变而改变。因为 mtime 由用户控制，ctime 由系统控制，只要数据块改变或者元数据改变，ctime 就会改变，而当你修改文件内容是，数据块就改变了。

如果你只想修改 ctime，可以使用 `chmod` 命令或者 `chgrp` 命令修改文件权限。

你不能通过正常手段把 ctime 改到更早的时间。这是出于安全考虑，因为它是文件最后的修改时间。即使有人出于恶意把 mtime 改到更早的时间，ctime 也能显示文件最后修改的时间。


## 时间戳有什么用

时间戳主要用于分析。比如你可以看看一个文件最近是否被修改过。我常用的一个场景是看看程序日志文件最近修改是什么时候，来判断日志是否正常写入。还有就是上面提到的，可以判断是否有人恶意地访问或者修改这个文件。


## 如果知道文件的创建时间

你可能注意到了，上面的 `stat` 命令的输出包含了一个 `Birth` 字段，没错，它就是文件的创建时间。这个时间戳叫做创建时间戳（crtime），但并不是所有的文件系统都支持它。不过我们常用的 EXT4 文件系统是支持的。但这个版本的 `stat` 命令并不能显示这个值。


## 总结

- atime -- 访问时间
- mtime -- 内容修改时间
- ctime -- 属性改动时间（mtime 修改，ctime 也会修改）
- crtime -- 创建时间（不常用）


## 写在后面

这篇小文的原内容主要来自 [File Timestamps in Linux: atime, mtime, ctime Explained](https://linuxhandbook.com/file-timestamps/)。