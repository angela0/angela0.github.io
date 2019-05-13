---
layout: post
title:  "KVM 使用物理硬盘"
data: 2019-05-11
categories:
- Howto
tag:
- KVM
- Linux
---

突发奇想 KVM 能不能使用物理硬盘，就尝试了一下。

<!-- more -->

提前说明：我使用 libvirt 管理 KVM 虚拟机，这里的方法也是通过 libvirt 的实现的，以后再看看从命令行启动能不能实现。

实际上 libvirt 的 virt-manager 里，并不能直接使用物理硬盘。但我们可以手动修改虚拟机配置文件。

在你添加虚拟机之后，会在 `/etc/libvirt/qemu/` 里面生成一个 `<vm_name>.xml` 的配置文件。打开之后在 `<devices>` 小节里加一个 `<disk>` 小节，内容如下：

```
<disk type='block' device='disk'>
  <driver name='qemu' type='raw'/>
  <source dev='/dev/sdx'/>
  <target dev='vda' bus='virtio'/>
</disk>
```

其中 `/dev/sdx` 是你要使用的物理硬盘，这个你需要小心谨慎，不要弄错了。而 `vda` 在是虚拟机里面的设备了，比如这个配置会在生成一个 `/dev/vda` 设备。

但这还没完。你需要使用 `virsh` 命令来更新一下配置：

```
virsh define /etc/libvirt/qemu/<vm_name>.xml
```

然后在虚拟机的配置里就能看到新加的硬盘了。
