---
layout: post
title:  "在 Linux 中查看默认网关"
data: 2019-04-21
categories:
- Howto
---

这篇文章教你几种查看网关 IP 的方法。（注：针对 Beginner 的小文，老司机不用点进来了）

网关是一个网络的入口，路由器就是网关的典型例子。你的所有流量都会经过路由器，然后才能到达其他地方。有时你可能需要知道你的网关 IP，而通常路由器的 IP 就是网关 IP。

下面几种方法都能看到你的网关 IP（如果你的网络正确配置了）。


## ip 命令

输入命令：

```
# 这里的 r 是 route 的缩写，你使用 ip route 也是一样的
ip r
```

你会得到类似下面的输出：

```
default via 192.168.0.1 dev wlp58s0 proto dhcp metric 600 
169.254.0.0/16 dev wlp58s0 scope link metric 1000 
192.168.0.0/24 dev wlp58s0 proto kernel scope link src 192.168.0.106 metric 600
```

有 default 那一行就是默认网关的信息。如果你只想要这一行，配合 grep 命令使用：

```
ip route | grep default
```

你就只能看到：

```
default via 192.168.0.1 dev wlp1s0 proto dhcp metric 600
```

其中 `192.168.0.1` 就是默认网关 IP。


## route 命令

`route` 是一个比较老的命令了，现在大家都使用 `ip` 命令。你使用这个命令：

```
route -n
```

会看到这样的输出：

```
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         192.168.0.1     0.0.0.0         UG    600    0        0 wlp58s0
169.254.0.0     0.0.0.0         255.255.0.0     U     1000   0        0 wlp58s0
192.168.0.0     0.0.0.0         255.255.255.0   U     600    0        0 wlp58s0
```

其中第一列是 `0.0.0.0` 的就是默认网关，`U` 标记的意思这条路由是起用状态，`G` 就表示这个是网关。其实第二列 `192.168.0.1` 就是网关 IP。

注：当你不使用 `-n` 时，默认网关那行的第一列就是 `default` 了。`-n` 的意思是使用数字表示，而不是其名字。


## netstat 命令

`netstat` 命令是用来查看主机中的网络信息的（现在都用 `ss` 命令），其用法是：

```
netstat -r -n
```

这条命令的输出和上面的 `route` 命令一样，`-n` 的含义也一样。


## 总结

说了这么多，最后，还是推荐你使用 `ip` 命令，除非你的系统比较老旧，没有 `ip` 命令。


## 写在后面

这篇小文的原内容主要来自 [How to Find Default Gateway IP in Linux](https://linuxhandbook.com/find-gateway-linux/)。