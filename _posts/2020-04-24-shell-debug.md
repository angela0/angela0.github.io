---
layout: post
title:  "Shell 脚本 Debug"
data: 2020-04-24
categories:
- Notes
tag:
- Linux
- Shell
---


shell 脚本语言是一种比较神奇的存在，既不容易写，也不容易调试。还有各种各样的变种，兼容性也比较差。但由于历史原因，shell 脚本还是被大量使用，尤其是在类 Unix 操作系统上。所以还是需要掌握一些 debug 技巧，以备不时之需。

使用的环境是 Ubuntu 16.04 上的 bash 4.3.48，其它 shell（如 zsh）应该有类似（或者相同）的特性，可以参考使用 shell 的文档。

NOTE：文中的代码片段，行首是 `>` 符号的为 命令语句，其后不带 `>` 的行则为其输出。

## Lint 工具：shellcheck

shellcheck 这是一个 shell 脚本的 lint 工具，可以检查脚本的语法错误，并给出相应的修改说明。使用也比较简单直接：

```
> shellcheck myscript.sh

In myscript.sh line 3:
var = 3
^-- SC2034: var appears unused. Verify it or export it.
    ^-- SC1068: Don't put spaces around the = in assignments.
```

语法错误并不是非常难以察觉的事情，毕竟有语法错误的脚本是无法执行。但对于新手而言，可以给出修正说明，还是很有帮助的。

## Print 大法：echo

最让开发者头疼的并不语法错误，而是逻辑错误。很多语言（甚至脚本语言）都会提供代码调试工具，但对于 shell 来说，这是不存在的，只能祭出大多数语言都通用的 Print 大法 了。

优点显而易见，对于整个程序的运行过程以及运行中变量的值能够很好地监控；但缺点也显而易见，你需要在调试时加各种 输出语句，调试完成后还要将它们一一删除，这是个麻烦事。

对于 shell 还有一个场景缺陷：有时我们想要知道 命令1 的运行退出状态，而下一条命令 命令2 直接使用了 `$?` ，这时候你需要小心，不能在 命令1 后面加 `echo $?` 这样的输出语句，否则 命令 2 中的 `$?` 拿到的就是 `echo` 命令的退出状态了。所以在使用 `$?` 之前最好先赋值一个变量。

## 运行跟踪

实际上 shell 也并不是一点调试手段都没有，它在运行过程中是可以打印出运行过程的。有两种方法实现：命令行参数 `-x` 和 bash 内置命令 `set -x` 。

它们的作用是一样的，都是在展开一个 简单命令、for 命令、case 命令、select 命令 或者 算术 for 命令后打印 PS4 变量的展开值，然后跟上该命令以及其展开的参数。

这里可能比较拗口难懂，直接上示例。

```
> cat myscript.sh
#! /bin/bash

function div() {
    if [[ $1 > $2 ]]; then
        echo $(($1 / $2))
    else
        echo $(($2 / $1))
    fi
}
echo $1 $2
echo $(div $1 $2)
```

1. 命令行参数 `bash -x`
    
    ```
    $ bash -x myscript.sh
    + echo 123 456
    123 456
    ++ div 456 123
    ++ [[ 456 > 123 ]]
    ++ echo 3
    + echo 3
    3
    ```

2. 内置命令 `set -x`

    只需在脚本的开头加上一行 `set -x` 即可实现和 `bash -x` 一样的功能，但它还有一个对应的命令 `set +x`，用以关闭调试。它的好处就立刻凸显出来：你可以随时打开或者关闭调试追踪。所以这也是比较推荐的做法，除非你想调试整个脚本。
    
    ```
    > cat myscript.sh
    #!/bin/bash
    var=3
    set -x
    echo $var
    set +x
    var=4
    echo $var
    
    > ./myscript.sh
    + echo 3
    3
    + set +x
    4
    ```

还记得上面那个拗口的解释中，提到了 PS4 变量，从上面的例子中你也看到了，它默认是一个 `+` ，而它作为一个变量出现，就是方便我们自定义，所以你可以根据需要进行 DIY，比如：

```
PS4='+(${BASH_SOURCE}:${LINENO}): ${FUNCNAME[0]:+${FUNCNAME[0]}(): }'
```
使得 `set -x` 的输出更加详细：

```
> ./myscript.sh
+(./myscript.sh:5): main(): echo 'hello 3'
hello 3
+(./myscript.sh:6): main(): set +x
4
```

需要注意的是，非交互式环境不能继承 PS4 变量，所以在调试的时候最好加在脚本开头，而不是在 shell 上 export。

## 断点？breakpoint？

既然 shell 连调试功能都没有，还有断点？从某种意义上说，可以实现一丢丢断点的意思。比如，在你想要暂停的地方加一个 `read` 命令，想要继续按下回车即可。但这跟 print 一样，如果太多，手动加减是个麻烦事。

不过，我们可以借助内置命令 `trap` 来实现跟踪时暂停程序。但是你要清楚，这除了暂停程序让你看清楚之前 trace 的结果之外，你不能干任何事情。

```
# 和 set -x 配置使用
# 开启追踪
set -x
trap read debug

...

# 关闭追踪
set -x
trap - debug
```

## 值得注意的事情

shell 脚本因为其特殊行，非常容易犯错误，所以遵循一定的规范可以避免很多不必要的错误，比如：

1. 注意变量以及函数的命名，不要和内置或者要使用的外置命令重名
2. 要尽量多的输出日志
3. 输出命令除了 echo 之外，还有 printf，它可以更格式化地输出
4. 使用一个优秀的编辑器，可以提示你的错误
5. 尽量不要在 Windows 上面写代码，可能会出现换行符的问题
