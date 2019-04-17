---
layout: post
title:  "异步编程：阻塞 IO 和 非阻塞 IO"
data: 2019-04-07
categories:
- Translate
tags:
- Asynchronous programming
---

![](https://luminousmen.com/media/asynchronous-programming.jpg)

这篇整个 异步编程 系列文章的第一篇。整个系列要回答一个简单问题：什么是异步编程？

起初当我开始深入研究这个问题的时候，我以为我知道它是什么。但事实证明，我并不知道。好了，让我们了解一下吧。

整个系列的文章：

- [Asynchronous programming. Blocking I/O and non-blocking I/O](https://luminousmen.com/post/asynchronous-programming-blocking-and-non-blocking)（翻译即为本篇文章）
- [Asynchronous programming. Cooperative multitasking](https://luminousmen.com/post/asynchronous-programming-cooperative-multitasking)（翻译在 [异步编程：协同多任务](/translate/Asynchronous-Programming-Cooperative-Multitasking)）
- [Asynchronous programming. Await the Future](https://luminousmen.com/post/asynchronous-programming-await-the-future)（翻译在 [异步编程：等待未来](/translate/Asynchronous-Programming-Await-The-Future)）
- [Asynchronous programming. Python3.5+](https://luminousmen.com/post/asynchronous-programming-python3.5)（翻译在 [异步编程：Python3.5+](/translate/Asynchronous-Programming-Python3.5)）

在这篇文章里，我将讨论网络 IO，你可以类比其他 IO 操作，例如将 socket 换成 文件描述符。这里的解释不针对任何编程语言，虽然例子是用的 Python（人生苦短，我爱 Python）。

---

在 C-S 应用中，当客户端向服务端发送一个请求，服务端会处理这个请求然后回一个响应。在这之前，客户端和服务端都要跟对方建立连接，这就是 socket 发挥作用的地方。客户端和服务端都要绑定一个 socket，并且服务端要坚听它的 socket 以便客户端发送请求。

![](https://luminousmen.com/media/asynchronous-programming-blocking-and-non-blocking-1.jpg)

如果你观察过处理器的速度和网络连接的速度，你会发现他们差好几个数量级。事实证明，如果我们的应用使用 IO，那处理器大多时候啥也不做，这类应用被称作 IO 密集型。对于需要高性能的应用，这是个主要的瓶颈，因为其他活动和 IO 操作都在等待 -- 事实证明，这些系统都是 **懒虫**。

IO 可以分为 3 类：**阻塞**、**非阻塞** 和 **异步**。但由于异步不适用于网络，所以我们只讨论 阻塞 和 非阻塞。


## 阻塞 IO

我们使用 Unix（POSIX）的 [BSD socket](https://en.wikipedia.org/wiki/Berkeley_sockets) 为例研究这个问题（Windows 下也是一样的，虽然调用不一样，但逻辑是一样的）。

在阻塞 IO 中，当客户端请求连接服务端时，处理该连接的 socket 会阻塞，直到有数据可读或者所有的数据都写完了。在这个操作完成之前，服务端什么也不能做，只有等待。由此可以得出一个简单的结论：对于单线程，我们只能服务一个连接。默认情况下 TCP 处于阻塞模式。

简单的 Python 示例如下：

``` python
# 客户端
import socket

sock = socket.socket()

host = socket.gethostname()
sock.connect((host, 12345))

data = b"Foo Bar" *10*1024 # Send a lot of data to be sent
assert sock.send(data) # Send data till true
print("Data sent")


# 服务端
import socket

s = socket.socket()

host = socket.gethostname()
port = 12345

s.bind((host, port))
s.listen(5)

while True:
	conn, addr = s.accept()
	data = conn.recv(1024)	
	while data:
		print(data)
		data = conn.recv(1024)
	print("Data Received")
	conn.close()
	break
```

你可能注意到服务端一直打印我们的消息，会持续到所有数据都发送完成。在上面的代码中，过了一会儿才打印 "Data Received"，这是因为客户端要发送大量的数据，占用了时间，直到 socket 阻塞。

这里发生了什么？send() 函数会试图将所有的数据发送给服务端，同时客户端的 **写缓冲区** 会一直有数据。当缓冲区空了，内核会再次唤醒进程去获取下一块要发送的数据。简而言之，你的代码会阻塞，并且不会让其他任何事情被处理。

现在要用这种方法满足 [并发]() 的请求，我们必须有多个线程，也就是为每一个客户端连接分配一个线程。我们等一会儿讨论这个。


## 非阻塞 IO

但是我们有第二个选择 -- **非阻塞 IO**。从字面意思看，跟上一个是不同的 -- 不像阻塞 IO，任何客户端的操作看起来都是立马完成的。非阻塞 IO 意味着一个请求直接排队，然后函数返回。实际的 IO 在随后的某个时间点被执行。

让我们看看这个做了点小修改的客户端例子：

``` python
import socket

sock = socket.socket()

host = socket.gethostname()
sock.connect((host, 12345))
sock.setblocking(0) # Now setting to non-blocking mode

data = b"Foo Bar" *10*1024
assert sock.send(data)
print("Data sent")
```

现在，如果我们运行这个代码，你可能注意到程序只运行了一小会儿时间，就打印了 "Data sent"，然后就退出了。

那这里发生了什么？这里客户端并没有发送所有数据。当我们通过调用 `setblocking(0)` 设置一个 socket 为非阻塞时，它就不会等待操作完成了。因此当我们调用 `send()` 函数 时，它只发送了缓冲区里尽可能多的数据然后就退出了。

有了这个东西，我们就可以只用一个线程同时处理多个不同 socket 的 IO 操作了。但是，因为不知道套接字是否已准备好进行 IO 操作，我们就必须询问每个 socket 他们是否准备好了这个问题，实际上，这就陷入了无尽的循环。

要摆脱这无用的循环，就需要一个 **轮询准备机制**，这个机制可以轮询所有 socket 的准备状态，会告诉我们哪个 socket 准备好新的 IO 了，在这之后又陷入阻塞状态，等待 socket 准备下一次 IO 操作。

有几种机制实现了轮询准备状态，他们在性能和细节上都不一样，但是通常这些细节都对我们是透明的。


### 搜索关键字

通知：

- 水平触发（状态）
- 边缘触发（状态改变）

机制：

- select(), poll()
- epoll(), kqueue()
- EAGAIN, EWOULDBLOCK


## 多任务

我们的目标是并发地管理多个客户端。我们如何确保同时处理多个请求？有几种方案：

### 独立的进程

![](https://luminousmen.com/media/asynchronous-programming-blocking-and-non-blocking-2.jpg)

最简单也是最古老的方法就是每个请求用一个独立的进程。这样挺好，因为我们可以使用相同的阻塞 IO API。如果进程突然挂掉，也只会影响在那个进程里处理的操作。

但缺点是 **通信困难**。在形式上，进程之间几乎没有任何共同点，我们想要做的任何重要沟通都需要额外的代价来同步访问，等等。在某些时间点，多个进程可能只是在等待客户端请求，这是一种资源浪费。

让我们看看实际中是如何工作的：通常我们的第一个进程（主进程）运行后，会做一些例如监听的操作，然后会生成一些进程作为工作进程，每一个进程都在同一个 (listen) socket 上接受请求，等待连接。当一个请求过来时，其中一个进程会占有它 -- 接收这个请求，并从头到尾处理它，关闭这个 socket 之后，再次准备接收下一次请求。进程可以在请求过来的时候再生成，也可以在一开始提前生成好，等等。这可能会对性能有影响，但现在对我们来说不重要。

使用这种系统的例子：

- Apache 的 `mod_prefork`
- 通常大多数运行 PHP 的 FastCGI
- 基于 Ruby on Rails 的 Phusion Passenger
- PostgreSQL


## （系统层面的）线程

另一个方法是使用 [操作系统（OS）](https://en.wikipedia.org/wiki/Operating_system) 的线程。在一个进程里，我们可以生成多个线程。阻塞 IO 也可以用了，因为只有一个线程会被阻塞。OS 它自己管理线程，可以把多个线程分散到不同的处理器上。**线程比进程更轻量**。从本质上讲，这样我们可以在相同的系统上建更多的线程。我们很难运行 10000 个进程，但线程就很容易。并不是说这样会更有效率，而是更轻量而已。

另一方面，线程直接 **没有隔离**。例如，如果有崩溃发生，不只是某个线程崩溃掉，而是整个进程。最大的难点是一个进程的所有线程共享这个进程的内存。一旦我们共享资源，比如内存，也就意味着需要 **同步访问**。同步访问共享内存的问题是最简单的情况，但是，复杂点的，例如，可能有一个与数据库的连接，或者与数据库的连接池，是应用程序内的所有线程共用的。要正确同步资源访问是很困难的。

可能存在的问题：

1. 可能在同步访问的时候形成 [**死锁**](https://en.wikipedia.org/wiki/Deadlock)。当一个进程或者线程由于要访问的系统资源被其他等待状态的进程占有而进入等待状态，而这个进程又在等待其他等待进程占有的资源，这就形成了死锁。

2. 当我们竞争访问共享数据时，出现 **有缺陷的同步**。大致的讲就是两个线程同时修改了数据，就把数据弄坏了。这样的程序很难调试，因为不是所有的 bug 都能立马复现。例如，著名的 [GIL](https://en.wikipedia.org/wiki/Global_interpreter_lock) -- 全局解释器锁 -- 是最简单的构造一个多线程应用的方法。当使用 GIL 时，我们可以说所有的数据结构、内存在正个进程中就只被一个锁保护。这就意味着多线程执行是不可能的，因为只有一个线程可以执行，只有一个锁，如果一个人正在占用，其他的都不能工作了。是的，事实就是如此，但是记住，大多数情况下我们并不会在线程上做任何运算，而是进行网络 IO，因此在进行一个阻塞的 IO 操作时，GIL 就解锁了，线程重置并切换到其他线程准备执行。因此，从后端来看，使用 GIL 并不是什么坏事。当你在多个线程里乘一个矩阵时，使用 GIL 就没用了 -- 这毫无意义因为同一时间只有一个线程在执行（这种说法并不完全对，以后会讨论）。


## 总结

阻塞的函数同步执行 -- 程序运行时，操作在调用后直接执行。

非阻塞函数异步执行 -- 程序运行时，非阻塞操作直接返回，实际的工作在以后进行。

有多种方法实现多任务 -- 线程，进程 等。

下一篇文章里，我会讨论协程及其实现。


---

本篇文章翻译自 [luminousmen](https://luminousmen.com/) 的关于异步编程的系列文章，原文地址在文章开头列出。