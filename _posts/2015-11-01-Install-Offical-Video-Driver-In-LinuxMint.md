---
layout: post
title:  "在LinuxMint下安装Nivdia官方驱动"
data: 2015-11-01
categories:
- Notes
tags:
- LinuxMint
- offical video driver
- nouveau

---

###禁用nouveau驱动改用Nvidia官方驱动

---

自从给笔记本装了LinuxMint之后，经常自动关机，查看日志后发现是温度过高之后的保护。
后来了解到是因为显卡默认使用的是开源的nouveau驱动，那么就着手改用Nvidia驱动。

------

1. 下载官方驱动

Nvidia官方网站有Linux版本驱动，可以直接下载

------

2. 禁用nouveau

编辑/etc/modprobe.d/blacklist-nouveau.conf，加入如下2行：

    blacklist nouveau
    options nouveau modeset=0

------

3. 安装官方驱动

官方驱动需要在非图形节目下使用root权限安装，可以使用你的窗口管理工具将图形界面
关掉，然后进行安装
