---
layout: post
title:  "在 Linux 清空一个文件"
data: 2019-05-09
categories:
- Howto
tag:
- Linux
---

本文教你几种清空文件而不删除它的方法（注：针对 Beginner 的小文，老司机不用点进来了）

<!-- more -->

很多情况你都需要清空一个文件，比如你的日志文件巨大无比。

一个很不优雅的方法是先删除再创建个空文件。这不仅不优雅，还可能出现问题，因为它们不是同一个文件，时间戳和权限都可能不一样。

Linux 中有很多方法让你不必删除文件而清空它的内容。

## 使用 `truncate` 命令

最安全的方法就是 `truncate` 命令了。顾名思义，它就是用来截断文件的。

```
truncate -s 0 filename
```
命令中 `-s` 来指定截断后的大小，`-s 0` 就是截断到 0。

## 使用 `:>` 或者 `>`

这是最简单的方法了。下面的命令可以在 bash 中使用：

```
> filename
```

如果是其它 shell，用 `:>` 就行了，或者是

```
true > filename
```

## 使用 `echo` 命令

这其实跟上一个命令很像。并且下面 2 种写法都可以：

```
echo > filename
echo "" > filename
```

## 使用 `/dev/null` 设备

这几种都是利用了重定向，不过这个是使用 `cat /dev/null`，因为这个命令啥也不会输出，所以可以清空文件：

```
cat /dev/null > file.log
```


## 写在最后

这篇小文的主要内容来自 [How to Empty a Log File in Linux](https://linuxhandbook.com/empty-file-linux/)。