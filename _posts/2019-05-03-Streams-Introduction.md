---
layout: post
title:  "终端不只是终端：流"
data: 2019-05-03
categories:
- Translate
tag:
- Terminal
- Stream
---

我喜欢流，因为**我不喜欢软件**。

我尽可能不构建那么多的软件。软件少就不需要花费太多时间来更新、修复，也不用花过多的时间考虑它。唯一比“软件更少”更好的东西就是没有软件。

**流可以帮助我们减少软件的编写，因为它们让程序之间相互通信**。

如果程序之间不能通信，则需要更多的功能才能满足用户的需求，从而需要**开发更多软件**。通过进程间通信，流可以使软件更小，有时甚至可以不用编写软件。

了解流有助于你更好地了解 UNIX 系统的工作方式，并[使你的开发环境保持简洁](https://lucasfcosta.com/2019/02/10/terminal-guide-2019.html)。

<!-- more -->


## 什么是流

流就是流。**就像河流有水流一样，程序也有数据流。此外，就像你可以使用钢管将水从一个地方运送到另一个地方一样，您也可以使用 UNIX 管道将数据从一个程序传送到另一个程序**。这个类比就是流设计的启发来源：

> 我们应该有一些方法可以像软管一样来连接程序 -- 当需要其他程序处理数据的时候，将水管接入这个程序。这就是 I/O 的方式。-- Douglas McIlroy

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/000.png)

在 UNIX 中，程序默认就带一些流，用于输入和输出。我们称之为标准流。

有三种不同的标准流：

- [stdin](https://linux.die.net/man/3/stdin) 或 标准输入 是为程序提供数据的流
- [stdout](https://linux.die.net/man/3/stdout) 或 标准输出 是程序将其主要输出写入的流
- [stderr](https://linux.die.net/man/3/stderr) 或 标准错误 是程序将其错误消息写入的流

例如 [`fortune`](https://en.wikipedia.org/wiki/Fortune_(Unix)) 程序，会向 `stderr` 流里写入一段格言。

```
$ fortune
It is simplicity that is difficult to make
-- Bertold Brecht
```

当 `fortune` 运行时，它有 `stdin`、`stdout` 和 `stderr` 这 3 个流，既然它没有错误要输出，也没有数据要输入，就只会用到 `stdout`。

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/001.png)

`cowsay` 也会向 `stdout` 写东西。它接收一个字符串输入，并打印一头牛说这个字符串。

```
$ cowsay "Brazil has a decent president"
 _______________________________
< Brazil has a decent president >
 -------------------------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```

和 `fortune` 不同，`cowsay` 不会说格言。但幸运的是，我们可以通过 `cowsay` 的 `stdin` 来让它说点什么。

我们要让 `cowsay` 重复 `fortune` 说的话，就需要用到管道 -- 记作 `|`。它把 `cowsay` 的 `stdin` 绑定到 `fortune` 的 `stdout` 上。

```
$ fortune | cowsay
 _________________________________________
/ A language that doesn't have everything \
| is actually easier to program in than   |
| some that do.                           |
|                                         |
\ -- Dennis M. Ritchie                    /
 -----------------------------------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```

**我们使用管道将一个程序的的输入流和另一个程序的输出流联系到了一起。**

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/002.png)

你可以从屏幕上看到 `cowsay` 的输出，因为默认情况下下终端可以拿到属于它的 `stdin`、`stdout` 和 `stderr` 流。

数据从 `stdout` 和 `stderr` 进来，然后从另一端出去：你的显示器。同样，你的键盘输入通过 `stdin` 进入程序。

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/003.png)
<span style="text-align: center; display: block">来源: [Wikipedia](https://en.wikipedia.org/wiki/Standard_streams)</span>

例如，`cat` 程序使用 `stdin` 从键盘接收输入 并用 `stdout` 输出：

```
$ cat
Everything I write before pressing Enter
Everything I write before pressing Enter
Gets logged right after
Gets logged right after
```

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/004.png)

我们可以使用 [sed](https://linux.die.net/man/1/sed) 在每次按 `Enter` 键时把所有出现的 `I` 替换成 `We`，显得更亲切一点：

```
$ cat | sed -E "s/I/We/"
I think streams are quite cool.
We think streams are quite cool.
```

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/005.png)

另外，如果你不知道，`sed` 程序名字的意思就是 `流编辑器`。


## 流如何与你的“终端”对话

许多网站链接到 [我写的上一篇博文](https://lucasfcosta.com/2019/02/10/terminal-guide-2019.html)。在其中一个网站的评论区，有人指出我并没有真正使用过终端。

在他们一点都不书呆子的评论中说得对。然而，这是我 1978 年的一张照片 -- 在我出生之前 -- 正在使用 HP 2647A 串行终端：

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/006.png)
<span style="text-align: center; display: block">Autopilot [[CC BY-SA 3.0]](https://creativecommons.org/licenses/by-sa/3.0), via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:HP_2647A_terminal.jpg)</span>

如果你不是像我这样的硬核时间旅行者，**你使用的只是一个终端模拟器**。谁能猜到，对吧？

**终端模拟器是“真实”终端的软件模拟**。这些模拟器为你提供了与 Linux TTY 驱动程序交互的接口。**TTY 驱动程序负责处理与程序之间的数据**。

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/007.png)

每个 TTY 都有自己的 `stdin`，`stdout` 和 `stderr` 流。这些是提供给程序的流，供它们输入（`stdin`）和输入（`stdout` 和 `stderr`）。

下面是上一个例子中运行 `cat | sed -E "s/I/We/"` 更准确的过程：

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/008.png)

