---
layout: post
title:  "我需要内核源码"
data: 2019-04-02
categories:
- Translate
tags:
- Linux
- Kernel Source
---

我们可能经常会用到 Linux 内核源码，因此 CentOS 在仓库里提供了内核源码的支持。本文是 CentOS 官网的 HowTos，介绍了如何在 CentOS 里方便地下载内核源码。最初由 [JohnnyHughes](https://wiki.centos.org/JohnnyHughes) 创建了该 HowTos，现在由 [AlanBartlett](https://wiki.centos.org/AlanBartlett) and [AkemiYagi](https://wiki.centos.org/AkemiYagi) 维护。

## 1. 可能你并不需要完整的内核源码

如果你需要编译内核驱动（模块），那你真的并不需要完整的内核源码树。只需要安装 `kernel-devel` 包就可以了（当然，如果你确定需要完整的内核源码树，请参考第二章节）。

- 在 CentOS 7 中，只有一个 `kernel-devel` 包：

    kernel-devel (64-bit architecture)
    
    （注：要使用 32 位版本，要使用 [AltArch i386](https://wiki.centos.org/SpecialInterestGroup/AltArch/i386)）
- 在 CentOS 6 中，也只有一个 `kernel-devel` 包：

    kernel-devel (32- & 64-bit architectures)

通过下面的命令安装 `kernel-devel`:

``` bash
[root@host]# yum install kernel-devel
```

如果 yum 里没有你要的内核版本，那可能是你的内核比较老了，你可以自己从 [CentOS Vault 站点](http://vault.centos.org/) 下载。

对于 CentOS 7：查看 `7.N.YYMM/os/x86_64/Packages/` 或者 `7.N.YYMM/updates/x86_64/Packages/` 文件夹，里面有 `kernel-devel-version.x86_64.rpm` 这样的包。

对于 CentOS 6：查看 `6.N/os/arch/Packages/` 或者 `6.N/updates/arch/Packages/` 文件夹，里面有 `kernel-devel-version.arch.rpm` 这样的包。

在你安装了正确的 `kernel[-type]-devel-version.arch.rpm` 这样式的包之后，就可以编译你的模块了。这就应该可以正常工作了。如果没有，请反馈给模块开发者，因为所有新的内核模块的都应该这样设计。


## 2. 如果你真的需要完整的内核源码

不管什么吧，如果你真的需要，你也是可以获取到的。

如果是 **非 root 用户**，在 `~/rpmbuild/` 目录里创建一个构建树：

``` bash
[user@host]$ mkdir -p ~/rpmbuild/{BUILD,BUILDROOT,RPMS,SOURCES,SPECS,SRPMS}
[user@host]$ echo '%_topdir %(echo $HOME)/rpmbuild' > ~/.rpmmacros
```

强烈建议 **不要** 使用 root 用户来构建。（原因参见：[Building Source RPM as non-root under CentOS](http://www.owlriver.com/tips/non-root/)）

### 在 CentOS 7 上安装源码包及工具

root 用户的话，安装 asciidoc, audit-libs-devel, bash, bc, binutils, binutils-devel, bison, diffutils, elfutils, elfutils-devel, elfutils-libelf-devel, findutils, flex, gawk, gcc, gettext, gzip, hmaccalc, hostname, java-devel, m4, make, module-init-tools, ncurses-devel, net-tools, newt-devel, numactl-devel, openssl, patch, pciutils-devel, perl, perl-ExtUtils-Embed, pesign, python-devel, python-docutils, redhat-rpm-config, rpm-build, sh-utils, tar, xmlto, xz and zlib-devel 这些包：

``` bash
[root@host]# yum install asciidoc audit-libs-devel bash bc binutils binutils-devel bison diffutils elfutils
[root@host]# yum install elfutils-devel elfutils-libelf-devel findutils flex gawk gcc gettext gzip hmaccalc hostname java-devel
[root@host]# yum install m4 make module-init-tools ncurses-devel net-tools newt-devel numactl-devel openssl
[root@host]# yum install patch pciutils-devel perl perl-ExtUtils-Embed pesign python-devel python-docutils redhat-rpm-config
[root@host]# yum install rpm-build sh-utils tar xmlto xz zlib-devel
```
可以在下面 2 个地址里找到源码的 rpm 包：

- [http://vault.centos.org/7.N.YYMM/os/Source/SPackages/](http://vault.centos.org/7.N.YYMM/os/Source/SPackages/)
- [http://vault.centos.org/7.N.YYMM/updates/Source/SPackages/](http://vault.centos.org/7.N.YYMM/updates/Source/SPackages/)

（注：用你对应的 子版本号，年，月号 来替换 `N.YYMM`）

如果是 **非root** 用户，需要这样安装：

``` bash
[user@host]$ rpm -i http://vault.centos.org/7.6.1810/updates/Source/SPackages/kernel-3.10.0-957.10.1.el7.src.rpm 2>&1 | grep -v exist
```
（**译注：注意把版本换成自己需要的**）

### 在 CentOS 6 上安装源码包及工具

root 用户要安装 the asciidoc, audit-libs-devel, bash, binutils, binutils-devel, bison, bzip2, diffutils, elfutils-devel, elfutils-libelf-devel, findutils, flex, gawk, gcc, gnupg, gzip, hmaccalc, m4, make, module-init-tools, net-tools, newt-devel, patch, patchutils, perl, perl-ExtUtils-Embed, python, python-devel, redhat-rpm-config, rpm-build, sh-utils, tar, xmlto and zlib-devel 这些包：

``` bash
[root@host]# yum install asciidoc audit-libs-devel bash binutils binutils-devel bison bzip2 diffutils elfutils-devel
[root@host]# yum install elfutils-libelf-devel findutils flex gawk gcc gnupg gzip hmaccalc m4 make module-init-tools
[root@host]# yum install net-tools newt-devel patch patchutils perl perl-ExtUtils-Embed python python-devel
[root@host]# yum install redhat-rpm-config rpm-build sh-utils tar xmlto zlib-devel
```

可以在下面 2 个地址里找到源码的 rpm 包：

- [http://vault.centos.org/6.N/os/Source/SPackages/](http://vault.centos.org/6.N/os/Source/SPackages/)
- [http://vault.centos.org/6.N/updates/Source/SPackages/](http://vault.centos.org/6.N/updates/Source/SPackages/)

（注：用你对应的 子版本号 来替换 `N`）

如果是 **非root** 用户，需要这样安装：

``` bash
[user@host]$ rpm -i http://vault.centos.org/6.10/updates/Source/SPackages/kernel-2.6.32-754.11.1.el6.src.rpm 2>&1 | grep -v exist
```

### 源码包和工具都安装好后，就解压源代码吧：

``` bash
[user@host]$ cd ~/rpmbuild/SPECS
[user@host SPECS]$ rpmbuild -bp --target=$(uname -m) kernel.spec
```

`$(uname -m)` 会设置成你当前内核的架构。这通常都是 ok，因为现在基本上要么是 i686 要么是 x86_64 架构。

完事之后，源代码就静静地躺在 `~/rpmbuild/BUILD/kernel*/linux*/` 文件夹里。

---

本文翻译自 CentOS 官网的 HowTos，原文地址在 [这里](https://wiki.centos.org/HowTos/I_need_the_Kernel_Source)。