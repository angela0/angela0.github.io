---
layout: post
title:  "使用 Fail2Ban 加固你的 Linux 服务器"
data: 2019-04-26
categories:
- Howto
---

这篇文章会教你如何配置并使用 Fail2Ban 来让你的 Linux 服务器更安全。（注：针对 Beginner 的文章，老司机不用点进来了）

<!-- more -->

## Fail2Ban 是什么

如果你的服务器开启了 ssh，你检查一下服务器的登录日志就会惊讶地发现有大量的 IP 螫一通过 ssh 登录你的服务器。这实际上是有人使用自动脚本尝试暴力登录你的系统。如果你不加防范，服务器可能就会沦陷。

注：这些脚本实际上在不断尝试预先做好的 用户名/密码 组合字典，当然如何你的服务器禁止密码登录，可能就不会被暴力登陆了。

Fail2Ban 就一个可以阻止这种恶意登录的工具。如果某个 IP 在短时间内有大量失败的登录，Fail2Ban 就会把 IP 加入黑名单，禁止它在登录。

Fail2Ban 开箱即用，但也有很多配置项，可以根据你的喜好来创建过滤规则。听起来是不是很有趣，跟着下面的步骤来尝试使用 Fail2Ban 吧。


## 安装 Fail2Ban

因为 Fail2Ban 很常用，所以大部分发行版的软件仓库里都有 Fail2Ban 包。

### 在 CentOS 和 RedHat 系上

Fail2Ban 放在 epel 仓库里面，所以，你需要先安装 epel 仓库：

``` bash
sudo yum update && sudo yum install epel-release
sudo yum install fail2ban
```

### 在 Debian 和 Ubuntu 系上

这个在默认仓库里就有：

``` bash
sudo apt install fail2ban
```


## Fail2Ban 的配置文件

它主要有 2 个配置文件，分别是：`/etc/fail2ban/fail2ban.conf/` 和 `/etc/fail2ban/jail.conf`。其中 fail2ban.conf 是关于 Fail2Ban 软件本身的配置，包括日志级别、日志文件、socket 文件以及 pid 文件等等；而 jail.conf 则是关于功能的配置，包括 默认禁止登录时间，允许重试次数，白名单，邮件配置等等。

**注：建议不要修改这 2 个文件，而是用下面的命令将拷贝一次，修改 .local 文件**

``` bash
sudo cp /etc/fail2ban/fail2ban.conf /etc/fail2ban/fail2ban.local
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

我们主要关注 jail.conf 这个文件。但如果你使用 less 命令看的话，可能会非常难受，因为它通过大量的注释来告诉你每个配置的用途。下面我们把注释去掉，来看看。

jain.conf 是分服务的，其中 `[Default]` 段是对所有服务都有效的。而其他放在方括号中的服务（比如 `[sshd]`，`[apache-auth]`，`[squid]`）下的配置只针对该服务有效。

去掉注释大概样子就是这样了：

```
[DEFAULT]
ignorecommand =
bantime = 10m
findtime = 10m
maxretry = 5
backend = auto
usedns = warn
logencoding = auto
enabled = false
mode = normal
filter = %(name)s[mode=%(mode)s]
destemail = root@localhost
sender = root@
mta = sendmail
protocol = tcp
chain = 
port = 0:65535
fail2ban_agent = Fail2Ban/%(fail2ban_version)s
banaction = iptables-multiport
banaction_allports = iptables-allports
action_abuseipdb = abuseipdb
action = %(action_)s
```

其中每一项的含义如下：

- bantime，配置禁止某 IP 多久，默认是 10 分钟
- findtime，时间窗口，在此段时间内多次尝试失败就被 ban 掉，默认是 10 分钟。比如第一次失败是在 10:30，如果在 10:40 之前达到了最大尝试次数就被 ban 掉
- maxretry，最大失败尝试次数
- usedns，如果遇到 hostname 是否使用 DNS 解析
- destemail，通知邮件发给谁
- sender，通知邮件的发送者
- mta，通知邮件的代理
- banaction，使用 `/etc/fail2ban/action.d/iptables-multiport.conf` 来配置达到最大尝试次数后要执行的动作
- protocol，被 ban 掉之后丢弃哪种协议的数据，默认是 TCP


**再次强调，如果要修改配置项，一定修改 jail.local，而不是直接编辑 jail.conf**


## 如果用 Fail2Ban 来加固服务器

下面介绍一下 Fail2Ban 常用的操作。需要知道的是，**Fail2Ban 的相关命令都要有 root 权限或者使用 sudo 才能执行。**


### 启用 Fail2Ban

在如今较新的系统里，可以使用 `systemd` 管理 Fail2Ban：

```
# 启动
systemctl start fail2ban
#开机启动
systemctl enable fail2ban
```

Fail2Ban 启动后可以使用 `fail2ban-client` 命令查看 Fail2Ban 的状态：

```
fail2ban-client status
Status
|- Number of jail: 1
`- Jail list: sshd
```

