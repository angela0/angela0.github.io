---
layout: post
title:  "使用 Rust 实现 NES 模拟器"
data: 2019-04-04
categories:
- Translate
tags:
- Rust
- NES Emulator
---

最近我制作了一款 [NES 模拟器](https://github.com/MichaelBurge/nes-emulator)，它是 1983 年发布的游戏机。

在这篇文章里，我会讲一下如何用 [Rust](https://www.rust-lang.org/) 开发这个模拟器的。涉及以下几个问题：

- 这个模拟器都有什么特性？可以用它玩哪些游戏？
- 我是如何解决模拟 NES 的问题？
- Rust 的类型系统和 borrow checker 会有什么影响？是否存在性能问题？


目录：

- [结果](#Result)
- [模拟器](#Emulator)
    - [时钟](#Clocked)
    - [地址空间](#AddressSpace)
    - [CPU](#CPU)
    - [PPU](#PPU)
    - [存储状态](#SaveStates)
- [Rust 语言](#Rust)
    - [整型溢出](#IntegerOverflow)
    - [单一属主](#SingleOwnship)
    - [性能](#Performance)
        - [除法](#Division)
        - [迭代器](#Iterators)
        - [搜索顺序](#SearchOrder)
- [总结](#Conclusion)



## <a name="Result"></a> 结果

超级马里奥兄弟在我的模拟器是可以跑：

`<iframe width="560" height="315" src="https://www.youtube.com/embed/PiHsOFmj8ts" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`


特性：

- 稳定运行在 60 FPS（在“无头”模式下可以到达 430 FPS）
- 可以使用 Xbox 360 手柄
- 可以随时储存。用完美操作惊艳你的朋友吧
- 视频录制和储存一起使用，可以记录一连串的控制输入

测试的有：

- 大金刚（Donkey Kong）
- 超级马里奥兄弟（Super Mario Bros）


还有一些遗留问题等待解决：

- 支持更多的 [mapper](https://wiki.nesdev.com/w/index.php/Mapper) 来玩更多的游戏
- 可以使用键盘作为输入设备
- 声音有点异常，尽管我不知道该如何描述

Rust 似乎很适合这个项目。迭代器 和 Trait通常不会拖慢程序（下面有个例外）。既然 NES 是一个固定硬件设备，那就不需要动态分配[^note1]了，并且 Rust 可以很容易地推断已经分配的内存及其所有权模型。

人们总是想要在 [奇奇怪怪的嵌入式系统上](https://arstechnica.com/gaming/2018/07/nintendo-hid-a-load-your-own-nes-emulator-inside-a-gamecube-classic/) 运行模拟器。这种情况下， C 肯定是最好的选择：找到一个能实现 Rust 编译器的人，比实现 C 编译器的人更难。

但 Rust 似乎能用在所有 C++ 可以用的地方。


## <a name="Emulator"></a> 模拟器

模拟器各个组件分离。主要有：

- [MOS 6502](https://en.wikipedia.org/wiki/MOS_Technology_6502) CPU
- 自定义的 [图片处理单元（PPU）](https://wiki.nesdev.com/w/index.php/PPU)
- 自定义的 [音频处理单元（APU）](https://wiki.nesdev.com/w/index.php/APU)
- 可写内存（RAM）或者 只读内存（ROM）
- [控制器](https://wiki.nesdev.com/w/index.php/Standard_controller)
- 使用 [自定义电路（mapper）](https://wiki.nesdev.com/w/index.php/Mapper) 的卡带


这些组件要么是和 **时钟** 相关，要么映射到 2 个 **地址空间** 中的一个。我把每个组件都定义成一个 [C Struct](https://doc.rust-lang.org/rust-by-example/custom_types/structs.html)，并且实现 2 个 [Trait] 中的一个来指明它如何跟其他组件交互。

对于 视频、音频以及控制器 和 操作系统交互，我使用了 [SDL 库](https://github.com/Rust-SDL2/rust-sdl2)。

下表是我程序里面所有的结构。他们一般都对应着实际的像 RAM 或者 内部计时器 的硬件组件。

| Structure Name | Component | Clocked? | Address Space? | Description |
| :---: | :---: | :---: | :---: | :---: |
| Nes | | T | F | 顶级硬件组件，其他组件都是它的成员 |
| C6502 | CPU | T | T | CPU 组件 |
| Ppu | PPU | T | T | 产生一个 256x240 的像素显示 |
| PpuRegisters | PPU | F | F | 隐藏一些复杂的内部 PPU 状态 |
|PaletteControl | PPU | F | T | 储存从 64 种可能选择的 13 种颜色 |
| CpuPpuInterconnect | PPU | F | T | 映射某些 PPU 寄存器到 CPU 的地址空间 |
| Sprite | PPU | F | F | 表示 OAM 里的一个 4 字节条目 |
| Apu | APU | T | T | 生成音频样本 |
| Frame Counter | APU | T | F | 每 1/4 帧或者半帧生成一个时钟信号 |
| Length Counter | APU | T | F | 在一定数量的时钟周期之后静音一个音频通道 |
| Linear Counter | APU | T | F | 根据记时器静音一个音频通道，和 Length Counter 略微不同 |
| Triangle | APU | T | F | 一个三角波的音频通道 |
| Sweep | APU | T | F | 动态改变一个音频通道的高音 |
| Envelope | APU | T | F | 动态改变一个音频通道的音量 |
| Pulse | APU | T | F | 一个脉冲波/方形波的音频通道 |
| Noise | APU | T | F | 伪随机噪音的音频通道 |
| Dmc | APU | T | F | 预制音频样本的音频通道 |
| Ram | | F | T | 可读写内存的一个固定大小块 |
| Rom | | F | T | 只读内存的一个固定大小块 |
| MirroredAddressSpace |  | F | T | 使其他 `地址空间（AddressSpace）` 出现在多个区域。参见 [内存镜像（Memory Mirroring）](https://wiki.nesdev.com/w/index.php/Mirroring#Memory_Mirroring) |
| NullAddressSpace | | F | T | 表示未映射的地址空间。读时返回 0，写时啥也不做  |
| Mapper | | F | T | 把地址空间分隔成区域，每个区域都分配给其他 `地址空间（AddressSpace）` 类型  |
| Joystick | Input | F | T | 控制器输入和 CPU 通信 |
| Ines | Cartridge | F | F | 一个游戏卡带，使用 [iNES](https://wiki.nesdev.com/w/index.php/INES)格式表示 |

在这一章，我会谈谈最重要的几个，以及将它们联系在一起的 trait。


### <a name="Clocked"></a> Clocked

``` rust
pub trait Clocked {
    fn clock(&mut self);
}
```

时钟周期是组件可以进行的最小离散步骤：在时钟周期之外不应该有可观察到的变化。

CPU 就是一个时钟组件。一条 CPU 指令可能这样：

- 请求某个地址个 8 位数值
- 尝试在某个地址储存一个 8 位数值
- 使用算术逻辑单元（ALU）计算加法


钟控元件的时钟精确仿真是最准确的[^note2]，但程序员 -- 甚至是 20 世纪 80 年代的粗犷程序员 -- 通常不依赖于 CPU 的逐个时钟细节。通常认为一个 按位与（Bitwise AND） 指令使用 6 个时钟周期，但在时钟 #2 上做了一次内存读取，在时钟 #6 上做了一次内存写入。因此在一个时钟周期内运行整个 CPU 指令，然后在接下来的 5 个周期内不执行任何操作，可能是一种可接受的精度损失。

NES 有一个 **主时钟（Master Clock）**，所有其他的时钟组件以该速度的多少分之一运行：

| Component | Clock Speed |
| --- | --- |
| Master | 1:1 = 21.477272 Mhz |
| CPU | 1:12 |
| PPU | 1:4 |
| APU | 1:24 |


APU 的组件有 2 个不同的时钟信号：一个来自 APU 时钟，另一个来自内部的 ** FrameCounter**，它每半帧或1/4帧就发一次信号。

### <a name="AddressSpace"></a> 地址空间

当一个组件要读写某个地址的值时，它要把该地址放在 **地址总线上（Address Bus）**。还有一个 **数据总线（Data Bus）** 来放要读写的值。其他组件坚听分配给他们的特殊地址。

模拟的地址空间就是组件要操作的地址的分配。

``` rust
pub trait AddressSpace {
    fn peek(&mut self, ptr: u16) -> u8;
    fn poke(&mut self, ptr: u16, value: u8);
}
```

NES 有 2 个不同的地址空间，分别由 CPU 和 PPU 使用：

- [CPU 内存映射](https://wiki.nesdev.com/w/index.php/CPU_memory_map)
- [PPU 内存映射](https://wiki.nesdev.com/w/index.php/PPU_memory_map)

CPU 主要处理游戏逻辑，而 PPU 的地址空间用来存储精灵、背景以及颜色。

卡带在 2 个地址总线上都坚听。他们并不只是拥有一列字节的简单 ROM，因为它们可以有任意电路[^note3]。游戏可以包含额外的 RAM 和、为了特殊计算的协处理器，或者为了改变地址空间的控制寄存器。

超级马里奥兄弟3通过告诉卡带突然在两个不同的背景图块模式之间切换来使背景动画。当 PPU 从相关的地址读取数据，卡带突然开始返回不同的背景数据。否则不可能在一帧内更新完整的背景。

![](http://www.michaelburge.us/assets/articles/20190318-nes-emulator/bankswitch.gif)


### <a name="CPU"></a> CPU

CPU 处理游戏逻辑：当 马里奥 跳跃、踩库巴或者掉进坑里了会发生什么？

它一遍又一遍得获取、解码并执行当前 **程序记数器** （CPU 地址空间的一个指针）下的指令，执行完 程序记数器 自增指向下一条指令。

CPU 只能执行 3 种基本操作：

- 读请求（在 CPU 地址空间）
- 写请求
- 修改内部寄存器

所有的指令都是由他们组合而来。使用 [Absolute,X 地址模式的算术左移](http://obelisk.me.uk/6502/reference.html) 指令（`0x1E`） 要用 7 个时钟周期，CPU 需要执行以下 7 个操作[^note4]：

- (1) 在当前程序记数器那里获取操作码 `0x1E`
- (2,3) 获取一个 2 直接的值 `V`
- (4) 把 `X` 寄存器加到 `V` 上
- (5) 在地址 `X+V` 处获取一个 1 字节的值 `a`
- (6) 计算值 `b = a << 1`，更新几个状态标记（status flag）
- (7) 把值写回 `X+V`

这是个复杂的操作，但每一步却非常简单：4 个内存读取，2 个使用 ALU 的计算，以及 1 个内存写入。

我根据基础操作实现了每一个指令，使用 [`nestest`](https://wiki.nesdev.com/w/index.php/Emulator_tests) 测试 ROM 生成了逐条指令日志，并验证了匹配参考日志。


### <a name="PPU"></a> PPU

在 60 **帧每秒**（FPS）时，NES 的 CPU 每帧可以执行 29780 个时钟周期[^note5]，但有 61440 个不同的像素要显示。因此，即使要画一个空白屏幕 CPU 也显得太慢。

一个 **图片处理单元**（PPU）以 3 倍 CPU 时钟的速度运行，每个周期都发出了一像素。它的可用周期比要发出的像素多，所以空闲时间（“垂直空白”）被 CPU 用于配置 PPU 的下一帧。

PPU 绘制 2 个东东：背景墙和精灵。一次最多显示 32 x 30 个背景墙和 64 个精灵，并且他们共享一个大小为 512 的 8x8 4 色 模式池。

PPU 的地址空间里有 4 个表可以配置这些：

- **Nametable**：一个 32x30 字节的表来指定使用哪个 8x8 的模式
- **Attribute Table**：对于每个 16x16 的背景组，指定使用哪个 4 色 调色板
- **Object Attribute Memory**（OAM）：存储 64 个精灵的位置、调色板以及状态
- **Palette**：有 8 个不同的 4 色调色板。第一个颜色总是透明，其他 3 个从 64 种 **系统色（System Colors）** 里面选择

PPU 和 CPU 有不同的地址空间，但它们不是孤立的。它们之间有 3 个通信通道：

- 有 8 个 PPU 寄存器映射到 CPU 的地址空间
- PPU 会触发 2 个 CPU 中断：结束扫描线（End-of-scanline） 和 垂直空白（Vertical Blank）
- 卡带它自己可以根据对 CPU 地址空间的读或者写来修改它的 PPU 地址空间

在每个时钟周期 PPU 可以进行 5 个基础操作：

- 请求一次读（在 PPU 地址空间）
- 请求一次写
- 修改内部寄存器
- 发出一个像素
- 触发 CPU 中断

测试 PPU 比 测试 CPU 更难：许多 PPU 必须在运行后才能获得任何输出。我推荐分别打印出 4 个表，一旦数据确认正确，然后就测试是否对于任何特定像素他们能正确组合。


### <a name="SaveStates"></a> 储存状态

模拟器的一个重要特征是要随时随地地储存和加载。每个组件都要实现 `Savable` trait：

``` rust
pub trait Savable {
    fn save(&self, fh: &mut Write);
    fn load(&mut self, fh: &mut Read);
}
```
有 2 个特性让这个模型非常有用：

- 加载 ROM 之后，我的模拟器不分配内存。因此每个对象可以就地写入
- 加载一个 ROM 总是创建相同类型的组件，因此从前一个程序执行得到的值可以认为是兼容的

第一个特性保证了指针不会被 储存状态恢复 影响。如果一个组件是动态分配的，而 储存状态 在组件的生命周期之前或之后被加载，那么任何指向它的指针将不在可用。这需要追踪哪些对象指向了哪些对象。

如果第二个特性失败了（比如说，有人拔下了标准的 NES 控制器，然后插上了新的 SNES 控制器），那么 储存状态文件 将需要包含类型信息，因此正确的 `load` 方法被调用。

然而，假设这些限制使序列化变得简单了。例如：

``` rust
impl Savable for C6502 {
    fn save(&self, fh: &mut Write) {
        self.acc.save(fh);
        self.x.save(fh);
        self.y.save(fh);
        self.pc.save(fh);
        self.sp.save(fh);
        self.carry.save(fh);
        self.zero.save(fh);
        self.interruptd.save(fh);
        self.decimal.save(fh);
        self.overflow.save(fh);
        self.negative.save(fh);
        self.mapper.save(fh);
        self.counter.save(fh);
        self.clocks.save(fh);
        self.is_tracing.save(fh);
        self.clocks_to_pause.save(fh);
    }
    fn load(&mut self, fh: &mut Read) {
        self.acc.load(fh);
        self.x.load(fh);
        self.y.load(fh);
        self.pc.load(fh);
        self.sp.load(fh);
        self.carry.load(fh);
        self.zero.load(fh);
        self.interruptd.load(fh);
        self.decimal.load(fh);
        self.overflow.load(fh);
        self.negative.load(fh);
        self.mapper.load(fh);
        self.counter.load(fh);
        self.clocks.load(fh);
        self.is_tracing.load(fh);
        self.clocks_to_pause.load(fh);
    }
}
```

每一个组件都像这样，除了像 `bool` 和 `u32` 这样的基础组件。这些基础组件也不太难：

``` rust
impl Savable for u32 {
    fn save(&self, fh: &mut Write) {
        let bytes = [
            ((*self >> 0 ) & 0xff) as u8,
            ((*self >> 8 ) & 0xff) as u8,
            ((*self >> 16) & 0xff) as u8,
            ((*self >> 24) & 0xff) as u8,
        ];
        fh.write_all(&bytes);
    }
    fn load(&mut self, fh: &mut Read) {
        let mut bytes = [0u8; 4];
        fh.read_exact(&mut bytes);
        *self = 0;
        *self |= (bytes[0] as u32) << 0;
        *self |= (bytes[1] as u32) << 8;
        *self |= (bytes[2] as u32) << 16;
        *self |= (bytes[3] as u32) << 24;
    }
}
```

Rust 的 trait 对于实现 储存状态 非常有用。编译器推断每个类型都需要 `save` 和 `load` 方法，因此代码非常整齐。

视频回放功能建立在 每帧储存 8 位的储存状态 之上，每一个状态表示是否有控制器按钮按下。当一个 储存状态 被恢复时，同时还恢复了活跃的输入列表。


## <a name="Rust"></a> Rust 语言

上一章在高级层面展示了一下我如何设计 NES 模拟器。这一章我来谈谈 Rust 语言。

### <a name="IntegerOverflow"></a> 整型溢出

默认情况下，如果有任何算术操作溢出 Rust 都会抛出异常。这在测试期间能捕获相当多的 bug，因为 [wrapping_*](https://doc.rust-lang.org/std/primitive.u32.html#method.wrapping_add) 函数需要明确的类型信息，并且一个数是 16 位值还是 8 位值非常重要。

我在模拟器里使用了类似 `wrapping_add` 的函数，但也有一些 [Wrapping](https://doc.rust-lang.org/std/num/struct.Wrapping.html) 类型实现了 包装算术操作。


### <a name="SingleOwnship"></a> 单一属主

在 Rust 里，可变值只能有一个所属变量。其他的变量可以借用，但一次只能有一个可变引用。

CPU 地址空间用好几个 PPU 寄存器映射。因此 CPU 维护了一个 PPU 的永久可变引用。但是顶层的 `Nes` 对象也拥有这个 PPU。

我通过 [Box](https://doc.rust-lang.org/std/boxed/struct.Box.html) 解决了这个问题。 使用 Box 给这个值赋固定的内存地址，然后在需要时用 unsafe 指针解引用。

``` rust
pub struct Nes {
    pub cpu: Box<C6502>,
    pub apu: Box<Apu>,
    pub ppu: Box<Ppu>,
}

pub struct CpuPpuInterconnect {
    ppu: *mut Ppu,
    cpu: *mut C6502,
}

impl AddressSpace for CpuPpuInterconnect {
    fn peek(&mut self, ptr:u16) -> u8 {
        let ppu:&mut Ppu = unsafe { &mut *self.ppu };
        // Games aren't supposed to read some of these, but
        // if they do, the "open bus" is whatever value was last written
        // to any PPU register.
        match map_ppu_port(ptr) {
            Some(PPUCTRL)   => ppu.open_bus,
            Some(PPUMASK)   => ppu.open_bus,
            Some(PPUSTATUS) => ppu.read_status(),
            Some(OAMADDR)   => ppu.open_bus,
            Some(OAMDATA)   => ppu.read_oam_data(),
            Some(PPUSCROLL) => ppu.open_bus,
            Some(PPUADDR)   => ppu.open_bus,
            Some(PPUDATA)   => ppu.read_data(),
            Some(OAMDMA)    => ppu.open_bus,
            port            => panic!("INVALID PPU PORT READ {:?} {:x}", port, ptr),
        }
    }
    fn poke(&mut self, ptr:u16, value:u8) {
        let ppu:&mut Ppu = unsafe { &mut *self.ppu };
        ppu.open_bus = value;
        match map_ppu_port(ptr) {
            Some(PPUCTRL)   => ppu.write_control(value),
            Some(PPUMASK)   => ppu.write_mask(value),
            Some(PPUSTATUS) => {},
            Some(OAMADDR)   => ppu.write_oam_address(value),
            Some(OAMDATA)   => ppu.write_oam_data(value),
            Some(PPUSCROLL) => ppu.write_scroll(value),
            Some(PPUADDR)   => ppu.write_address(value),
            Some(PPUDATA)   => ppu.write_data(value),
            Some(OAMDMA)    => {
                let cpu = unsafe { &mut *self.cpu };
                let ptr_base = (value as u16) << 8;
                for i in 0..=255 {
                    let addr = ptr_base + i;
                    let v = cpu.peek(addr);
                    ppu.oam[ppu.oam_ptr as usize] = v;
                    ppu.oam_ptr = ppu.oam_ptr.wrapping_add(1);
                }
            }
            port => panic!("INVALID PPU PORT WRITE {:?} {:x} {:x}", port, ptr, value),
        }
    }
}
```

使用 `unsave` 意味着我的模拟器不是线程安全的。如果 PPU 和 CPU 运行在不同的线程，它们会出现同时写或者一个读另一个在写的问题。

[互斥量（Mutex）](https://doc.rust-lang.org/beta/book/ch16-03-shared-state.html) 是一个解决方案。锁只会持有一小段时间，因此不应该造成很大的性能问题。


### <a name="Performance"></a> 性能

在之后的文章里，我计划训练一个 **强化学习（Reinforcement Learning, RL）** 的机器来玩 马里奥。更快的模拟器可以让我收集更多的样例数据，因此我花了几个小时确保我的模拟器在用于 RL 研究上和其他模拟器有的一比。

我的基准测试在 “无头” 模式运行了 10000 帧的 马里奥，没有视频和声音，然后输出一个截图。

在我开始优化之前，我的模拟器大概 350 FPS。我发现 RL 在不同的模拟器里有 200 ~ 450 FPS，因此我做了些小改动，最终达到了 430 FPS。

我找到了 3 个优化，每个都能提升 10% 的 FPS。

### <a name="Division"></a> 除法

编译器避免使用除法指令，因为太慢了。然而除以一个非常量基本没法优化。

代码

``` rust
impl Clocked for FrameCounter {
    fn clock(&mut self) {
        self.step += 1;
        let cap = if self.mode { 18641 } else { 14915 };
        self.step %= cap;
    }
}
```

会被编译成

``` 
add          $0x1, %eax         ; self.step += 1
cmpb         $0x0, 0x33(%rbx)   ; self.mode
mov          $0x3a43,%ecx       ; 14915
mov          $0x46d1,%edi       ; 18641
cmove        %ecx,%edi          ; let cap = if self.mode ...
xor          %edx,%edx
div          %di                ; self.step %= cap
```

因为 `FrameCounter` 每隔一个 CPU 周期记时一次，那么每个 NES 帧要执行大约 `14914` 次 `div` 指令，以 430 FPS 的速度的话每秒要执行 6.4M 次。

对于下面 2 个条件：

- 被除数永远不会减小
- 被除数永远不会增加到超过除数

上面的代码可以用一个条件减法替代：

``` rust
impl Clocked for FrameCounter {
    fn clock(&mut self) {
        self.step += 1;
        let cap = if self.mode { 18641 } else { 14915 };
        if self.step >= cap {
            self.step -= cap;
        }
    }
}
```

这个分支 15000 个时钟才会执行一次，因此瓶颈完全消失了，模拟器的整体处理提高了 10%。


### <a name="Iterators"></a> 迭代器

看看下面相同功能的 2 个实现：

``` rust
#![crate_type="lib"]
#![no_std]

#[no_mangle]
pub fn foo(xs: &[usize]) -> usize {
    let mut acc:usize = 0;
    for (x, idx) in xs.iter().zip(0..xs.len()) {
        acc = acc.wrapping_add(*x);
        acc = acc.wrapping_mul(idx);
    }
    return acc;
}

#[no_mangle]
pub fn bar(xs: &[usize]) -> usize {
    let mut acc:usize = 0;
    for idx in 0..xs.len() {
        let x = xs[idx];
        acc = acc.wrapping_add(x);
        acc = acc.wrapping_mul(idx);
    }
    return acc;
}
```

函数 `foo` 的源代码翻译是相当直接的：

```
0000000000000000 <foo>:
   0:   48 85 f6                test   rsi,rsi
   3:   74 33                   je     38 <foo+0x38>
   5:   48 8d 0c f5 00 00 00    lea    rcx,[rsi*8+0x0]
   c:   00
   d:   31 c0                   xor    eax,eax
   f:   31 d2                   xor    edx,edx
  11:   66 2e 0f 1f 84 00 00    nop    WORD PTR cs:[rax+rax*1+0x0]
  18:   00 00 00
  1b:   0f 1f 44 00 00          nop    DWORD PTR [rax+rax*1+0x0]
  20:   48 39 f2                cmp    rdx,rsi
  23:   73 12                   jae    37 <foo+0x37>
  25:   48 03 04 d7             add    rax,QWORD PTR [rdi+rdx*8]
  29:   48 0f af c2             imul   rax,rdx
  2d:   48 8d 52 01             lea    rdx,[rdx+0x1]
  31:   48 83 c1 f8             add    rcx,0xfffffffffffffff8
  35:   75 e9                   jne    20 <foo+0x20>
  37:   c3                      ret
  38:   31 c0                   xor    eax,eax
  3a:   c3                      ret
```

变量的对应关系如下：

- `rcx` 是 slice `xs` 的剩余字节数
- `rdx` 是变量 `idx`
- `rax` 是变量 `acc`
- `rdi` 指向 `xs` 里数据的开始位置

循环里面执行 `add` 和 `imul` 指令，直到 `rcx` 变成 0.


However, the function bar unrolls its loop 4 times:

```
0000000000000000 <bar>:
   0:   48 85 f6                test   rsi,rsi
   3:   74 1c                   je     21 <bar+0x21>
   5:   48 8d 46 ff             lea    rax,[rsi-0x1]
   9:   41 89 f0                mov    r8d,esi
   c:   41 83 e0 03             and    r8d,0x3
  10:   48 83 f8 03             cmp    rax,0x3
  14:   73 0e                   jae    24 <bar+0x24>
  16:   31 c0                   xor    eax,eax
  18:   31 d2                   xor    edx,edx
  1a:   4d 85 c0                test   r8,r8
  1d:   75 4e                   jne    6d <bar+0x6d>
  1f:   eb 60                   jmp    81 <bar+0x81>
  21:   31 c0                   xor    eax,eax
  23:   c3                      ret
  24:   4c 29 c6                sub    rsi,r8
  27:   31 c0                   xor    eax,eax
  29:   31 d2                   xor    edx,edx
  2b:   0f 1f 44 00 00          nop    DWORD PTR [rax+rax*1+0x0]
  30:   48 03 04 d7             add    rax,QWORD PTR [rdi+rdx*8]
  34:   48 0f af c2             imul   rax,rdx
  38:   48 03 44 d7 08          add    rax,QWORD PTR [rdi+rdx*8+0x8]
  3d:   48 8d 4a 01             lea    rcx,[rdx+0x1]
  41:   48 0f af c1             imul   rax,rcx
  45:   48 03 44 d7 10          add    rax,QWORD PTR [rdi+rdx*8+0x10]
  4a:   48 8d 4a 02             lea    rcx,[rdx+0x2]
  4e:   48 0f af c1             imul   rax,rcx
  52:   48 03 44 d7 18          add    rax,QWORD PTR [rdi+rdx*8+0x18]
  57:   48 8d 4a 03             lea    rcx,[rdx+0x3]
  5b:   48 8d 52 04             lea    rdx,[rdx+0x4]
  5f:   48 0f af c1             imul   rax,rcx
  63:   48 39 d6                cmp    rsi,rdx
  66:   75 c8                   jne    30 <bar+0x30>
  68:   4d 85 c0                test   r8,r8
  6b:   74 14                   je     81 <bar+0x81>
  6d:   49 f7 d8                neg    r8
  70:   48 03 04 d7             add    rax,QWORD PTR [rdi+rdx*8]
  74:   48 0f af c2             imul   rax,rdx
  78:   48 8d 52 01             lea    rdx,[rdx+0x1]
  7c:   49 ff c0                inc    r8
  7f:   75 ef                   jne    70 <bar+0x70>
  81:   c3                      ret
```

这里有 2 个循环：

- 一个在 `30:` 行，处理 `xs` 的 4 个元素
- 一个在 `70:` 行，处理 `xs` 的 1 个元素

变量的分配如下：

- `r8d` 包含在 `30:` 行循环结束后剩余的元素个数
- `rax` 是 `acc` 变量
- `rdi` 指向 `xs` 数据的开始
- `rdx` 是变量 `idx`，每次循环迭代更新一次
- `rcx` 也是变量 `idx`，但在 `30:` 行循环的展开里更新地更频繁
- `rsi` 指向 `30:` 行循环不能处理的第一个数据

主要区别在于 `foo` 记数字节，而 `bar` 记数元素。或许元组 `(x, idx)` 大小为 16 字节，这比像 `QWORD PTR [rdi+rdx*8+C]` 地址模式的最大规模 8 还要更大。`rustc` 可能在随后的等价优化之前选择它的循环策略，如果改用 u8s 而不是 usizes，`foo` 和 `bar` 就没有区别了。

不管怎样，把我的其中一个循环换成 `bar` 样式能提高模拟器 10% 的 FPS。


### <a name="SearchOrder"></a> 搜索顺序

CPU 的地址空间由很多组件组成，每一个都在特定的地址上坚听读和写。

**Mapper** 会拿到一个地址，然后在所有组件里做线性搜索来找到对应的组件。

在我第一次写代码时，我从头到尾地映射地址空间：

``` rust
fn map_nes_cpu(&mut self, joystick1: Box<AddressSpace>, joystick2: Box<AddressSpace>, cartridge: Box<AddressSpace>) {
    let mut mapper:Mapper = Mapper::new();
    let cpu_ram:Ram = Ram::new(0x800);
    let cpu_ppu:CpuPpuInterconnect = CpuPpuInterconnect::new(self.ppu.deref_mut(), self.cpu.deref_mut());
    let apu = self.apu.deref_mut() as *mut Apu;
    // https://wiki.nesdev.com/w/index.php/CPU_memory_map
    mapper.map_mirrored(0x0000, 0x07ff, 0x0000, 0x1fff, Box::new(cpu_ram), false);
    mapper.map_mirrored(0x2000, 0x2007, 0x2000, 0x3fff, Box::new(cpu_ppu), true);
    mapper.map_address_space(0x4000, 0x4013, Box::new(apu), true);;
    mapper.map_address_space(0x4014, 0x4014, Box::new(cpu_ppu), true);
    mapper.map_address_space(0x4015, 0x4015, Box::new(apu), true);
    mapper.map_address_space(0x4016, 0x4016, joystick1, false);
    mapper.map_address_space(0x4017, 0x4017, Box::new(apu), true); // TODO - 0x4017 is also mapped to joystick2
    mapper.map_address_space(0x4017, 0x4017, joystick2, false); // TODO - joystick2 isn't used, but this transfers ownership so it isn't deallocated(since it is updated through pointers)

    mapper.map_null(0x4018, 0x401F); // APU test mode
    mapper.map_address_space(0x4020, 0xFFFF, cartridge, true);

    self.cpu.mapper = Box::new(mapper);
    self.cpu.initialize();
}
```

然而，这就把 `卡带（cartridge）`放到了非常后面。卡带包含所有的游戏代码，因此，CPU 每次要获取一个新指令，都要做一次最差情况的线性搜索。

我实验了一下 LRU 缓存，但我发现最大的改进只需要简单地重新排列这些语句，让最频繁访问的组件放在前面。

这也提高了 10% 的 FPS。


## <a name="Conclusion"></a> 总结

这篇文章讨论了我使用 Rust 开发的 NES 模拟器。

如果你对学习 NES 开发感兴趣的话，我推荐 [Nesdev Wiki](https://wiki.nesdev.com/w/index.php/Nesdev_Wiki)，里面有制作模拟器或者游戏的详细技术资料。

这个主题的更多文章会包括：

- 训练机器玩马里奥
- 提高模拟器性能
- 为其他系统开发模拟器
- 把模拟器编译成可以运行在浏览器里的 Javascript
- 不常见游戏的兼容性问题
- 特性的 NES 游戏内部如何工作
- 把模拟器移植到 GPU 上[^note6]
- 使用 Rust 写一个 NES 游戏
- 为 `rustc` 或 LLVM 制作新的优化路径（optimization passes）
- 使用 JIT 编译器加速模拟器


[^note1]: 我的模拟器实际上使用了几个 [`Box`](https://doc.rust-lang.org/std/boxed/struct.Box.html) 对象。大多数情况下，这不是分配内存，而是为数据分配固定的内存位置，因此我可以安全地使用可变指针。我认为大多数的动态分配是可以移除的，除了但加载卡带时的 mapper 选择。因为每个游戏有不同的内部组件，动态分配在这里是有必要的。

[^note2]: 有从CPU的特殊照片创建的数字逻辑模拟器。这些并不比正确实现的周期精确仿真器更准确，但它们是有用的调试工具，用于确定正确的行为应该是什么。虽然有甚至不能解释 CPU 精确行为[几个案例](http://visual6502.org/wiki/index.php?title=6502_Opcode_8B_%28XAA,_ANE%29)，但没有发布过的 NES 游戏使用这个细节。

[^note3]: 参见这个 [反向仿真（Reverse Emulation）](https://www.youtube.com/watch?v=ar9WRwCiSr0) 的视频。可以在 NES 卡带里面放一个现代处理器来做一些巧妙的把戏。

[^note4]: 我尚未确认数字逻辑电路的 7 个时钟周期是否精确匹配我提到的 7 个操作。这是一个有根据的猜测，用于说明指令和时钟周期之间的差异。

[^note5]: 这个数字简化了，并且假设是 NTSC 视频标准。在有些地区卖的 NES 游戏机使用了 PAL 标准，可能生成视频的记时略有不同。偶数/奇数帧可能会消耗额外的一个时钟周期。有关详细的时间信息，请参阅 Nesdev Wiki。

[^note6]: 模拟器的界面部分只依赖 SDL 库，无头版本甚至不需要标准库。所以应该可以移植到[别的平台](https://www.michaelburge.us/2017/09/10/injecting-shellcode-to-speed-up-amazon-redshift.html)。

---

本文翻译自 [Michael Burge](https://www.michaelburge.us) 发表在他的博客上的文章 [Implementing a NES Emulator in Rust](https://www.michaelburge.us/2019/03/18/nes-design.html)