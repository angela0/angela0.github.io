---
layout: post
title:  "你的 Linux 正在使用哪种 shell"
data: 2019-04-17
categories:
- Howto
---

这是个简明教程，教你几种查看自己所用 shell 的方法。（注：针对 Beginner 的小文，老司机不用点进来了）

你在使用哪种 shell？这叫个问题么？当然算个问题。Linux 系统中有很多 shell 可用，最流行的有下面这几种：

- bash
- zsh
- ksh
- tcsh

有这么几种情况你可能想要了解自己用的哪种 shell。比如当你登录一个你不了解的 Linux 后，你可能想知道系统默认使用的哪种 shell。还有就是如果你经常 [切换 shell](https://linuxhandbook.com/change-shell-linux/)，想知道现在正用的哪个 shell。

下面就看看有哪几种方法吧。需要注意的是，下面给出的命令可能并不对所有 shell 有用，但对于大多数 shell 都是没问题的。


## 方法 1

可以使用特殊的 shell 内置变量 `$$`，该变量可以指示当前正在运行的 shell 实例的进程 ID。它是个只读变量，不要修改它。

如果查看该进程的信息，你应该就能看到进程名字，也就是 shell 名字：

``` bash
ps -p $$
```

输出类似这样：

```
  PID TTY          TIME CMD
15012 pts/0    00:00:00 zsh
```


## 方法 2

使用 shell 内置变量 `$0`，`$0` 要么是 shell 的名字，要么是 shell 脚本的名字。如果在脚本里面使用的话，就代表脚本的名字。而如果直接在 shell 中使用，则是该 shell 的名字：

``` bash
echo $0
```

输出类似下面这样：

```
bash
```


## 方法 3

使用 [pstree](https://en.wikipedia.org/wiki/Pstree) 命令。pstree 将所有正在运行的程序以树的形式打印出来。

如果不跟参数，它就会从 init 或者 systemd 开始打印所有的进程。而如果你给它一个进程 ID，就会打印以该 ID 为根节点的树。换句话说，就是打印所有从该进程产生的进程。

同样需要使用 `$$` 变量：

``` bash
pstree $$
```

注意：pstree 不是所有的 Linux 系统都包含的基本命令，所以在你的 Linux 系统上可能会运行失败


## 方法 4

最后一种方法是使用 proc 文件系统。这个文件夹里包含 Linux 系统所有的运行时信息。你可以使用下面的命令来查看（还要用到 `$$`）：

``` bash
cat /proc/$$/cmdline
```

输出里面就包含你使用的 shell 的名字。


## 写在后面

这篇小文的原内容主要来自 [How to Find Which Shell You Are Using on Linux
](https://linuxhandbook.com/shell-using/)。

对于这 4 种方法，其实可以归结为一种，也就是查看当前 shell 实例（就是进程）的名字。主要用到了 `$$` 和 `$0` 这 2 个 shell 内置变量。


## 额外提示：查看 shell 的版本

在你通过上面的方法知道所用的 shell 之后，一般也就知道了该 shell 的程序名字。大多 shell 查看版本信息的参数都是 `--version`。如比方你使用的是 zsh：

``` bash
zsh --version
```

打印结果类似：

```
zsh 5.4.2 (x86_64-ubuntu-linux-gnu)
``` 

这样。