[与 UNIX 中的所有东东一样](https://en.wikipedia.org/wiki/Everything_is_a_file)，`tty` 也是一个文件。终端模拟器的每个实例都有一个与之关联的不同的 `tty` 文件。因为每个模拟器都读取和写入不同的文件，所以你看不到在已打开的所有窗口中运行的程序的输出。

要找出与终端窗口关联的 `tty`，可以使用 `tty` 命令：

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/009.png)

当您打开一个新的终端窗口时，这就是它的流指向：

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/010.png)

在上图中，`/dev/ttys/005` 只是一个例子。它可能是任何其他文件，因为每个 `tty` 实例都不同。


## 重定向

要将程序的输出写入文件而不是到 `tty`，可以将 `stdout` 流定向到其他位置。

在下面的示例中，我们将 `/` 目录的内容写入 `/tmp` 文件夹中的 `content_list.txt` 中。我们使用 `>` 操作符来执行此操作，这让我们重定向 `stdout` 流。

```
$ ls / 1> /tmp/content_list.txt
```

你可以使用 `cat` 查看 `/tmp/content_list.txt` 中的内容：

```
$ cat /tmp/content_list.txt
Applications
Library
Network
System
Users
Volumes
bin
cores
dev
etc
home
net
private
sbin
themes
tmp
usr
var
```

与通常使用 `ls /` 时不同，这里的 `ls` 命令没有向终端写入任何内容。它没有写入终端模拟器的 `/dev/tty` 文件，而是写入 `/tmp/content_list.txt`。

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/011.png)

我们可以简单只使用 `>` 实现相同的重定向效果。

```
$ ls / > /tmp/content_list.txt
```

省略前缀数字是可以的，因为 `>` 前面的 1 表示我们要重定向的流。在这里，`1` 是 `stdout` 的[文件描述符](https://www.computerhope.com/jargon/f/file-descriptor.htm)。

因为 `tty` 就是一个文件，你还可以将 `stdout` 流从一个终端重定向到另一个终端。

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/012.png)

如果我们想重定向 `stderr` 流，我们可以将其文件描述符 `2` 加到 `>` 前面。

```
$ cat /this/path/does/not/exist 2> /tmp/cat_error.txt
```

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/013.png)

现在 `/tmp/cat_error.txt` 包含了 `cat` 写入 `stderr` 的内容。

```
$ cat /tmp/cat_error.txt
cat: /this/path/does/not/exist: No such file or directory
```

要一起重定向 `stdout` 和 `stderr`，我们可以使用 `&>`。

```
$ cat /does/not/exist /tmp/content_list.txt &> /tmp/two_streams.txt
```

现在 `/tmp/two_streams` 将包含写入 `stdout` 和 `stderr` 的内容。

```
$ cat /tmp/two_streams.txt
cat: /does/not/exist: No such file or directory
Applications
Library
Network
System
Users
Volumes
bin
cores
dev
etc
home
installer.failurerequests
net
private
sbin
themes
tmp
usr
var
```

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/014.png)

使用 `>` 写入文件时必须小心。使用单个 `>` 会覆盖文件的内容。

```
$ printf "Look, I have something inside" > /tmp/careful.txt

$ cat /tmp/careful.txt
Look, I have something inside

$ printf "Now I have something else" > /tmp/careful.txt

$ cat /tmp/careful.txt
Now I have something else
```

要追加到文件而不是覆盖其内容，你必须使用 `>>`。

```
$ printf "Look, I have something inside" > /tmp/careful.txt

$ cat /tmp/careful.txt
Look, I have something inside

$ printf "\nNow I have one more thing" >> /tmp/careful.txt

$ cat /tmp/careful.txt
Look, I have something inside
Now I have one more thing
```

对于从 `stdin` 读取，我们可以使用 `<` 操作符。

以下命令使用 `stdin` 流为 `sed` 提供文件 `/usr/share/dict/words` 的内容。`sed` 然后随机选择一行并将其写入 `stdout`。

```
$ sed -n "${RANDOM}p" < /usr/share/dict/words
alloestropha
```

由于 `stdin` 的文件描述符为 `0`，我们在 `<` 前加个 `0` 可以实现相同的效果。

```
$ sed -n "${RANDOM}p" 0< /usr/share/dict/words
pentameter
```

注意使用重定向操作符和管道之间的区别也很重要。使用管道时，我们将程序的 `stdout` 附加到另一个程序的 `stdin` 上。使用重定向时，我们是在启动程序时更改流指向的位置。

