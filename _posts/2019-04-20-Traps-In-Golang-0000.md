---
layout: post
title:  "Golang 中的陷阱 -- 0000"
data: 2019-04-20
categories:
- Tips
tags:
- Golang Traps
---

这个系列介绍 Golang 中的那些坑，不知道 4 位数的编号够用不 😂！本篇是关于 defer 的。

---

defer 是 Golang 的一个语法特性，可以让你在函数结束之后执行某些预设的操作，比如在函数结束时，关闭打开的文件。但就这个非常用于的东西，隐藏了许多的坑。

今天的坑从下面这个代码看起：

``` go
func test() {
    i := 0
    defer fmt.Println(i)
    i = 1
}
```

你猜猜 `test` 这个函数会输出什么呢？没错，就是输出 0。

这是因为要 defer 的函数在声明 defer 语句时就已经确定形参了，在这个例子中就是 0。所以最后在函数结束时会打印出 0。

如上面的例子中，在 defer 之后修改了 i 的值，而我们又是想要输出最终的 i 的值，那怎么办呢？我通常的做法是包裹一层匿名函数：

``` go
func test() {
    i := 0
    defer func() {
        fmt.Println(i)
    }()
    i = 1
}
```

这是因为在执行到 defer 语句时，匿名函数内部并没有执行，直到最后该匿名函数真正开始执行。

你有没有被坑到呢？