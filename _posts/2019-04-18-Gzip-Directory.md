---
layout: post
title:  "在 Linux 中 gzip 一个文件夹"
data: 2019-04-18
categories:
- Howto
---

（注：针对 Beginner 的小文，老司机不用点进来了）你是否想过使用 gzip 压缩一个文件夹呢？如果你这样做，会看到一个大大的错误：

```
gzip: target is a directory -- ignored
```

这是因为 gzip 针对的是单个文件的压缩，无法用于文件夹。


## 借助 tar 命令

既然 gzip 不能用于文件夹，那该怎么办呢？方法是可以借助 tar 工具。tar 是一个打包工具，可以把文件或者文件夹打包成一个归档文件（但其并不压缩文件），再用 gzip 压缩这个归档文件不就可以啦！！

把它们组合起来就是，tar 负责打包，gzip 负责压缩。更棒的是，tar 的 `-z` 参数可以调用 gzip，所以这 2 步可以合并成一个命令：

``` bash
tar -zcvf output_file_name directory_to_compress
```

这里的 `-zcvf` 实际上是 -z -c -v -f，tar 允许它们写在一起，但 f 必须写在最后（跟输出文件挨着），其中：

- z 是指使用 gzip 对归档文件进行压缩
- c 是告诉 tar 要压缩这个归档
- v 则会输出归档压缩的文件
- f 指明归档压缩后的文件名


## 示例

假如文件夹中有好些个文件，用 du 命令查看这些文件的总大小是 204 KB。

```
$ du -sh sample_text_files
204K    sample_text_files
```

现在进程压缩，过程输出如下：

```
tar -cvzf sample_text_archive  sample_text_files
sample_text_files/
sample_text_files/sample_rar.rar
sample_text_files/test/
sample_text_files/dir2/
sample_text_files/dir2/services
sample_text_files/dir2/agatha.txt
sample_text_files/abhi-3.txt
```

完成后用 ls 命令查看归档文件的大小，发现只有 10 KB（注：gzip 对文本压缩得非常好，但对于二进制文件就很难有这种效果了）：

```
ls -lh sample_text_archive 
-rw-r--r-- 1 abhishek abhishek 9.6K Apr 11 11:41 sample_text_archive
```

## 一些关键点

在命令中要给出文件名，否则你会看到大大的错误：

```
tar: Cowardly refusing to create an empty archive
Try 'tar --help' or 'tar --usage' for more information.
```

如果你没有使用 `-f` 选项，也会报错：

```
tar: Refusing to write archive contents to terminal (missing -f option?)
tar: Error is not recoverable: exiting now
```


## 写在最后

这篇小文的原内容主要来自 [How to gzip a Directory in Linux](https://linuxhandbook.com/gzip-directory)。
