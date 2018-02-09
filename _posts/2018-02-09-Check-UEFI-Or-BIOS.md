---
layout: post
title:  "如何检测你的计算机用的是 UEFI 还是 BIOS"
data: 2018-02-09
categories:
- Translate
tags:
- UEFI
- BIOS
---

***摘要：这个简要教程告诉你你的计算机使用的是现代 UEFI 还是传统的 BIOS。Windows 和 Linux 都有说明。***

你在试图 [Linux 和 Windows 双启动](https://itsfoss.com/guide-install-linux-mint-16-dual-boot-windows/) 的时候，可能会想看看你的计算机使用的是 UEFI 还是 BIOS。它可以帮助你判断在装 Linux 的时候如何分区。

这里不再讨论 [什么是 BIOS](https://www.lifewire.com/bios-basic-input-output-system-2625820)，而是要告诉你一些 UEFI 相较 BIOS 的优点。

UEFI 或者叫 统一固件可扩展接口 的诞生是为了克服 BIOS 的一些不足。它可以使用超过 2T 的硬盘，并且和 CPU 架构以及驱动无关。使用现代设计，它支持无操作系统的远程诊断和修复，以及灵活的具有网络功能的无操作系统环境。


### UEFI 相较 BIOS 的优点

- UEFI 初始化硬件更快
- 支持安全启动，这意味着在加载操作系统之前加载的任何东西必须被标记。这为您的系统提供了防范运行恶意软件的附加层。
- BIOS 不支持 2T 以上的硬盘分区
- 最重要的是，如果你要双启动，2 个操作系统总是可以使用同一种启动模式安装

你要看你的系统使用的是 UEFI 还是 BIOS，这并不难。让我们先从 Windows 开始，然后再看看如何在 Linux 上检测。


### 在 Windows 上检测用的是 UEFI 还是 BIOS

在Windows上，你可以从 开始 菜单的 “系统信息” 里面的 `BIOS 模式`[[1]](#note1)找到启动模式。如果后面的值是 Legacy，那你用的就是 BIOS。如果是 UEFI，那就是 UEFI。

![](https://itsfoss.com/wp-content/uploads/2018/01/BIOS.png)

**还有一个方法**：如果你使用的是 Windows10，你可以打开文件浏览器并进入 `C:\Windows\Panther` 文件夹。打开 setupact.log 文件[[2]](#note2)并找到 `Detected boot environment` 这个字串。

我建议你使用 Notepad++ 来打开，因为这个文件太大了，notepad 可能会卡住。（至少在我 6G 内存的系统上就这样）

你应该能看到下面这样的信息：

```
2017-11-27 09:11:31, Info IBS Callback_BootEnvironmentDetect:FirmwareType 1.
2017-11-27 09:11:31, Info IBS Callback_BootEnvironmentDetect: Detected boot environment: BIOS
```

### 在 Linux 上检测用的是 UEFI 还是 BIOS

最简单的方法就是看看有没有 `/sys/firmware/efi` 这个文件夹。如果你用的 BIOS 就没有这个文件夹。

![/sys/firmware/efi 存在说明使用的是 UEFI](https://itsfoss.com/wp-content/uploads/2018/02/uefi-bios.png)

**另一种方法**：安装 efibootmgr 包。

在基于 Debian 和 Ubuntu 的发行版上，使用下面的命令安装：

```
sudo apt install efibootmgr
```

完成后输入下面的命令：

```
sudo efibootmgr
```

如果系统支持 UEFI，它会打印各种 EFI 变量。如果不支持就会看见如下所示信息。

![](https://itsfoss.com/wp-content/uploads/2018/01/bootmanager.jpg)


### 结束语

检测你的计算机使用的是 BIOS 还是 UEFI 很简单。尽管像快速启动和安全启动是 UEFI 的优势，但如果你还在使用 BIOS 的话，也不用在意这个，除非你想要使用超过 2T 的硬盘。

---

英文原文链接：itsfoss.com/check-uefi-or-bios/

<p id="note1"> [1]: 如果使用 Win10，可以打开开始菜单后搜索 system 或者 系统 关键字，然后点击 “系统信息”打开；如果实在找不到，就按 Win+r 组合键打开 运行窗口，输入 `msinfo32` 回车直接就打开了 “系统信息” </p>

<p id="note2"> [2]: 你如果直接打开要用管理员权限，可以先复制到桌面再打开</p>
