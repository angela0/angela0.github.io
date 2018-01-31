---
layout: post
title:  "Linux 中的那些 limits"
data: 2017-03-09
categories:
- Linux
tags:
- limits
- ulimit
---

Linux 是一个多用户操作系统，所以必须要有一种机制来限制每个用户能够使用的资源，这就是 limit 存在的意义。

当你使用 `ulimit -a` 命令时，会输出类似下面的内容：

	core file size          (blocks, -c) 0
	data seg size           (kbytes, -d) unlimited
	scheduling priority             (-e) 0
	file size               (blocks, -f) unlimited
	pending signals                 (-i) 15324
	max locked memory       (kbytes, -l) 64
	max memory size         (kbytes, -m) unlimited
	open files                      (-n) 1024
	pipe size            (512 bytes, -p) 8
	POSIX message queues     (bytes, -q) 819200
	real-time priority              (-r) 0
	stack size              (kbytes, -s) 8192
	cpu time               (seconds, -t) unlimited
	max user processes              (-u) 15324
	virtual memory          (kbytes, -v) unlimited
	file locks                      (-x) unlimited
	
	
ulimit 是 shell 内建命令，可以输出的是当前用户的进程各种资源的限制，当然也可以用来设置这些限制的上限。主要用法如下：

	ulimit [-H | -S] [-a] [[-c] [-d] [-e] [-f] [-i] [-l] [-m] [-n] [-p] [-q] [-r] [-s] [-t] [-u] [-v] [-x] [limit]]
	
-H 输出/修改硬限制， -S 输出/修改软限制，在不指定时，默认输出/修改软限制

-a 仅仅作为输出所有项使用

如果某个项后面跟了 [limit] 选项，则将该项设置为该 limit 值；否则仅仅输出该项的限制值

下面解释一下各个限制：

|  F  |        eng           |    unit   |    chinese   |
| --- |:-------------------- |:---------:| ------------ |
| -c  | core file size       |  blocks   | 文件转储的大小限制，如果是 0，则不转储 (core) |
| -d  | data seg size        |  kb       | 最大数据段大小 (data) |
| -e  | scheduling priority  |           | 最大调度优先级 (nice) |
| -f  | file size            |  blocks   | 最大创建的文件大小 (fsize) |
| -i  | pending signals      |           | 最大等待信号数量 (sigpending) |
| -l  | max locked memory    |  kb       | 最大锁定在存储区中的虚拟地址空间大小 (memlock) |
| -m  | max memory size      |  kb       | 最大驻内存集的大小(RSS) |
| -n  | open files           |           | 最大可打开文件数量 (nofile) |
| -p  | pipe size            |  512bytes | 管道大小 |
| -q  | POSIX message queues |  bytes    | 最大 POSIX 消息队列大小 (msgqueue) |
| -r  | real-time priority   |           | 最大非特权进程实时优先级 (rtprio) |
| -s  | stack size	         |  kb       | 最大栈空间 (stack) |
| -t  | cpu time             |  seconds  | 每个进程最多可使用的 CPU 时间 (cpu) |
| -u  | max user process     |           | 最大进程数量 (nproc) |
| -v  | virtual memory       |  kb       | 最多可用存储区的大小 (AS) |
| -x  | file locks           |           | 最大文件锁数量 (locks) |


需要注意的是，`ulimit`命令修改限制后，仅仅对该会话有效，登出后失效。如果你需要每次登陆都生效，你可以将该命令加到 `profile`文件里面，或者使用 PAM 的 `limits.conf`。

如果仅仅针对你的进程使用，可以在进程中调用 `setrlimit` 函数来设置，包含在 `<sys/resource.h>` 头文件中。
