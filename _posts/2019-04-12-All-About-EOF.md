---
layout: post
title:  "一切你想知道的 EOF"
data: 2019-04-12
categories:
- Translate
tags:
- EOF
---

C/C++ 初学者在 Reddit 和 Stack Overflow 等网站上发布的所有问题中，最大的困惑就是在编写与用户交互或从中读取输入的程序时对文件结束条件处理。文件。我估计有超过95％的问题是对文件结束概念存在完全的误解。本文试图解释有关这个困惑和混乱的主题的所有问题，特别针对使用 Windows 和 类Unix 操作系统 的 C/C++ 程序员（例如 Linux，从现在开始我将使用此类操作系统作为示例）。

## EOF 字符之迷

许多初学者面临的第一个文件结束问题是，看不到 EOF 字符，但人们说它是存在的。Windows 和 Linux 操作系统都没有任何标记字符的概念来指示文件结尾。如果您使用 Windows 上的记事本或 Linux 上的 Vim 或任何其他编辑器/操作系统组合创建文本文件，则该文件中将不会包含标记文件结尾的特殊字符。Windows 和 Linux 都有文件系统，它们知道文件内容的确切长度（以字节为单位），并且完全不需要任何标记文件末尾的特殊字符。

因此，既然 Windows 和 Linux 都不使用 EOF 字符，那么这个想法来自哪里？很久很久以前，有一个名为 CP/M 的操作系统（就叫操作系统吧），它运行在像 Zilog Z80 和 Intel 8080 这样的8位处理器上。CP/M 的文件系统并*不知道*文件以字节为单位的长度 -- 它只知道占用了多少磁盘块。这意味着如果您编辑了一个包含文本 'hello world' 的小文件，CP/M 并不知道该文件长度为 11 个字节 -- 它只知道该文件占用了一个磁盘块，最小为 128 个字节。由于人们通常想要知道他们的文件有多大，而不是占用的磁盘块数，因此需要一个文件结束字符。为此，CP/M 从 ASCII 字符集中选用了 Control-Z 字符（十进制代码 26，十六进制 1A，在历史的长河中原来的用途逐渐不为人知了） -- 当 CP/M 应用程序读取 Control-Z 字符时，通常认为文件结束了。但并不强制应用程序这样做；处理二进制数据的应用程序需要一些其他方法来了解它们是否位于文件末尾，并且操作系统本身并没有特别处理 Control-Z。

当 MS-DOS 出现时，与 CP/M 的兼容性非常重要，因为一开始很多 MS-DOS 应用程序都是 CP/M 应用程序，这些应用程序通过翻译器将 Z80/8080 机器代码转换为 8086 机器码。由于应用程序并没有重写，他们仍然将 Control-Z 视为文件结束标记，有些人直到今天还这样做。事实上，*如果*在文本模式下打开文件，Control-Z 的这种处理内置于 Microsoft C 运行时库中。需要重要重申的是，Windows 操作系统本身对 Control-Z 一无所知 -- 这种行为完全取决于 MS 库，但不幸的是，每个 Windows 程序都使用它。同样重要的是要意识到这纯粹是一个 Windows 问题 -- Linux（和其他 类 Unix 系统）从未使用 Control-Z（或其他任何东西）作为任何形式的文件结束标记。

## 示例代码

你可以用下面的代码来证实 MS 库的这一糟糕特性。先写一个程序把 Control-Z 插进一个文本文件里：

``` cpp
#include <iostream>
#include <fstream>
using namespace std;

int main() {
    ofstream ofs( "myfile.txt" );
    ofs << "line 1\n";
    ofs << char(26);
    ofs << "line 2\n";
}
```

如果你在 Windows 或者 Linux 编译运行，它会创建一个文件，文件里在两行文本之间有一个 Control-Z（ASCII 码是 26）。哪个平台的 Control-Z 都没有特殊意义的输出。你可以试着从命令行读一下这个文件。在 Windows 上：

