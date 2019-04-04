---
layout: post
title:  "搭建饥荒专属服务器"
data: 2019-04-03
categories:
- Game
tags:
- DST
- Dedicated Server
---

喜欢玩饥荒的朋友可能都知道，朋友在他的电脑上开一个服务器，你就可以加进去玩，那为什么需要专有服务器呢？原因很简单：家用电脑的性能和网络都不是很 OK（如果你的计算机性能和网络都不错，那就不需要专有服务器，除非你想有一个一直不关闭的服务器，让小伙伴在你下线的时候也能玩）。因为饥荒需要大量的即时演算，可能 1 个人自己玩还能勉强可行，一旦人多就卡出天际。网络也是一方面，作为服务器的电脑需要有不错的上行带宽，而运营商给的上行一般都很低。所以为了和小伙伴愉快地玩耍，我们要搭建一个专属服务器。

## 准备一台服务器

如果你自己有服务器最好，没有的话，可以去马云爸爸或者化腾爸爸那里买一台，如果你是学生优惠非常大的。

对于配置（包括 CPU，内存以及网络），就要视玩耍人数而定，之前我测试使用腾讯云的 1 核 1G 1M 带宽的机器能够 2 人正常玩耍。

关于操作系统的选择，这里我使用 Ubuntu Linux。

在服务器就位之后，让我们开始搭建吧。


## 安装 steamcmd

出于安全和方便的目的，我们先创建个 `steam` 用户：

``` bash
useradd -m steam
```

对于 Ubuntu 和 CentOS 的 Linux 用户，可以直接使用包管理器安装。

在 Ubuntu 下：

``` bash
sudo apt install steamcmd
```

在 CentOS 下：

``` bash
yum install steamcmd
```

在 Arch 下：

你去 [AUR 里面](https://aur.archlinux.org/packages/steamcmd/) 下载吧。

这就能搞定 steam 命令行版客户端的安装。


## 下载饥荒

**注意：从此以后的操作我们将在 steam 用户下进行**

先切换到 steam 用户下：

``` bash
sudo su steam
cd
```

steam 第一次启动需要更新，以及下载游戏可能会比较慢，如果你有国外的 http 代理，用上吧：

``` bash
export http_proxy=http://<your_http_proxy_address>
export https_proxy=http://<your_http_proxy_address>
```

### 把 steamcmd 运行起来

运行非常简单，连在 Windows 下的双击都不需要 \笑：

``` bash
steamcmd
```

**注意：在此之后，你将进入 steamcmd 的交互式命令行，在每一行的最前面都有一个 `Steam>` 标记，下面的代码中也将加上此标记，来表示这里是 steamcmd，你不必复制它**

### 登录

steamcmd 是允许匿名登录的，但是对于我们的饥荒来说，就必须登录你购买了饥荒游戏的账户。

```
Steam> login <username> # 把 <username> 替换成你自己的用户名
```

接下来会让你输入密码。如果你开启密保或者二次验证，验证密码之后还会让你输入密保或者二次验证码。需要注意的是，在输入密码回车后由于网络原因会卡顿一小段时间，这时不要按回车，否则你的二次验证将验证失败。

### 下载游戏

```
Steam> app_update 322330
```

322330 是饥荒在 steam 的 ID。

在游戏下载完成后，我们就不需要使用 steamcmd 交互命令行了，退出来吧：

```
Steam> quit
```

**注意：退出以后就不再是 steamcmd 的交互式命令行了**

## 配置游戏

游戏下载完成后，会存放在 `/home/steam/.steam/SteamApps/common/Don't Starve Together` 文件夹里，该文件夹里面的 `bin/` 文件夹里的 `dontstarve_dedicated_server_nullrenderer` 文件是饥荒的启动程序。启动它，让它生成一下默认配置。

``` bash
cd ~/.steam/SteamApps/common/Don\'t\ Starve\ Together/bin
./dontstarve_dedicated_server_nullrenderer
```

之后你可以看到 `/home/steam/` 目录下生成了 `.klei` 文件夹。

### Token

在生成默认配置的时候，它提示你需要 token。而 token 的生成是需要你本地的游戏客户端的。

打开你本地的游戏客户端，登录之后按 `~` 键，将 `TheNet:GenerateClusterToken()` 这句代码复制进去就生成 token 文件了。

在 Windows 上，token 文件位于 `/My Documents/Klei/DoNotStarveTogether/cluster_token.txt`

在 Linux 上，token 文件位于 `~/.klei/DoNotStarveTogether/cluster_token.txt`

在 MacOS 上，token 文件位于 `~/Documents/Klei/DoNotStarveTogether/cluster_token.txt`

**注意：因为 3 个平台的路径前缀不一样，为方便叙述，我将使用 `$PREFIX` 来替代前缀，如 Linux 下的 token 文件就是 `$PREFIX/cluster_token.txt`**

你需要将该文件拷贝到 `.klei/DoNotStarveTogether/Cluster_1/` 下。



### 配置

你可以在本地开一个服务器，进行配置、地图编辑 以及 mod 选择。在生成世界后，会在 `$PREFIX/Cluster_N`（这里的 N 是你的第几个世界，饥荒客户端一共有 5 个服务器槽） 里面有几个比较重要的文件。

- `$PREFIX/Cluster_N/cluster.ini`

    这个文件存放该服务器的基础配置，需要将其拷贝到 Linux 服务器的 `.klei/DoNotStarveTogether/Cluster_1/` 文件夹下。针对里面的各个配置选项，你也可以自己修改。
- `$PREFIX/Cluster_N/Master/leveldataoverride.lua`

    这个文件是对地图的配置，需要将其拷贝到 Linux 服务器的 `.klei/DoNotStarveTogether/Cluster_1/Master` 文件夹下。因为配置项非常多，而且是 lua 语法，所以如果不了解 lua 语法，尽量不要单独修改。
- `$PREFIX/Cluster_N/Master/modoverrides.lua`

    这个文件是该服务器要加载的 mod 及其配置，需要将其拷贝到 Linux 服务器的 `.klei/DoNotStarveTogether/Cluster_1/Master` 文件夹下。因为配置项非常多，而且是 lua 语法，所以如果不了解 lua 语法，尽量不要单独修改。
    
    只有这个文件，服务器是无法开启 mod，你还需要编辑 Linux 服务器上的 `.steam/SteamApps/common/Don\'t\ Starve\ Together/mods/dedicated_server_mods_setup.lua` 这个文件，在里面加上 `ServerModSetup("350811795")` 一些类似这样的语句，每行一个。引号里面的是你想要开启的 mod 的 id，可以在 steam 社区查到。


## 启动游戏

因为我们的服务器要长期运行，所有要将程序作为服务来启动，可以将下面的代码保存到 `/home/steam/starve.sh`:

``` bash
#!/bin/bash

cd /home/steam/.steam/SteamApps/common/Don\'t\ Starve\ Together/bin/

screen -S "DST" bash -c 'LD_LIBRARY_PATH=/home/steam/.steam/steamcmd/linux32 ./dontstarve_dedicated_server_nullrenderer -console'
```

然后执行：

``` bash
chmod +x starve.sh
```

以后启动游戏就只需要执行 `./starve.sh` 就可以了。

## 写在后面

本来这篇文章是想写给所有想要搭建饥荒专有服务器的同学们，即便你对 Linux 不是很了解。但在写作过程中，我发现要让所有人都理解，不得不对很多东西进行解释，所以就将这篇文章作为自己的记录吧。我在网络上找到了[一个系列的博客](https://blog.ttionya.com/article-1233.html)，写得还比较清晰，可以参考。