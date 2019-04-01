---
layout: post
title:  "关于除数为常量时的快速取余的更多乐趣"
data: 2019-04-01
categories:
- Translate
tags:
- 取余
---

在编程中，编译器经常会把除法优化掉，取而代之的是耗时更低的指令，尤其当除数为常量时。我最近写了一些[关于除数为常量时的快速取余的内容](https://lemire.me/blog/2019/02/08/faster-remainders-when-the-divisor-is-a-constant-beating-compilers-and-libdivide/)（译注：翻译内容在 [这里](/translate/2019/03/31/Faster-Remainders-When-The-Divisor-Is-A-Constant/)）。我有提到如果直接算出余于是非常有效的，而不需要先计算商（就像是除数为常量时编译器做的那样）。

为了得到好的结果，我们使用了很重要的一点，但没有在任何地方说明：我们使用了 64 位的处理器指令去做 32 位的运算。这很公平，因为编译器也会这样做，但是他们没有系统地做到这一点。如果算法问题恰到好处，单独使用这个技巧就足以在某些情况下获得实质性收益。

因此这还是有点小复杂的。针对 32 位运算使用 64 位指令有时候是有用的。此外，直接计算余数，而不是先算出商，有时候也是有用的。让我们用一个有趣的数据点，来激励我们进一步的工作吧。

首先让我们考虑一下，如果这些繁重的工作都交由编译器来做的话，我们如何计算余数（D 对编译器来说一已知的常量）。我期望编译器能讲下面的代码转换成 32 位的指令序列：

``` c
uint32_t compilermod32(uint32_t a) {
  return a % D;
}
```

接下来我们可以直接计算余数，使用了一些数学技巧和 64 位指令。

``` c
#define M ((uint64_t)(UINT64_C(0xFFFFFFFFFFFFFFFF) / (D) + 1))

uint32_t directmod64(uint32_t a) {
  uint64_t lowbits = M * a;
  return ((__uint128_t)lowbits * D) >> 64;
}
```

最后，你可以“间接地”计算余数（先计算出商），但是使用 64 位指令。

``` c
uint32_t indirectmod64(uint32_t a) {
  uint64_t quotient = ( (__uint128_t) M * a ) >> 64;
  return a - quotient * D;
}
```

对于基准测试，我打算使用上述的 3 种方法再加上原始方法来计算 [线性同余](https://zh.wikipedia.org/wiki/%E7%B7%9A%E6%80%A7%E5%90%8C%E9%A4%98%E6%96%B9%E6%B3%95)（基本上是一个需要余数的递归线性函数）。我使用了常量除数 22，skylake 处理器，以及 GNU GCC 8.1 编译器。对每一个生成的数，我都测量了平均的 CPU 周期：

| --- | --- |
slow (division instruction) | 29 cycles
compiler (32-bit) | 12 cycles
direct (64-bit) | 10 cycles
indirect (64-bit) | 11 cycles

[源代码](https://github.com/lemire/Code-used-on-Daniel-Lemire-s-blog/tree/master/2019/02/19) 在这里。

根据你的平台不同，这 3 种方法都可能是最优结果。某些情况下，甚至原生除法指令都可能胜出。例如，[在 ARM 和 POWER 处理器上，除法指令就打败了一些编译器](https://arxiv.org/pdf/1902.01961.pdf)。

最后我们得到了什么呢？除了一个简单的 C 函数可以打败先进的优化编译器外，再无其他。但在很多情况下，我们发现使用 64 位指令来直接计算 32 位取余最好了。

---

本文翻译自 Daniel Lemire 的文章，原文发表于其 [博客](https://lemire.me/blog/2019/02/20/more-fun-with-fast-remainders-when-the-divisor-is-a-constant/)。
