---
layout: post
title:  "实例解释 tr 命令"
start: 2019-05-27
data: 2019-05-28
categories:
- Translate
tag:
- Linux
- 命令行
---

Linux 中的 `tr` 命令执行简单有用的字符集转换，这篇文章用一些例子教你使用它。

`tr` 命令中的 'tr' 表示转换（translation）的意思。它用来将一个字符集中的字符转换成另一个字符集中的字符。比如，你想将所有的大写转换
成小写，它就非常有用。

`tr` 命令非常简单，所以它没有 [`awk`](https://linuxhandbook.com/awk-command-tutorial/) 和 [`sed`](https://linuxhandbook.com/sed-command-basics/) 那么强大。

<!-- more -->

`tr` 的用法如下：

```
tr [options] charset1 [charset2]
```

它的选项比较多，但常用的有以下几个：

- `-d`，删除集合 1 中的字符
- `-c`，集合 1 的补集，即操作不在集合 1 中的字符
- `-s`，删除集合 1 中的多个相邻出现的字符
- `-t`，截断集合 1

下面看几个例子

## 大小写转换

这是 `tr` 最常用的地方了。让我们先用 `cat` 命令看看样例文件：

```
$ cat sample.txt
This is my life
and my file
```

现在我们把它转成大写：

```
$ cat sample.txt | tr 'a-z' 'A-Z'
THIS IS MY LIFE
AND MY FILE
```

你也可以用[字符分类](https://www.gnu.org/software/grep/manual/html_node/Character-Classes-and-Bracket-Expressions.html)：

```
$ cat sample.txt | tr [:lower:] [:upper:]
THIS IS MY LIFE
AND MY FILE
```

要转小写，就把两个字符集合反过来写：

```
cat sample.txt | tr 'A-Z' 'a-z'
```


## 替换字符

就像上面进行大小写替换一样，你可以把某个字符替换成另外一个字符。用例子解释一下就清楚了：

```
$ cat sample.txt | tr 'ilm' 'tyz'
Thts ts zy ytfe
and zy ftye
```

在这个例子中，'i' 替换成了 't'，'l' 替换成了 'y'，'m' 替换成了 'z'。

如果集合 2 比集合 1 短，那么集合 2 中的最后一个字符会一直重复，直到和集合 1 一样长。比如你如果使用 `tr 'ilm' 'ty'`，那 'm' 也会替
换成 'y'。

这常用来替换括号或者将 `_` 替换成 `-`。也可以用来将 tab 替换成空格。


## 删除指定字符

如果想删除某些字符，那需要用 `-d` 选项了：

```
$ cat sample.txt | tr -d ‘is’
Th my lfe
and my fle
```

在这个例子中，所有的 'i' 和 's' 被删除，但如果你想删除的是 'is' 这两个字符，那你可能要失望了，`tr` 做不到。去用 [sed](https://linuxhandbook.com/sed-reference-guide/) 吧。


## 删除像多个空格这样的重复字符

如果你的文本中有连续的空格，而你只想要一个，`tr` 也能帮助你：

```
$ echo "Text    has too many spaces" | tr -s " "
Text has too many spaces
```

你也可以在删除时进行替换：

```
$ echo "Text    has too many spaces" | tr -s " " ";"
Text;has;too;many;spaces
```


## 删除所有非数字字符

假设你的文本中有字母和数字以及其它字符，而你只想留下数字，`-c` 选项就非常有用了：

```
echo "Phone number is 123456789" | tr -cd [:digit:]
123456789
```


## 截断集合 1

还记得前面说过，如果集合 1 比集合 2 大，长的那一部分会重复替换成集合 2 的最后一个元素。如果你不想这样做，就使用 `-t` 吧，它把集合
1 截断得和集合 2 一样长，长的那一部分就不替换了：

```
$ cat sample.txt | tr -t ‘isef’ ’12’
Th12 12 my l1fe
and my f1le
```


## 总结

上面的例子演示了 `tr` 的几个选项的用法，你可以扩展到你的应用场景。

我希望这能帮到你。


## 写在最后

这篇小文的主要内容来自 [tr command in Linux Explained With Examples](https://linuxhandbook.com/tr-command/)。
