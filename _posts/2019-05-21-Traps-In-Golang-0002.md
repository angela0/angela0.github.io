---
layout: post
title:  "Golang 中的陷阱 -- 0002"
data: 2019-05-21
categories:
- Tips
tags:
- Golang
---

这个系列介绍 Golang 中的那些坑，不知道 4 位数的编号够用不 😂！本篇是关于 `-race` 这个编译参数的。

<!-- more -->

---

这不算是 Golang 的坑，但如果你没有仔细阅读 [race 的文档](https://golang.org/doc/articles/race_detector.html)，包括最最后面的一节，你很有可能把它用于生产环境。这点算是本文的结论吧：**千万不要在生产环境使用 `-race`**。

数据竞争可能是比较难调试的 BUG，所以 Golang 提供了 `-race` 这个编译时选项来帮你检测数据竞争。用法有这么几种：

```
$ go test -race mypkg    // to test the package
$ go run -race mysrc.go  // to run the source file
$ go build -race mycmd   // to build the command
$ go install -race mypkg // to install the package
```

输出也很清晰明了，你可以查看上面给的那个文档。并且目前只支持 `darwin/amd64`、`freebsd/amd64`、`linux/amd64`、 `windows/amd64` 这 4 种系统。

如果你看了最后一节，就会发现它的开销非常大，内存会增加 5~10 倍；CPU 会增加 2~20 倍。所以它只能在调试时候用。

最后再强调一遍，**千万不要在生产环境使用**。