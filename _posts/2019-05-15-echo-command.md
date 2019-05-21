---
layout: post
title:  "echo 命令 7 个实例"
data: 2019-05-15
categories:
- Howto
tag:
- 命令行
- Linux
---

`echo` 可能是 Linux 用户最常用的命令之一了。它也算是最简单的命令之一，用来打印它的参数。

<!-- more -->

```
$ echo Hello World
Hello World
```

它之所以叫 ‘echo’，因为它就是打印它的输入而已。通常在脚本里打印信息，比如提示用户输入或者打印一个错误信息。

它的用法很简单：

```
echo [options] [input string]
```

它的选项分为长选项和短选项。长选项只有 2 个 `--help` 和 `--version`，顾名思义就是打印帮助和版本。而短选项也只有 3 个：

- `-n`

    不输出末尾的换行符。效果你尝试一下就知道了
- `-e` 和 `-E`

    `-e` 会开启转义；`-E` 恰恰相反，并且是 `echo` 的默认行为。它支持的转义符号在后文提到


## 打印变量值

如果我们声明一个变量 `var=100`，你就可以用 `echo` 打印出它的值：

```
$ echo The value of variable var is $var
The value of variable var is 100
```

当然你也可以打印环境变量，毕竟环境变量也是变量嘛。


## 不打印换行符

默认 `echo` 不打印换行符，就像之前说的 `-n` 变量可以不打印最后的换行符。

```
$ echo -n Hello World
Hello World$
```


## 重定向到文件

在之前的文章 [用 Linux 命令行创建文件的四种方法](/Create-File-In-Linux/) 中，我们使用 `echo` 命令来创建空文件；你也可以把内容输出到文件：

```
echo "This text goes to a file" >> file.txt
```


## 使用转义符

如果你学习过 C 语言，那你肯定知道转义符，但 `echo` 默认却不解释转义。`echo` 支持的转义有：

- `\\` - 反斜线
- `\a` - 警报（播放蜂鸣声）
- `\b` - 退格
- `\c` - 不产生任何输出
- `\d` - ESC
- `\f` - 换页（现在没啥用了）
- `\n` - 换行
- `\r` - 回车
- `\t` - 水平制表符
- `\v` - 垂直制表符
- `\0NNN` - 表示八进制 NNN（1 到 3 个数字）
- `\xHH` - 表示十六禁止 HH（1 到 2 个数字）

除了这里说的几个，你是可以使用 [ANSI 转义序列](https://zh.wikipedia.org/wiki/ANSI%E8%BD%AC%E4%B9%89%E5%BA%8F%E5%88%97)。

像 `ls`、`grep` 等命令都能输出颜色，你可以通过 ANSI 转义序列来实现：

```
echo -e "\033[30mThis is Black"
echo -e "\033[31mThis is Red"
echo -e "\033[32mThis is Green"
echo -e "\033[33mThis is Yellow"
echo -e "\033[34mThis is Blue"
echo -e "\033[35mThis is Magenta"
echo -e "\033[36mThis is Cyan"
echo -e "\033[37mThis is White"
```

## 打印引号

在 shell 中，单引号（`'`）和双引号（`"`）是用来括字符串的，所以你要输出引号就要转义，用法就跟上一节的转义符一样。

```
$ echo "It's \"My\" World"
```


## 打印文件夹里的文件

这其实是 `ls` 应该干的事，但 `echo` 命令也可以干，不过需要 `*` 通配符来配合。

```
$ echo *
$ echo *.txt
```

如果你尝试了，会发现没有格式都挤在一起了，所以使用合适的工具干合适的事吧。


## 清空文件

在之前的文章 [在 Linux 清空一个文件](/Empty-File-In-Linux/) 中，我们说过如何使用 `echo` 命令来清空文件。其实还是利用了 `>`。


## 写在最后

此外，当你实践时候发现跟上面说的情况不一致，很有可能是因为你的 shell 内置了 `echo` 命令。你可以使用 `man builtins` 来查看内置的
`echo` 文档。

好了，就这些了。

这篇小文的主要结构来自 [echo Command in Linux: 7 Practical Examples](https://linuxhandbook.com/echo-command/)。
