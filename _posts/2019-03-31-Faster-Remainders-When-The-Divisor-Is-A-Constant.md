---
layout: post
title:  "除数为常量时的快速取余法：优于编译器优化和libdivide"
data: 2019-03-28
categories:
- Translate
tags:
- 取余
---

现代处理器的所有指令耗时并不相同。加法和减法比乘法耗时少，而他们都比除法耗时少。因此，编译器经常将除法替换成乘法。大致来讲，它就是这样工作的。假设你想要用一个常量 d 去除一个变量 n，你可以得到这样一个等式 `n/d = n * (2^N/d) / (2^N)`。而如果我们使用无符号证书的话，除以 2 的次幂（/ (2^N)）可以实现成右移操作，这就编译成一条指令了：因为底层硬件使用 2 进制。因此，如果我们把 2^N/d 事先算出来，就可以使用一次乘法和一次移位来计算 n/d。当然，如果 d 不是 2 的次幂，2^N/d 可能算出来的不是整数。但是只要 N 足够大[^footnote]，我们就可以近似认为 2^N/d 是一个整数，并能准确计算范围内所有可能的n的余数。我相信所有的带优化的 C/C++ 编译器都会使用这个把戏，无论什么处理器架构，这通常都有用。

这个想法并不新奇，至少可以追溯到 1973 年（Jacobsohn）。然而，实际却遇到了麻烦，因为计算机寄存器的位数是有限的，那么乘法可能会溢出。历史上，这个方法是 [Granlund 和 Montgomery（1994 年）](https://dl.acm.org/citation.cfm?id=178249) 第一次引入主流编译器（GNU GCC 编译器）。GNU GCC 和 Go 如今依然使用 Granlund 和 Montgomery 开发的方式，而其他像 LLVM 的 clang 则使用 Warren 的 [Hacker’s Delight](http://a-fwd.com/asin-com=0321842685&com=daniellemires-20&ca=danilemisblog-20&uk=danilemisblog-21&de=danilemisbl05-21&fr=danilemisbl0e-21&it=danilemisbl02-21&jp=danilemisblog-22&cn=danilemisblog-23&fb=com&sc=w) 一书中提到的略微改进的版本。

如果 d 是一个常量，但编译器却不知道怎么办？那你还可以使用像 libdivide 这样的库。在某些场景下，libdivide 甚至比编译器更加有效，因为它使用了 [Robison （2005 年）](https://www.computer.org/csdl/proceedings/arith/2005/2366/00/23660131-abs.html) 提出的方法，这里它除了乘法和移位还使用了加法来避免算术溢出。

我们还有更好的方法吗？事实证明在某些场景下，我们可以打败编译器和 libdivide。

迄今为止我描述的都是计算 n/d 的商，但我们更经常计算的是他们的余数（也就是 n%d)。那编译器如何计算余数呢？他们会先计算 n/d 的商，然后乘以被除数，最后再用原来的值去减（用符号表示就是 n%d = n-(n/d)*d ）。

我们有更直接的方法吗？答案是肯定的。

让我们再看看那个直观的等式 `n/d = n*(2^N/d) / (2^N)`。注意到我们是如何计算乘法然后再丢掉最低的 N 个有效位了吗？可以证明的是，如果我们不丢弃这些最低有效位，而用除数乘以他们，我们就得到了余数，相当直接而不用像之前那样计算商了。

直观地举个例子。要用 5 除以 4，你可以改成乘以 0.25。计算 5 * 0.25 得到 1.25。整数部分 1 就是商，而小数部分 0.25 就跟余数有关：你用 4 乘以 0.25 得到 1，这个 1 就是余数。这个方法不止可以快速计算余数，他还能让你快速检测一个整数时候能被其他数除尽：计算 x * 0.25，如果 x 是 4 的倍数，则小数部分一定小于 0.25。

这个方法就是 Jacobsohn 在 1973 年提出的。但据我所知他并没有给出数学推导。Vowels 在 1994 年得出了除数是 10 的情况，但没有人算出更一般的情况。它现在出现在了 Software 期刊的论文 [Faster Remainder by Direct Computation](https://arxiv.org/abs/1902.01961) 里。

具体而言，下面是除数 d 固定的取余运算的 C 代码：


``` c
uint32_t d = ...;// your divisor > 0

uint64_t c = UINT64_C(0xFFFFFFFFFFFFFFFF) / d + 1;

// fastmod computes (n mod d) given precomputed c
uint32_t fastmod(uint32_t n ) {
  uint64_t lowbits = c * n;
  return ((__uint128_t)lowbits * d) >> 64; 
}
```

除性测试类似：

```
uint64_t c = 1 + UINT64_C(0xffffffffffffffff) / d;


// given precomputed c, checks whether n % d == 0
bool is_divisible(uint32_t n) {
  return n * c <= c - 1; 
}
```

为了得出结论，我们做了很多测试，其中一组测试我们使用了依赖取余计算的 hash 函数。我们改变除数，并计算了许多随机值。一种情况下，我们确保让编译器无法推断除数已知，也就是直接使用除法指令。其他情况都是让编译器该做啥做啥，最后插入我们的函数。在最近的 Intel 处理器（Skylake）上，我们打败了最先进的编译器（如 LLVM 的 clang，GNU GCC）。

![](https://lemire.me/blog/wp-content/uploads/2019/02/hashbenches-skylake-clang.png)

余数计算非常棒，但我更喜欢除性测试。编译器通常不能很好地优化除性测试。像 `(n % d) == 0` 这样的一行代码，编译器通常通常会计算一下余数，然后看余数是否是 0。Granlund 和 Montgomery 有一个更好的办法，假如能够提前知道 d 的话，并且还要使用牛顿法来求奇整数的逆元。在测试中，我们的方法更简单并且更快（所有测试的平台都是如此）。它只要乘以一个常量再和这个常量比较一下而已：没有比这更快的了。这样看来，编译器可以很容易地应用这个方法。


我们把这些函数打包成了[一个头文件库](https://github.com/lemire/fastmod)，它在主流的 C/C++ 编译器（GNU GCC，LLVM 的 clang， 以及 Visual Studio）下都能工作。我们也发布了用于研究目的的 [基准测试](https://github.com/lemire/constantdivisionbenchmarks)。

这篇论文很短但简明扼要。虽然有一些数学内容，但我们努力地让它们尽可能的易于理解。此外，不要跳过引言部分，这里讲了个好故事。

这篇论文包含精心设计的基准，但我为这篇博客提出了一个有趣的测试，我把它叫作 "fizzbuzz"。让我们遍历一下一个序列里的所有整数，然后数一数有多少能被 3 整除，有多少能被 5 整除。有许多更有效的方法来做这件事，这里给出一个 C 语言 编程 101 的方法：

``` c
for (uint32_t i = 0; i < N; i++) {
    if ((i % 3) == 0)
      count3 += 1;
    if ((i % 5) == 0)
      count5 += 1;
}
```

下面是我们的方法：

``` c
static inline bool is_divisible(uint32_t n, uint64_t M) {
  return n * M <= M - 1;
}

...


  uint64_t M3 = UINT64_C(0xFFFFFFFFFFFFFFFF) / 3 + 1;
  uint64_t M5 = UINT64_C(0xFFFFFFFFFFFFFFFF) / 5 + 1;
  for (uint32_t i = 0; i < N; i++) {
    if (is_divisible(i, M3))
      count3 += 1;
    if (is_divisible(i, M5))
      count5 += 1;
  }
```

下面是检查每一个整数花费的平均时间：

| ---- | ---- |
| Compiler | 4.5 cycles per integer |
| Fast approach	| 1.9 cycles per integer |


我把 [这个基准测试代码](https://github.com/lemire/Code-used-on-Daniel-Lemire-s-blog/tree/master/2019/02/08) 整理出来了。这个测试我用了 Intel skylake 处理器 和 GCC 8.1。

你的结果可能不一样。我们提出的方法可能并不总是更快。但我们可以声明的是，在某些情况下它确实有优势。

**更新**： 这里有一个 [go 库](https://github.com/bmkessler/fastdiv) 实现了这个方法。

**延伸阅读**：[Faster Remainder by Direct Computation: Applications to Compilers and Software Libraries](https://arxiv.org/abs/1902.01961), Software: Practice and Experience (to appear)

**后续文章**：[关于除数为常量时的快速取余的更多乐趣](https://lemire.me/blog/2019/02/20/more-fun-with-fast-remainders-when-the-divisor-is-a-constant/)，在这里我讨论了一些更精细的东西。

[^footnote]: N 是多少？如果被除数 n 和 除数 d 都是 32 位无符号整数，那你可以选择 N = 64。但这不是最小的可能值。最小的可能值在 [我们论文](https://arxiv.org/abs/1902.01961) 的第二个算法里给出了，但是有点数学化（注：论文中的符号和这篇博客里不太一样，N 变成了 F）。