你可以看到 ssh 服务模块默认就启动了。

### Fail2Ban 的日志

Fail2Ban  的日志位于 `/var/log/fail2ban.log`，格式如下：

```
2019-03-25 07:09:08,004 fail2ban.filter [25630]: INFO [sshd] Found 139.59.69.76 – 2019-03-25 07:09:07
2019-03-25 07:09:36,756 fail2ban.filter [25630]: INFO [sshd] Found 159.89.205.213 – 2019-03-25 07:09:36
2019-03-25 07:09:36,757 fail2ban.filter [25630]: INFO [sshd] Found 159.89.205.213 – 2019-03-25 07:09:36
2019-03-25 07:09:36,774 fail2ban.actions [25630]: NOTICE [sshd] Ban 159.89.205.213
```

你可以看到它在某个 IP 达到最大尝试阈值时就把它 ban 掉了。


### 查看被 ban 掉的 IP

就像之前查看 Fail2Ban 的状态那样，你可以查看某个服务被 ban 掉的 IP，使用方法如下：

```
fail2ban-client status <jail_name>
```

比如你想看看 sshd 模块被 ban 的 IP，就像这样：

```
root@test-server:~# fail2ban-client status sshd 
Status for the jail: sshd 
|- Filter 
| |- Currently failed: 14 
| |- Total failed: 715 
| `- File list: /var/log/auth.log 
`- Actions 
|- Currently banned: 7
|- Total banned: 17 
`- Banned IP list: 177.47.115.67 118.130.133.110 68.183.62.73 202.65.154.110 106.12.102.114 61.184.247.3 218.92.1.150
```

如果你被 ban 掉了，此时你再登录就会提示：

```
ssh: connect to host 93.233.73.133 port 22: Connection refused
```


### 永久 ban 掉一个 IP

现在你知道了 Fail2Ban 会临时 ban 掉一个恶意 IP，默认是 10 分钟，这样的话 10 分钟后攻击者又可以继续尝试登录了。那我们能不能永久 ban 掉一个 IP 呢？这没有一个明确的答案。

在 Fail2Ban 0.11 版本开始，程序会自动计算某个 IP 被 ban 的时间，这个时间是成倍增加的。但你很有可能使用的是更早的版本，可以使用命令 `fail2ban-server --version` 查看版本。在这些比较早的版本里，你可以把 bantime 设置成负值（比如 `bantime = -1`），这相当于永久。但如果你试过就会发现，这样做程序会报错。

一个比较折衷的做法是把 bantime 设置成 一个月 或者 一年。


### 怎么解封一个 IP

首先检查一下某个 IP 是否被 ban 掉了。因为 Fail2Ban 使用 iptables 来 ban 掉 IP 的，那就直接用 iptables 来看：

```
# 这里的 <IP> 替换成你要查看的实际 IP
iptables -n -L | <IP>
```

如果你看到输出里面有这个 IP，就说明被它被 ban 了，再看看它是被哪个服务 ban 的。这就需要查看日志里，比如我这里的示例：

```
root@test-server:~# grep -E ‘Ban.*61.184.247.3’ /var/log/fail2ban.log 
2019-03-14 13:09:25,029 fail2ban.actions [25630]: NOTICE [sshd] Ban 61.184.247.3
2019-03-14 13:52:56,745 fail2ban.actions [25630]: NOTICE [sshd] Ban 61.184.247.3
```

就是 sshd 服务模块把 61.184.247.3 这个 IP ban 掉了。接下来就使用下面的命令来解封这个 IP：

```
# <JAIL_NAME> 替换成你在日志里找到的服务名称
# <IP> 替换成要解封的实际 IP
fail2ban-client set <AIL_NAME> unbanip <IP>
```

### 使用白名单

如果你把自己 ban 掉了，是不是就很难受了，所以可以使用白名单把你自己的 IP 排除在外。直接使用下面的命令：

```
fail2ban-client set <JAIL_NAME> addignoreip <IP>
```

除此之外，你还可以把白名单写在配置文件里，让它永久生效。在 `jail.local` 里面的 Default 段找到 ignoreip 项，后面可以写一串不想被屏蔽的白名单。可以是一个 IP，也可以是一个 CIDR 段，中间用空格分隔。

要查看某个服务的白名单，就用这个命令：

```
fail2ban-client get <JAIL_NAME> ignoreip
```

相应的，才白名单删除某个 IP 就是：

```
fail2ban-client set <JAIL_NAME> delignoreip <IP>
```


## 其他的

上面说的这样就可以让你得心应手了，还有一些比如邮件提醒的功能，你可以自己去深入了解一下，官网在 [Fail2Ban](https://www.fail2ban.org/)。


## 写在最后

这篇小文的原内容主要来自 [Secure Your Linux Server With Fail2Ban [Beginner’s Guide]](https://linuxhandbook.com/fail2ban-basic/)。