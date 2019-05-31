---
layout: post
title:  "nslookup 命令 7 个实例"
data: 2019-05-31
categories:
- Howto
tag:
- Linux
- 命令行
---

`nslookup` 是最常用的 Linux 命令之一，用来进行 DNS（[Domain Name System](https://en.wikipedia.org/wiki/Domain_Name_System)）查询。不出所料，nslookup 表示的就是 ‘name server lookup’。

你可以用 `nslookup` 来查询 DNS 并获取网站、域名服务器以及域名的 IP 地址。

<!-- more -->

让我们看几个 `nslookup` 的例子。


## 获取网站的 IP 地址

以不带任何选项的最简单形式，`nslookup` 就能返回域名及其 IP（v4 和 v6）：

```
nslookup website_domain
```

比如：

```
$ nslookup linuxhandbook.com
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
Name: linuxhandbook.com
Address: 142.93.143.135
Name: linuxhandbook.com
Address: fd00:0:12:13::8e5d:8f87
```

上面输出中的 127.0.0.53 是我自己系统上的 DNS 服务。如果你设置的话，它可能是 8.8.8.8 等等。

### NOTE：什么是 non-authoritative answer

在 `nslookup` 的输出中，你可能经常看到 *non-authoritative answer*。这意味着这次 DNS 查询获得的数据来自非权威的源。

这是因为当你使用 `nslookup` 时，结果可能并不是直接来自你查询的那个服务器。很有可能是你 ISP 的域名服务器。


## 查询域名服务器（NS 记录）

你也可以只显示和一个域名相关的域名服务器。这些域名服务器存储了不同的 DNS 相关的记录。通常，出于备份目的，一个域名会有多个域名服务器。

要只显示域名服务器，你只需要在查询上加上类型就行了：

```
nslookup -type=ns domain
```

查询 Linux Handbook 网站的示例输出：

```
$ nslookup -type=ns linuxhandbook.com
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
linuxhandbook.com nameserver = dns2.registrar-servers.com.
linuxhandbook.com nameserver = dns1.registrar-servers.com.

Authoritative answers can be found from:
```


## 查询 MX 记录

DNS 中的 MX 记录指定域名的邮件服务器设置：

```
nslookup -type=mx domain
```

输出类似这样：

```
$ nslookup -type=mx itsfoss.com
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
itsfoss.com mail exchanger = 5 alt2.aspmx.l.google.com.
itsfoss.com mail exchanger = 1 aspmx.l.google.com.
itsfoss.com mail exchanger = 10 alt3.aspmx.l.google.com.
itsfoss.com mail exchanger = 5 alt1.aspmx.l.google.com.
itsfoss.com mail exchanger = 10 alt4.aspmx.l.google.com.

Authoritative answers can be found from:
```

如果没有配置 MX 记录，可以是这样子的：

```
$ nslookup -type=mx linuxhandbook.com
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
*** Can’t find linuxhandbook.com: No answer

Authoritative answers can be found from:
```


## 获取 SOA 记录

你可以查询 SOA 记录（Start of Authority）：

```
nslookup -type=soa domain
```

输出类似于：

```
$ nslookup -type=soa linuxhandbook.com
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
linuxhandbook.com
origin = dns1.registrar-servers.com
mail addr = hostmaster.registrar-servers.com
serial = 2019051520
refresh = 43200
retry = 3600
expire = 604800
minimum = 3601

Authoritative answers can be found from:
```


## 查询所有 DNS 记录

如果你想一次查询所有记录的话，就把 type 设置成 any 就行了。


## 反向 DNS 查询

到目前，你已经学会了使用 `nslookup` 查询一个域名的 IP 了。实际上，你还可以进行反向查询，即根据 IP 查询域名：

```
nslookup <IP_ADDRESS>
```

例如你想查询 Linux Handbook 的服务器：

```
$ nslookup 142.93.143.135
135.143.93.142.in-addr.arpa name = 217283.cloudwaysapps.com.

Authoritative answers can be found from:
```

你发现这并不是你想要的东东。这是因为 Linux Handbook 架在 Cloudways 上。而 Cloudways 上的 WordPress 应用默认使用的是它自己的域名。后来才改了 DNS 设置。

这就是为啥显示的是 Cloudways 的域名，而不是 linuxhandbook.com。


## 查询是指定端口

DNS 默认使用 TCP 的 53 端口，但有些 DNS 服务器可能使用其它端口，这时我们需要指定端口：

```
nslookup -port=<Port_Number> domain
```


## 总结

这些就足够日程使用 `nslookup` 了。

## 写在最后

这篇小文的主要内容来自 [nslookup Command: 7 Practical Examples](https://linuxhandbook.com/nslookup-command/)。