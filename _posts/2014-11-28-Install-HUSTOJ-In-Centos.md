---
layout: post
title: '在CentOS上配置hustoj'
data: 2014-11-28
categories:
- Notes
tags:
- hustoj
- centos

---

hustoj 是一套开源的在线判题系统， 自发布以来受到了许多好评。但是其官方发布的是基于Ubuntu(Linux)操作系统，许多CentOS(Linux)用户可能觉得有点不方便。实际上，一般只要是基于某个Linux发行版本的，理论上在其他发行版本也可以运行。[官方wiki](https://github.com/zhblue/hustoj/wiki) 里面也有一部分CentOS用户在配置过程中可能出现的问题，根据这篇wiki基本上就可以搭建出来可以运行的OJ系统。我根据昨天晚上在CentOS6上搭建的过程，说明一些细节(这里假设将所有服务，包括数据库、web、判题系统，放在了同一个服务器，至于分布式服务器大同小异)。


#### 准备工作

第一步肯定是要把服务器搭建起来，确保可以运行，需要以下软件：

``` sh
yum -y install php httpd php-mysql mysql-server php-xml php-gd
yum -y install gcc-c++ mysql-devel php-mbstring glibc-static flex

```

说明：上面这2个命令是可以合在一起的，为了页面整齐故分开

hustoj 的 web 端使用 php，所以需要安装 php 及相关插件

至于 mysql 等软件的配置，没有什么特殊要求，可以根据自己需要做相应配置


#### 配置 hustoj

下载hustoj系统文件，可以在[这里](https://github.com/zhblue/hustoj)下载原版，也可以在[这里](https://github.com/angela0/zzuliacm)下载我们基于hustoj进行二次开发的系统。

安装过程可以根据下载的文件里面的 `install.sh` 脚本内容进行安装，其中需要注意的内容有一下几点：

- 脚本里面的 `sudo svn checkout https://github.com/zhblue/hustoj/trunk/trunk hustoj-read-only` 是没有必要的，其实这就是刚才下载的文件
- CentOS里面apacheuser是 `apache` ，所以把 `www-data` 改为 `apache`
- 倒数第二行的 `sudo /etc/init.d/apache2 restart` 这是Ubuntu系统才有的，所以可以不要，不过不影响
- 说了3点，最后一点是，我直接写了一个能做CentOS下自动安装的脚本

---

#### 最后的最后

我在安装好以后，使用命令 `/etc/init.d/judged start` (因为第一次安装好之后需要手动启动服务)，但是报告如下错误
```
/etc/init.d/judged: line 139: log_deamon_msg: command not found
/etc/init.d/judged: line 76: start_stop_deamon: command not found
/etc/init.d/judged: line 152: log_end_msg: command not found
```

这个错误主要是因为CentOS里面默认没有安装 `start_stop_deamon`, 你可以手动下载源码进行编译。可以参考[这篇文章](http://blog.chinaunix.net/uid-24856020-id-3388594.html)。另外2个我猜测应该是因为这2个函数(应该是bash 函数，我没有找到软件包)在CentOS里面没有，所以，只能不用他们了，最简单的方法就是把 /etc/init.d/judged 里面的所有内容删掉，只加上 `/usr/bin/judged` 这么一句就行了，但是就不能用类似 `/etc/init.d/judged start | stop | restart` 的语句，简单的一的 `judged` 就ok了。终止服务的话，我想只能 kill 了。

如果在这个文件里面出现其他错误，也可以这样解决。

这个时候，服务器应该可以判题了。

如果oj的admin用户在添加题目或者题目数据的时候（或者其他地方）出现不能读或者写的情况，应该是文件或者文件夹的权限问题，可能在安装过程中漏掉了哪一步。可以给相应的文件或者文件夹相应的权限；也有可能是文件或者文件夹的所属用户或者所属组不正确，根据说明，改了就好。


#### 最后的最后的最后

关于64位CentOS，我没有进行尝试，官方wiki里面有对其解释。