由于流就是文件描述符，我们可以创建任意数量的流。为此，我们可以使用 [`exec`](https://stackoverflow.com/a/18351547) 在指定文件描述符上打开文件。

在下面的示例中，我们在描述符 `3` 上打开 `/usr/share/dict/words` 用于读取。

```
$ exec 3< /usr/share/dict/words
```

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/015.png)

现在我们可以使用 `<＆` 将此描述符用作程序的 `stdin`。

```
$ sed -n "${RANDOM}p" 0<&3
dactylic
```

`<＆` 操作符和在上面的例子中 `>&` 类似，*复制* 文件描述符 `3` 使 `0`（`stdin`）成为它的一个副本。

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/016.png)

**打开文件描述符进行读取时，只能“消耗”一次**。因此，再次使用 `3` 将无效：

```
$ grep dactylic 0<&3
```

要关闭一个文件描述符，我们可以使用 `-`，就像要将它复制到我们要关闭的文件描述符一样。

```
$ exec 3<&-
```

和使用 `<` 打开文件用来读类似，我们可以使用 `>` 打开文件用来写。

在下面的示例中，我们创建一个名为 `output.txt` 的文件，在写入模式下打开它，并将其描述符复制到 `4`：

```
$ touch /tmp/output.txt
$ exec 4>/tmp/output.txt
```

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/017.png)

现在，如果我们希望 `cowsay` 写入 `/tmp/output.txt` 文件，我们可以复制文件描述符 `4` 并将其复制到 `1`（`stdout`）

```
$ cowsay "Does this work?" 1>&4

$ cat /tmp/output.txt
 _________________
< Does this work? >
 -----------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/018.png)

直观地说，要打开文件进行读写，可以使用 `<>`。首先让我们创建一个名为 `/tmp/lines.txt` 的文件，为它打开一个 `r/w` 描述符并将其复制到 `5`。

```
$ touch /tmp/lines.txt
$ exec 5<> /tmp/lines.txt
```

![](/assets/img/3b6ec939d63cea12774f60c9c75d3928/019.png)


在下面的示例中，我们将 `/usr/share/dict/propernames` 的前 3 行复制到 `/tmp/lines.txt`。

```
$ head -n 3 /usr/share/dict/propernames 1>&5
$ cat /tmp/lines.txt
Aaron
Adam
Adlai
```

请注意，如果我们尝试用 `cat` 从 `5` 里读取数据，我们得不到任何输出，因为在写入时我们把 `5` 的文件指针移动到文件末尾了。

```
$ cat 0<&5
```

我们可以通过关闭并重新打开它来解决。

```
$ exec 5<&-
$ exec 5<> /tmp/lines.txt
$ cat 0<&5
Aaron
Adam
Adlai
```


## 后记

### 生成随机数

在上面的例子中，我使用 `$RANDOM` 生成随机数并将它们传递给 `sed`，以便从 `/usr/share/dict/words` 文件中随机选择一行。

你可能已经注意到它通常会给你一个以 `a`，`b` 或 `c` 开头的单词。那是因为 `RANDOM` 只有两字节，因此只能从 0 到 32767。

而 `/usr/share/dict/words` 文件有 235886 行。

```
$ wc -l /usr/share/dict/words
235886 /usr/share/dict/words
```

由于 `RANDOM` 生成的最大数比 `/usr/share/dict/words` 行数小约 7 倍，因此不适合从中选择随机单词。在这篇文章中，这样用是为了简单起见。


### TTY 和 IO 设备

在解释位于 I/O 设备和进程之间 TTY 和 终端模拟器 时，我故意省略了一些细节。

你可以在 [LinusÅkesson 这篇非常棒的文章 “The TTY Demystified” 中](https://www.linusakesson.net/programming/tty/)，找到更完整和深入的解释。


## 参考及有用的链接

- [Peter Krumins](https://twitter.com/pkrumins) 的 [Bash One-Liners Explained, Part III: All about redirections](https://catonmat.net/bash-one-liners-explained-part-three) 这篇超级棒的文章绝对值得一读
- [Linus Åkesson](https://www.linusakesson.net/) 的 [The TTY demystified](https://www.linusakesson.net/programming/tty/) 也值得一读
- [An overview of pipes and FIFOs from the Linux man pages](https://linux.die.net/man/7/pipe)
- Machtelt Garrels 的 [Introduction to Linux: A Hands On Guide](https://linux.die.net/Intro-Linux/) - [Chapter 5. I/O redirection](https://linux.die.net/Intro-Linux/chap_05.html)
- [What is a file descriptor - Computer Hope](https://www.computerhope.com/jargon/f/file-descriptor.htm)
- [The man page for bash](https://linux.die.net/man/1/sh)
- [The Illustrated Redirection Tutorial on the Bash Hackers Wiki](https://wiki.bash-hackers.org/howto/redirection_tutorial)
- [The man page for the standard streams](https://linux.die.net/man/3/stdin)
- [An explanation on duplicating file descriptors](https://unix.stackexchange.com/a/120535)


---

本文翻译自 [Lucas F. Costa](https://lucasfcosta.com) 发表于其博客的文章 [Your terminal is not a terminal: An Introduction to Streams](https://lucasfcosta.com/2019/04/07/streams-introduction.html)。