``` bash
c:\users\neilb\home\temp>type myfile.txt
line 1
```

注意到只有第一行输出了。在 Linux 上：

``` bash
[neilb@ophelia temp]$ cat myfile.txt
line 1
?line 2
```

两行都显示了，但两行中间有一个奇怪的字符（这里用问号表示了（译注：默认情况下 较新版本的 cat 不打印非打印字符，除非你加 `-e` 标志）），因为 cat 读到 Control-D 后把它和其他字符一样输出了。实际显示内容和你使用的终端有关。

貌似 Windows 操作系统**确实知道** Control-Z 字符啊，但并不是这样，只有某些程序代码知道。如果你使用 Windows 记事本打开这个文件，你会看到：两行都打印了，它们之间有一个 Control-Z 字符。记事本根本不把 Control-Z 当作文件结束标记。


## 文本模式 vs 二进制模式

上面用到的 type 命令和 记事本程序 有什么区别呢？实际上这很难说。可能 type 程序有一些特殊代码来检查 Control-Z 字符。然而，使用 C++ iostream 库 和 C stream 库的 Windows 程序在打开文件是有一个文本模式或者二进制模式的选项，这会使程序读到的内容有些许差异。

C++ 中读一个文本文件的常规写法是：

``` cpp
#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int main() {
    ifstream ifs( "myfile.txt" );
    string line;
    while( getline( ifs, line ) ) {
        cout << line << '\n';
    }
}
```

如果你在 Windows 运行，你会发现 Control-Z 被当作文件结束标记了，输出是：

```
line 1
```

然而，如果你以二进制模式打开：

```
ifstream ifs( "myfile.txt", ios::binary );
```

输出变成了

```
line 1
?line 2
```

Control-Z 只有在文本模式中才被特殊对待，在二进制模式中，跟其他字符一样。要注意，仅仅在 Windows 上是这样；在 Linux 上，这 2 种模式行为完全一致。

那该怎么办呢？记住两件事情：

1. 如果你的文件要在文本模式下是可移植的，不要在里面插入 Control-Z
2. 如果你一定要插入 Control-Z，并想要读取是可移植的，那就使用二进制模式打开文件

注：这里的 可移植 指的是使用任何程序，即便仅仅在 Windows 上。


## 那 Control-D 呢？

一些 Linux 用户此时可能在想，那我用来结束 shell 输入的 Control-D 是不是一个文件尾字符呢？答案是，它并不是。如果你在文本文件中插入一个 Control-D 字符，Linux 会完全忽视它。实际上，你在 shell 中输入的 Control-D 是给 shell 发了一个信号，告诉它关闭标准输入流。根本没有在流中插入任何字符。如果使用 **stty**，你可以把 Control-D 换成任何你喜欢的快捷键来关闭输入流。但不管你换成什么，都不能将它插入输入流。即便你真的插入了一下，Linux 也不会把它当作文件结束标志。


## C/C++ 中的 EOF 值

事情变得更混乱了，C 和 C++ 都提供了一个特殊值，叫做 `EOF`。C 里面，它在 `<stdio.h>` 中定义：

``` c
#define	EOF	(-1)
```

C++ 在 `<cstdio>` 中定义。

注意到这里的 EOF 和 Control-Z 没有任何关系了。它的值不是 26，且在实际使用中，它不是一个字符，而是数字。常用于像下面这样函数的返回值：

``` c
int getchar(void);
```

`getchar()` 函数用于从标准输入读取一个字符，如果读到文件尾就返回 EOF。文件尾可能是也可能不是 Control-Z 字符（参考上面的讨论）。但不管怎样，这里的 EOF 都不可能等于 Control-Z 的 ASCII 码。实际上，`getchar()` 返回的是一个 int，而不是 char。用 int 来存返回值很重要，因为 char 和 有符号整数 比较不一定能正常工作。使用此函数从标准输入读数据的常规做法是：

