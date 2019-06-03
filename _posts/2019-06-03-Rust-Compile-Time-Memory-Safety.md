---
layout: post
title:  "Rust：编译时内存安全"
start: 2019-05-20
data: 2019-06-03
categories:
- Translate
tag:
- Rust
---

在这篇文章中，我将通过在 “动态与静态类型” 和 “C++ 与 Rust 的静态内存安全性” 之间进行类比来解释为什么 Rust 很有趣，没有过多不必要的细节。

<!-- more -->

## 编译是阻止类似错误

静态类型可以在编译是阻止类型错误，例如：

- Python

    ```
    def square(x):
        return x * x

    square("5")
    # Runtime error: Can't multiply sequence by non-int of type 'str'
    ```
- C++

    ```
    int square(int x) {
        return x * x;
    }

    square("5");
    // Compile error: Invalid conversion from ‘const char*’ to ‘int’
    ```

静态类型有以下优势（采用 [Guido Rossum’s Stanford seminar](https://www.youtube.com/watch?v=GiZKuyLKvAA&t=702) 中的内容）：

- 更早得捕获（某些）BUG
- 容易重构
- 阅读代码时更容易在大的代码库中导航
- 比注释更好，编译器会提醒你的

实际上，所有的动态语言都有静态版本项目，通常背后都有大公司支持，因为静态类型的优势在项目非常大时犹为明显。

- Python: [PEP 484 Type Hints](https://www.python.org/dev/peps/pep-0484/), [Dropbox Mypy](http://mypy-lang.org/index.html)
- Javascript: [Microsoft Typescript](https://www.typescriptlang.org/), [Google Closure](https://developers.google.com/closure/compiler/), [Facebook Flow](https://flow.org/)
- Ruby: [Stripe Sorbet](https://sorbet.org/)
- PHP: [Facebook Hack](https://hacklang.org/)
- Lua: [Ravi](https://github.com/dibyendumajumdar/ravi)


## 编译时阻止内存错误

因为内存安全是 C++ 的重大实际问题，那如果能够静态得检查就再好不过了，就像静态类型检查那样。

这就是 Rust 诞生的主要原因之一。就像 C++ 编译器追踪每个变量的类型信息一样，Rust 编译器还会追踪每个变量的属主、生命周期以及别名等等。

下面说的几个内存问题 Rust 都能静态检查到。

### 使用未初始化的变量

- C++

    ```
    int x;
    int y = square(x);
    // 运行时会传递一个垃圾值
    ```
- Rust

    ```
    let mut x: i32;
    let mut y = square(x);
    // 产生编译是错误
    // error[E0381]: use of possibly uninitialized variable: `x`
    //   |
    //   | let mut y = square(x);
    //   |                    ^ use of possibly uninitialized `x`
    ```

### 非法内存访问

- C++

    ```
    int* x = (int*)1234;
    *x = 5;
    // 运行时非法内存访问
    // Segmentation fault (core dumped)
    ```
- Rust

```
let x = 1234 as *mut i32;
*x = 5;
// 编译时错误
// error[E0133]: dereference of raw pointer is unsafe and requires unsafe function or block
//   |
//   | *x = 5;
//   | ^^^^^^ dereference of raw pointer
//   |
//   = note: raw pointers may be NULL, dangling or unaligned; they can violate aliasing rules and cause data races: all of these are undefined behavior
```

### 悬空指针/变量

- C++

    ```
    std::string_view get_extension(std::string filename) {
        return filename.substr(filename.find_last_of('.') + 1);
        // 运行时返回悬空的 std::string_view.
    }
    ```
- Rust

    ```
    fn get_extension(filename: String) -> &'static str {
        return &filename[filename.rfind('.').unwrap()+1..];
        // 编译时错误
        // error[E0515]: cannot return value referencing function parameter `filename`
        //   |
        //   | return &filename[filename.rfind('.').unwrap()+1..];
        //   |        ^--------^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        //   |        ||
        //   |        |`filename` is borrowed here
        //   |        returns a value referencing data owned by the current function
        //   }
        //
    }
    ```

### 不正确地使用 move 过的对象

- C++

    ```
    std::vector<int> x = {1, 2, 3};
    process(std::move(x));
    x.push_back(4);
    // 运行时使用不明状态的对象
    ```
- Rust

    ```
    let mut x = vec![1, 2, 3];
    process(x);
    x.push(4);
    // 编译时错误
    // error[E0382]: borrow of moved value: `x`
    //   |
    //   | let mut x = vec![1, 2, 3];
    //   |     ----- move occurs because `x` has type `std::vec::Vec<i32>`, which does not implement the `Copy` trait
    //   | process(x);
    //   |         - value moved here
    //   | x.push(4);
    //   | ^ value borrowed here after move
    ```

### 多线程数据竞争

- C++

    ```
    #include<iostream>
    #include<thread>
    #include<vector>

    static int MONEY = 0;

    void deposit_money(int amount) {
        for (int i = 0; i < amount; ++i)
            ++MONEY;
            // 运行时产生数据竞争，一些 ++ 操作可能会被忽略
    }

    int main() {
        std::vector<std::thread> threads;

        for(int i = 0; i < 100; ++i)
            threads.emplace_back(deposit_money, 10000);

        for(int i = 0; i < 100; ++i)
            threads[i].join();

        // 由于数据竞争，结果可能是 1000000
        std::cout << MONEY;
    }
    ```
- Rust

    ```
    static mut MONEY: i32 = 0;

    fn deposit_money(amount: i32) {
        for _ in 0..amount {
            MONEY += 1;
            // 编译时错误
            // error[E0133]: use of mutable static is unsafe and requires unsafe function or block
            //   |
            //   |     MONEY += 1;
            //   |     ^^^^^^^^^^ use of mutable static
            //   |
            //   = note: mutable statics can be mutated by multiple threads: aliasing violations or data races will cause undefined behavior
        }
    }

    fn main() {
        let mut threads = vec![];

        for _ in 0..100 {
            let thread = std::thread::spawn(|| deposit_money(10000));
            threads.push(thread);
        }

        for thread in threads {
            let _ = thread.join();
        }

        println!("{}", MONEY);
    }
    ```

为了实现这些静态内存检查，Rust 强制同时只有一个可变属主或者多个只读别名。实际上，无论如何它们都是构建大型代码库的非常好的用法习惯，通常它们不会影响普通应用程序。对于需要细粒度内存控制的库，如向量容器，列表和哈希映射，可以使用 [`unsafe` 关键字](https://doc.rust-lang.org/book/ch19-01-unsafe-rust.html)来绕过限制。

公平地说，我们可以使用编译器选项或外部工具来检测 C++ 内存问题，但由于实现复杂性和固有的语言规范限制，它无法完全接近 Rust 的完整性。

- `-Wall -Wextra` 编译器选项：即使对于上述几个小例子，GCC 8.3 和 Clang 8.0 也只能检测出其中的未初始化变量
- 外部工具，例如 Valgrind，Address/Memory/Thread Sanitizers：它们是很棒的工具。但是在实践中，编译时检查和运行时检查是一个很大的区别，因为运行时检查仅限于我们的特定测试用例。否则，就不需要静态类型检查了，因为我们可以运行测试来捕获类型错误。


## Rust 如何被接受

Rust 已经连续 4 年蝉联 Stack Overflow 开发者最喜爱的编程语言榜 第一名了，2019 年紧随其后的是 Python，Typescript 以及 Kotlin。

此外，它得到了一些资深的 C/C++ 程序员的好评：

- [John Carmack](https://en.wikipedia.org/wiki/John_Carmack): [“…writing Rust code feels very wholesome.”](https://twitter.com/id_aa_carmack/status/1094419108781789184?lang=en)
- [Linus Torvalds](https://en.wikipedia.org/wiki/Linus_Torvalds): [“…We’ve had the system people who used Modula-2 or Ada, and I have to say Rust looks a lot better than either of those two disasters.”](https://www.infoworld.com/article/3109150/linux-at-25-linus-torvalds-on-the-evolution-and-future-of-linux.html)
- [Miguel Icaza](https://en.wikipedia.org/wiki/Miguel_de_Icaza): [“…I have been following an OS written entirely in Rust, and it has great idioms.”](https://www.reddit.com/r/programmerchat/comments/4dxpcp/i_am_miguel_de_icaza_i_started_xamarin_mono_gnome/d1ve1k5?utm_source=share&utm_medium=web2x)


## 使用 Rust 的产品

- [Google Chrome Crosvm](https://chromium.googlesource.com/chromiumos/platform/crosvm/)
- [Facebook’s new Mercurial server](https://www.theregister.co.uk/2016/10/18/facebook_mercurial_devs_forget_git/)
- [Amazon AWS Firecracker](https://www.reddit.com/r/rust/comments/a0rph0/aws_firecracker_microvm_is_all_rust/)
- [Microsoft Azure IoT Edge](https://github.com/Azure/iotedge/tree/master/edgelet)
- [Red Hat Stratis storage](https://github.com/stratis-storage)
- [Dropbox storage optimization](https://qconsf.com/sf2016/sf2016/presentation/going-rust-optimizing-storage-dropbox.html)
- [Mozilla Servo](https://servo.org/)
- [Cloudflare’s QUIC protocol implementation](https://blog.cloudflare.com/enjoy-a-slice-of-quic-and-rust/)
- [NPM](https://www.youtube.com/watch?v=GCsxYAxw3JQ)
- [Unity data engineering](https://twitter.com/bltroutwine/status/1002234680949719040)
- [Twitter build team](https://twitter.com/stuhood/status/978410393944047617?s=19)
- [Reddit comment parsing](https://www.reddit.com/r/rust/comments/7utj4t/reddit_is_hiring_a_senior_rust_engineer/)

## 总结

这只是 Rust 引人注目的一个例子，Rust 还有很多其他的东西是很棒的。希望它能引起你阅读更多关于 Rust 的内容的兴趣！


## 参考

- [https://www.jonathanturner.org/2017/10/fun-facts-about-rust-growth.html](https://www.jonathanturner.org/2017/10/fun-facts-about-rust-growth.html)
- [https://www.jonathanturner.org/2018/07/snapshot-of-rust-popularity.html](https://www.jonathanturner.org/2018/07/snapshot-of-rust-popularity.html)
- [https://users.rust-lang.org/t/rust-quotes-and-press/5405](https://users.rust-lang.org/t/rust-quotes-and-press/5405)
- [https://www.rust-lang.org/production/users](https://www.rust-lang.org/production/users)

---

本文翻译自 [Kibeom Kim](https://kkimdev.github.io/) 发表于其博客的文章 [Rust - Compile Time Memory Safety](https://kkimdev.github.io/posts/2019/04/22/Rust-Compile-Time-Memory-Safety.html)。
