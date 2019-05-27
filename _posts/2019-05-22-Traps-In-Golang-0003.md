---
layout: post
title:  "Golang 中的陷阱 -- 0003"
data: 2019-05-22
categories:
- Tips
tags:
- Golang
---

这个系列介绍 Golang 中的那些坑，不知道 4 位数的编号够用不 😂！本篇是关于 `time.Timer` 的。

<!-- more -->

---

这篇文章依然是要告诉你熟读文档的重要性，尤其是犄角旮旯的地方。

`time` 包中提供了一个定时器 `Timer`，它实际上是使用了 runtime 里的定时器。在创建定时器后，你可以使用它的 channel `t.C` 判断是否超时； `Stop` 方法来停止；使用 `Reset` 方法重置定时器。


这里主要说一下 Reset，因为在 Reset 的时候会和当前定时器超时产生竞争条件。

如果定时器已经从 t.C 中收到信号，你当然可以直接 Reset；如果还没有，你就必须先 Stop 定时器，如果 Stop 的返回值为 false，你还得先清
空 t.C 里面的值：

```
if !t.Stop() {
	<-t.C
}
t.Reset(d)
```

这样用的时候还要注意，不能和其它读 t.C 产生竞争。

此外，不要使用 Reset 的返回值，因为竞争条件的原因，返回值可能是错误的。