``` c
#include <stdio.h>

int main() {
    int c;
    while( (c = getchar()) != EOF ) {
        putchar( c );
    }
}
```


## eof() 函数和 feof() 函数

另一层困惑是 C 和 C++ 都提供了函数来检查输入流的状态。大多数初学者就困惑在这里，所以最好先说明它们做了什么以及不应该如何使用它们：

eof() 和 feof() 都会检查输入流，看看是否出现文件尾状态。这个状态只有在读操作时才会出现。如果你没有执行读操作而调用这 2 个函数，**那你的代码就是错的**。绝对不要在 eof 函数上循环。

为了演示，让我们编写一个读取文件的程序，并在输出时将行号添加到文件内容前。为简化起见，我们将使用固定的文件名并跳过任何错误检查。大多数初学者会这样写：

``` cpp
#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int main() {
    ifstream ifs( "afile.txt" );
    int n = 0;
    while( ! ifs.eof() ) {
        string line;
        getline( ifs, line );
        cout << ++n << " " << line << '\n';
    }
}
```

这似乎没问题，但请记住这个建议 -- “如果你之前没有执行读取就调用任何 eof 函数，那么**你的代码就错了**！”在这种情况下，我们确实在读取操作之前调用 eof()。要了解为什么这是错误的，请考虑如果 `afile.txt` 是空文件会怎样。第一次循环检查 `eof()` 将失败，因为没有进行读取操作。然后我们读了一些东西，它会设置文件结束条件，但为时已晚。然后我们会输出一行，行号为 1，但这一行在输入文件中不存在。同理，程序总是会多输出一行。

正确的写法是在读操作之后调用 eof 函数，或者根本就不用它。如果您不希望遇到文件结束之外的问题，你应该这样写：

``` cpp
int main() {
    ifstream ifs( "afile.txt" );
    int n = 0;
    string line;
    while( getline( ifs, line ) ) {
        cout << ++n << " " << line << '\n';
    }
}
```

在 C 中类似，你**不应该**这样写：

``` c
#include <stdio.h>

int main() {
    FILE * f = fopen( "afile.txt", "r" );
    char line[100];
    int n = 0;
    while( ! feof( f ) ) {
        fgets( line, 100, f );
        printf( "%d %s", ++n, line );
    }
    fclose( f );
}
```

如果是一个空文件，那肯定会打印一些垃圾内容（且会出现未定义行为）。你需要这样写：

``` c
#include <stdio.h>

int main() {
    FILE * f = fopen( "afile.txt", "r" );
    char line[100];
    int n = 0;
    while( fgets( line, 100, f ) != NULL ) {
        printf( "%d %s", ++n, line );
    }
    fclose( f );
}
```

看起来 eof() 和 feof() 没什么用，那 C/C++ 标准库为什么还要提供它们呢？当读操作出现错误时，你需要判断这是不是由文件尾造成的，这时就很有用了：

``` cpp
#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int main() {
    ifstream ifs( "afile.txt" );
    int n = 0;
    string line;
    while( getline( ifs, line ) ) {
        cout << ++n << " " << line << '\n';
    }
    if ( ifs.eof() ) {
        // OK - EOF is an expected condition
    }
    else {
        // ERROR - we hit something other than EOF
    }
}
```

## 总结

上面的内容说明了 EOF 问题非常复杂，但可以总结出 3 条基本规则：

- 在 Windows 上除非你以文本模式打开文件，或者自己插入一个，否则没有 EOF 字符
- C/C++ 中的 EOF 符号不表示文件尾字符，只是一些库函数的返回值
- 不要在 `eof()` 函数 和 `feof()` 函数上循环

如果你记住这些规则，你应该可以在 C/C++ 中避免大多数和文件尾条件相关的 bug。


---

本文翻译自 Neil Butterworth 发表于其 [博客](https://latedev.wordpress.com/) 的文章，原文地址是 [All About EOF](https://latedev.wordpress.com/2012/12/04/all-about-eof/)。