---
layout: post
title: "修复ubuntu14.04中的更新错误"
data: 2014-09-17
categories:
- Translate
tags:
- ubuntu
- update-error

---

>> 本文章翻译自 [It's F.O.S.S.](http://itsfoss.com/fix-update-errors-ubuntu-1404/)，可以自由转载，但需标明原文出处以及译文出处。

![](/assets/img/2014-09-17-Fix-Various-Update-Errors-In-Ubuntu-14.04/1.jpeg)

谁没有在升级Ubuntu的时候遇到个错误呢？Update 错误在Ubuntu或者其他基于Ubuntu的发行版本中随处可见。虽然产生这些错误的原因众多，但解决方法很简单。在这篇文章中，我们将会看到经常遇到的各种类型的update错误和怎么修复它们。


### Problem With MergeList

当你在终端运行升级的时候，你可能会遇到一个 `problem with MergeList` 像下面这样的提示：
```
E:Encountered a section with no Package: header,
E:Problem with MergeList /var/lib/apt/lists/archive.ubuntu.com_ubuntu_dists_precise_universe_binary-i386_Packages,
E:The package lists or status file could not be parsed or opened.'
```

修复这个错误只需要运行下面两个命令：

```
sudo rm -r /var/lib/apt/lists/*
sudo apt-get clean && sudo apt-get update
```


### Failed to download repository information -1

实际上有两种 *Failed to download repository information errors* 错误，如果你遇到下面这一种：

```
W:Failed to fetch bzip2:/var/lib/apt/lists/partial/in.archive.ubuntu.com_ubuntu_dists_oneiric_restricted_binary-i386_Packages Hash Sum mismatch,
W:Failed to fetch bzip2:/var/lib/apt/lists/partial/in.archive.ubuntu.com_ubuntu_dists_oneiric_multiverse_binary-i386_Packages Hash Sum mismatch,
E:Some index files failed to download. They have been ignored, or old ones used instead
```

你可以用下面的命令修复它：

```
sudo rm -rf /var/lib/apt/lists/*
sudo apt-get update
```


### Failed to download repository information -2

另一种 *failed to download repository information errors* 是由于过期的 PPA，通常当你运行Update Manager的时候会出现如下图的错误：

![](/assets/img/2014-09-17-Fix-Various-Update-Errors-In-Ubuntu-14.04/2.png)

你可以运行 `sudo apt-get update` 看看是哪个PPA造成的，然后将它从源列表里面删除了就好了。你可以参照 [failed to download repository information error](http://itsfoss.com/failed-to-download-repository-information-ubuntu-13-04/)这篇图示博文。


### Failed to download package files error

一个常见的错误是 *failed to download package files error *，如下图：

![](/assets/img/2014-09-17-Fix-Various-Update-Errors-In-Ubuntu-14.04/3.jpeg)

这个很容易通过将源改为Main server解决。到 Software & Updates 里面将下载服务器改为 Main server。

![](/assets/img/2014-09-17-Fix-Various-Update-Errors-In-Ubuntu-14.04/4.jpeg)


### Partial upgrade error

在终端进行升级的时候可能会抛出 *partial upgrade error* 这样一个错误：
```
Not all updates can be installed
Run a partial upgrade, to install as many updates as possible
```

运行下面这个命令即可修复：
```
sudo apt-get install -f
```


### error while loading shared libraries

这其实是一个安装错误，如果你通过编译源代码的方式安装软件的话可能会看到这个错误：
```
error while loading shared libraries:
cannot open shared object file: No such file or directory
```

运行下面的命令即可解决：
```
sudo /sbin/ldconfig -v
```

关于它的详细信息，可以参考[error while loading shared libraries](http://itsfoss.com/solve-open-shared-object-file-quick-tip/)


### Could not get lock /var/cache/apt/archives/lock

这个错误发生主要是因为其他程序正在使用apt。假如你正在使用 Ubuntu Software Center 安装软件，此时在终端运行apt就会出现这种错误：
```
E: Could not get lock /var/cache/apt/archives/lock – open (11: Resource temporarily unavailable)
E: Unable to lock directory /var/cache/apt/archives/
```

一般情况下，只要把其他使用apt的进程全部关掉就好了，如果还不行的话，使用下面这个命令：
```
sudo rm /var/lib/apt/lists/lock
```

还不能工作？那就是一下这个：
```
sudo killall apt-get
```

关于这个错误的更多详细信息看[这里](http://itsfoss.com/fix-ubuntu-install-error/)


### GPG error: The following signatures couldn’t be verified

当你添加一个PPA源并在终端运行更新的时候，可能会遇到像下面的[ GPG error: The following signatures couldn’t be verified](http://itsfoss.com/solve-gpg-error-signatures-verified-ubuntu/)
错误：
```
W: GPG error: http://repo.mate-desktop.org saucy InRelease: The following signatures couldn’t be verified because the public key is not available: NO_PUBKEY 68980A0EA10B4DE8
```

我们只需要做的是在系统中添加这个公钥。可以从上面的提示信息中获取，上面的这个公钥就是 *68980A0EA10B4DE8*。可以这样添加：
```
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 68980A0EA10B4DE8
```

添加过后，一切就会okay吧。


### BADSIG error

其他与签名相关的Ubuntu更新错误是[BADSIG error](http://itsfoss.com/solve-badsig-error-quick-tip/)，它看起来是这样的：
```
W: A error occurred during the signature verification. The repository is not updated and the previous index files will be used. GPG error: http://extras.ubuntu.com precise Release: The following signatures were invalid: BADSIG 16126D3A3E5C1192 Ubuntu Extras Archive Automatic Signing Key
W: GPG error: http://ppa.launchpad.net precise Release:
```

The following signatures were invalid: BADSIG 4C1CBC1B69B0E2F4 Launchpad PPA for Jonathan French W: Failed to fetch http://extras.ubuntu.com/ubuntu/dists/precise/Release

修复这个错误，要运行下面几条命令：
```
sudo apt-get clean
cd /var/lib/apt
sudo mv lists oldlist
sudo mkdir -p lists/partial
sudo apt-get clean
sudo apt-get update
```

这里列举了一些你可能经常遇到的Ubuntu更新错误，我希望可以帮你摆脱这些错误的困扰。如果你还遇到了其他更新错误，在评论里面提一下，我将尽量做一个关于它的快速教程。
