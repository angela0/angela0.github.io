---
layout: post
title:  "PySnooper: 一个棒棒的 Python 调试器"
data: 2019-04-29
categories:
- Notes
tags:
- Python
- Debugger
---

对于脚本语言的调试，向来都是一件麻烦事。虽然 Python 有 pdb 这样的工具，但用起来的感觉 -- 这么说吧，我还是经常使用 `print` 大法。`print` 虽好，贪杯就不行了。每次加 `print`，删 `print`，最后提交代码的时候还要仔细检查有没有调试用的 `print`，略有些痛苦。直到我发现了 [`PySnooper`](https://github.com/cool-RR/PySnooper) 这家伙。

<!-- more -->

`PySnooper` 提供一个装饰器 `snoop`，把它放到想要调试的函数前，就这么简单，你就能得到这个函数的完整的运行信息：运行了哪个分支，执行了几次循环，哪个变量修改了，返回值是什么 都一清二楚。官网给了个例子：

``` python
import pysnooper

@pysnooper.snoop()
def number_to_bits(number):
    if number:
        bits = []
        while number:
            number, remainder = divmod(number, 2)
            bits.insert(0, remainder)
        return bits
    else:
        return [0]

number_to_bits(6)
```

运行之后的结果会输出到标准错误上（如果你想输出到文件，在后面会提到）：

```
Starting var:.. number = 6
15:29:11.327032 call         4 def number_to_bits(number):
15:29:11.327032 line         5     if number:
15:29:11.327032 line         6         bits = []
New var:....... bits = []
15:29:11.327032 line         7         while number:
15:29:11.327032 line         8             number, remainder = divmod(number, 2)
New var:....... remainder = 0
Modified var:.. number = 3
15:29:11.327032 line         9             bits.insert(0, remainder)
Modified var:.. bits = [0]
15:29:11.327032 line         7         while number:
15:29:11.327032 line         8             number, remainder = divmod(number, 2)
Modified var:.. number = 1
Modified var:.. remainder = 1
15:29:11.327032 line         9             bits.insert(0, remainder)
Modified var:.. bits = [1, 0]
15:29:11.327032 line         7         while number:
15:29:11.327032 line         8             number, remainder = divmod(number, 2)
Modified var:.. number = 0
15:29:11.327032 line         9             bits.insert(0, remainder)
Modified var:.. bits = [1, 1, 0]
15:29:11.327032 line         7         while number:
15:29:11.327032 line        10         return bits
15:29:11.327032 return      10         return bits
Return value:.. [1, 1, 0]
```

这个装饰器还提供了几个参数来让功能更丰富。如果你想把输出重定向到文件，就：

``` python
@pysnooper.snoop('/my/log/file.log')
```

如果你还想观察某些非局部变量的值，就：

``` python
@pysnooper.snoop(variables=('foo.bar', 'self.whatever'))
```

如果你想观察更深层次的函数调用，就：

``` python
depth 默认值是 1
@pysnooper.snoop(depth=2)
```

如果你想要使用 grep 方便地检出 `PySnooper` 的输出，可以加个前缀：

``` python
@pysnooper.snoop(prefix='ZZZ ')
```

是不是心动了呢？再也不用 `print`，`print`，`print` 了。那赶快去安装吧，用 pip 就行。

`PySnooper` 用起来非常简单，不需要多说什么。之后我们会深入它的源代码来一探究竟。