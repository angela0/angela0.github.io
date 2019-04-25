---
layout: post
title:  "在 Linux 重命名多个文件"
data: 2019-04-21
categories:
- Howto
---

`rename` 命令可以一次重命名多个文件。这里展示几个 `rename` 命令的实际场景。（注：针对 Beginner 的小文，老司机不用点进来了）

大家都知道如何使用 `mv` 命令重命名一个文件。使用非常简单：

``` bash
mv old_file_name new_file_name
```

这没什么好说的，因为这是标准做法。但如果你想同时重命名多个文件的话，`mv` 命令就费老大劲了，你得对每个文件执行 `mv` 命令。当然，你可以使用 exec 命令来自动完成这些工作，但其实有更简单的方法，让我们来看看吧。


## Linux 中的 rename 命令

rename 命令就像它的名字一样，就是重命名文件的，但它可以通过匹配 [Perl 正则表达式](https://perldoc.perl.org/perlre.html#Regular-Expressions) 来重命名所有文件。rename 只针对文件名字来匹配，而不会针对文件内容。

使用泛式如下：

``` bash
rename [options] perlexpr [files]
```

其选项主要有这几个：

- -v，详细模式
- -n，不执行，只输出哪些文件将被重命名，并不实际重命名
- -o，不覆盖，不覆盖已存在的文件
- -f，强制执行，覆盖已存在的文件


需要注意的一点是，`rename` 命令并不像 `mv`，`ls` 那样会在所有发行版中预装。如果你的系统中没有，在 Debian 系中使用 `sudo apt install rename` 来安装。其他发行版可以使用相应的包管理器来安装。

下面我们上几个例子来说明一下 `rename` 的使用方法。


## 场景1: 替换一个字符

假如你的一些文件的名字中有空格，而在 Linux 中处理空白符简直跟噩梦一样。所以有经验的用户都不会在文件名中加入空格，而是使用下划线。下面的例子就是把当前文件夹中所有的文件名中的空格替换成下划线：

``` bash
rename 's/ /_/g' *
```

如果你对 [正则表达式](https://www.regular-expressions.info/) 很熟悉，那你肯定能理解 `s/ /_/g` 的意思就是查找所有的空格并替换成下划线。

对于最后的 星号（*），是告诉命令重命名当前文件夹下的所有文件。


## 场景2: 一次修改多个文件的后缀

你有一些文件，名字类似 `my_file.xyz` 这样，当你想一次把它们都替换成 `my_file.abc` 这样。只需要：

``` bash
rename 's/.xyz$/.abc/' *
```

`s/.xyz$/.abc/` 是一个正则替换，即把以 `.xyz` 结尾的名字替换成以 `.abc` 结尾的。


## 你喜欢 rename 不

很多人都不知道有 `rename` 这个命令，也许是因为它不是所有发行版预装的命令。但在同时重命名多个文件时，它用起来非常棒。有一点是，你需要对正则表达式比较熟悉，才能很好的使用它。


## 写在后面

这篇小文的原内容主要来自 [How to Rename Multiple Files at Once in Linux](https://linuxhandbook.com/rename-multiple-files/)。
