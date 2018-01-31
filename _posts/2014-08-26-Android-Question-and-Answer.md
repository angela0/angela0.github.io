---
layout: post
title: "Android 常见问题"
data: 2014-08-26
categories:
- Android
tags:
- Andriod开发
- Android SDK更新
- EditText

---

最近由于某些原因开始学习安卓开发，一开始就遇到了许多问题。尽管都是些小问题，但我觉得有必要把他们总结一下，给自己做个备忘，也给后来人一些帮助。


### Tip 1：Android SDK的安装及更新

本来Android SDK的安装不是什么问题，但由于天朝某墙的阻隔没办法更新下载API等重要组件。要解决这个问题，目前的情况应该有三条出路：

1. 越过那道墙，建议使用VPN。这里推荐一个叫 *开心直通车* 的VPN，大家可自行度其最新官网，因为时常被某墙干掉，所以经常性更换。

2. 使用墙内热心人下载好的包，拷贝到Android SDK目录里面即可。另外我在百度网盘放了 [`android-sdk_r23.0.2-windows.zip`]()(我是在windows里面部署的，你可以在官网下载对应OS版本的Android SDK)，里面已经有19和20的API()了，解压即可使用。*提醒：压缩包很大，1.63G*。

3. 如果觉得第二种方法比较慢，这里有一种可能比较快(这得看你的网速)的方法，但也是一种比较麻烦的方法。首先打开你的 `SDK Manager` --> `tools` --> `Manage Add-on Sites`，找到里面所有的URL，在浏览器里面打开这些URL(需要越墙)，在页面里面找到类似 `<sdk:url>***</sdk:url>` 的部分。如果里面是一个完整的地址，直接复制到迅雷里面下载；如果只是一个 `**.zip`，只需要将浏览器地址栏里面的 `**.xml`部分换成 `**.zip` 即可。只需要下载自己需要的zip就okay，当然也可以在网上找别人整理好的。至于怎么用，我想还是可以参考一下 [这篇博文](http://blog.csdn.net/harvic880925/article/details/37913801) 的全套服务。

不过，我还是觉得第一种方法最简单省事，点击安装后，睡一觉一切就okay了。


### Tip 2:

当在进行练习的时候，想要拖动一个 `EditText` 到界面上的时候，出现了下面的错误：

![1](/media/img/2014-08-26-Android-Question-and-Answer/1.jpg)

这里是Eclipse提示的错误信息:
```
Exception raised during rendering: java.lang.System.arraycopy([CI[CII)V
Exception details are logged in Window > Show View > Error Log
```

我当时使用的API是 `API 20: Android 4.4W` (因为系统应该默认选择你的SDK中存在的最高版本的API)，就会出现上面的错误，具体是什么原因呢？我的猜想是 Android 4.4W 是Android穿戴设备上的操作系统，可能不支持输入文本，搜索之，果然如此。解决方法是，如果你的SDK中含有其他版本的API(如下图)，切换一下就好了；没有的话，嘿嘿，下一个吧。

![2](/media/img/2014-08-26-Android-Question-and-Answer/2.jpg)
