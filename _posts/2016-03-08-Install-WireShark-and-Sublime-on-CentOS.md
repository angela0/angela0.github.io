---
layout: post
title:  "在CentOS下安装WireShark和Sublime"
data: 2016-03-08
categories:
- Notes
tags:
- CentOS
- WireShark
- Sublime
---

# 闲得没事瞎折腾

现在使用的环境是带有 Gnome 桌面的 CentOS 7，新装的系统就要折腾以下嘛

## Wireshark的安装

1. 从 WireShark 官网下载源码，因为官方没有为 Linux 编译二进制包。但一般 Linux 发行版的软件仓库里面是有的，只要你不嫌旧（CentOS 7 的仓库里面是1.2，而官方已经发布2.0的版本了）。[官方下载地址](https://www.wireshark.org/#download)

2. 解压缩：`tar xvfj wireshark-2.0.2.tar.bz2`。因为我下载的是现在（2016-03-08）最新的版本，就是这个文件

3. 进入你刚解压缩的目录里面，这里是 `wireshark-2.0.2`，就是正常的编译安装软件包的步骤。不过它似乎提供了2种方式，一个是 Cmake，还可以直接 make。实测在我的环境里面用Cmake编译后无法运行，提示找不到 `libwireshark.so.6`。使用 `./configure && make && make install` 则可以正常使用，没有找到原因

4. 安装完成后，可以使用 `wireshark`，`wireshark-gtk`以及`tshark`来运行wireshark，前2个是图形界面，tshark 是命令行工具，和 tcpdump 类似


## Sublime 的安装

1. sublime 的安装其实好简单，因为他是闭源软件，只能下载二进制程序，所以，你下载下来放到某个文件夹就好了，就可以用了

2. [下载地址](https://www.sublimetext.com/2)。我个人还是比较喜欢版本2的，其实都一样，版本3使用的是 python3

3. 有钱的捧个钱场，去买个 license, 实在没钱作者也让你用

4. 我习惯将 sublime 解压后放在 `/opt/` 目录下面，软链接的话做不做都行，反正我们是在桌面环境下工作...

5. 给 sublime 加个快捷方式以及图标，因为图标它自带的有，不用到处找了。在 `/usr/share/applications/` 下新建文件 `sublime.desktop`，内容如下：


	[Desktop Entry]
    Name=Sublime
	Comment=A Text Editor
    GenericName=Sublime
    Exec=/bin/sublime %U
    Icon=sublime
    Type=Application
    StartupNotify=true
    MimeType=text/plain;


然后将 `/opt/sublime/Icon` 里面的各个分辨率文件夹下的png文件分别拷贝到 `/usr/share/icons/hicolor` 下对应分辨率文件夹下的 `apps` 文件夹里面。
下次登陆应该就可以用了。

### 就这样吧
