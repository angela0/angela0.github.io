---
layout: post
title:  "Golang 中的陷阱 -- 0001"
data: 2019-04-28
categories:
- Tips
tags:
- Golang
---

这个系列介绍 Golang 中的那些坑，不知道 4 位数的编号够用不 😂！本篇是关于 defer 的。

<!-- more -->

---

今天的这个也许不能算做坑，但如果你不知道这个点，就很可能犯错，先看看 Golang 文档中的这段代码：

``` go
func test() (result int) {
	defer func() {
		result *= 7
	}()
	return 6
}
```

你猜猜 `test` 这个函数的返回值是多少呢？如果初看，你可能会觉得是 0，6，7 还是 42 呢。没错真正的结果却是 `42`。

这个问题的关键点在于，`test` 函数在执行 `return` 语句之后才会执行被 defer 的函数，而此时 `test` 的命名返回值 `result` 就已经被赋值了。所以最后结果是 `42`。

你有没有被坑到呢？