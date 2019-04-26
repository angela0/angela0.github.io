---
layout: post
title:  "另外一个比较好用的终端录制工具 termtosvg"
data: 2018-09-17
categories:
- Tools
---

之前在 [一个比较好用的终端录制工具 asciinema](/dailylinuxcmd/2018/05/15/Terminal-Recorder-Asciinema/) 一篇中介绍了一个非常好用的终端录制工具，今天再给大家介绍另外一个 termtosvg。

termtosvg 的作者坦言称其是受 asciinema 的影响才编写了 termtosvg。在我看来，它们各有优点。

### 特点

1. 从名字中可以看出，termtosvg 是将屏幕录制成 svg 格式的动画，所以其生成的结果非常轻量，并且适合放在页面上展示了
2. 可以自定义模版。如果你想在录制时临时修改终端配色，而又不想更换掉自己亲爱的终端的原来配色，那这个特性对你很有用，不过我觉得很多时候都用不到吧。除此之外，自定义模版还能指定字体；能增加一个终端窗口框，让其看起来能像真实的终端；还能增加些 javascript 代码来暂停动画、定位动画的某一帧等等，详细的内容可以参考 [这个手册](https://github.com/nbedos/termtosvg/blob/master/man/termtosvg-template.md)
3. 和 asciinema 兼容。如果想将 asciinema 录制的 session 嵌入到页面中，这将非常有用

### 安装

termtosvg 使用 Python 编写，所以安装十分简单，但其要求 Python 版本为 3.5 及以上。你可以使用 pip 工具直接安装：

```
pip3 install --user termtosvg
```

### 使用

termtosvg 的使用更为简单。

#### 基本用法

```
termtosvg [-g GEOMETRY] [-t TEMPLATE] [-v] [-h] [output_file]
```

- `-g` 参数可以指定录制 session 的尺寸，GEOMETRY 格式为 **列在前，行在后，中间是小写字母 x**，如：`80x19`
- `-t` 参数可以指定一个要使用的配色方案，其内置了几种，可以使用 `-h` 查看
- `-v` 标志就是 verbose，会有详尽的日志，一般我们是不需要的
- `-h` 标志会打印帮助页，由于 termtosvg 非常简单，该帮助页足够了，如果你想获取更详细的内容，可以访问其 [项目主页](https://nbedos.github.io/termtosvg/)
- `output_file` 就是指定录制的输出文件名。如果不指定，就在 /tmp 下生成一个随机的文件名

和 asciinema 一样，在运行命令后就可以开始录制了，要退出时就用 Ctrl+D 或者 exit

#### 兼容用法

文章开始时提到，termtosvg 和 asciinema 是兼容的，除了 svg 外，因为 asciinema 也可以录制出 asciinema 那样的 asciicast 格式（v2 版本）；不仅如此，termtosvg 还可以将 asciicast 格式（v1 v2 皆可）渲染成 svg 格式。

1. 录制 asciicast 格式

    ```
    termtosvg record [-g GEOMETRY] [-v] [output_file]
    ```
    只需要使用 record 子命令就可以了，但需要注意的是你将不能使用 `-t` 参数来指定配色方案了

2. 渲染 asciicast 为 svg

    ```
    termtosvg render [-g GEOMETRY] [-t TEMPLATE] [-v] input_file [output_file]
    ```
    依然非常简单，只需要使用 render 子命令，并且在 input_file 处指定你要渲染的 asciicast 格式文件，输出文件的名字依然不需要必须指定。

