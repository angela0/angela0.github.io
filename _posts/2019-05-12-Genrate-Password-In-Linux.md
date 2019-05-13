---
layout: post
title:  "在 Linux 中生成高强度密码"
data: 2019-05-12
categories:
- Howto
tag:
- Linux
---

我们经常需要生成随机密码，在 Linux 总有许多方法来实现。

<!-- more -->

## pwgen

我最喜欢的就是 `pwgen` 了。但遗憾的是，它并不是核心组件；幸运的是，你可以从大部分的发行版仓库中直接安装。

`pwgen` 有一些调整密码的选项，但默认用法很简单 `pwgen [pw_length] [num_pw]`。

`pw_length` 就是要生成密码的长度；`num_pw ` 就是要生成多少个密码。缺省情况下，生成 160 个 8 位密码。所以现在我们生成一个 16 位的密码只需要：

```
pwgen 16 1
```

关于 `pwgen` 的具体用法，我们在 [用 pwgen 生成你的随机密码](/posts/Pwgen-In-Linux/) 一文中详细介绍。


## 使用 urandom

urandom 是 Linux 中获取随机数的设备，使用它配合其它工具，你能创造无限的可能（这就是 Linux/Unix 的魅力）。

下面是 3 种示例：

```
# 这里使用 tr 只保留了字母和数字；最后的 echo 为了换行
tr -cd '[:alnum:]' < /dev/urandom | head -c 16; echo
```

```
tr -cd '[:alnum:]' < /dev/urandom | fold -w16 | head -n1
```

```
cat /dev/urandom | base64 | head -c 16
```

这几个命令相对使用 `pwgen` 就麻烦多了，不过你可以加入 alias 或者写一个 shell 函数。它们最大的好处是你不用额外安装任何软件。


## 使用 openssl

这个实际上也是要用 random/urandom 设备的，不过 `openssl` 帮我们做了，用起来显得简单了。

```
openssl rand -base64 100 | head -c 16; echo
```

当然，你也可以不使用 `openssl` 的 `-base64` 参数，而用 `tr` 命令来选择想要的字符。

另外，`gpg` 也可以实现类似的功能：

```
gpg --gen-random 1 100 | base64 | head -c 16
```


## 一个包装函数

这里用上面的命令实现一个类似 `pwgen` 的命令：

```
genpw() {
    chars='[:alnum:]'
    length=16
    nums=1
    usecap=1
    usenum=1
    usesymbol=0
    useabm=1
    POSITIONAL=()
    while [[ $# -gt 0 ]]
    do
    key="$1"

    case $key in
        -A)
        usecap=0
        shift
        ;;
        -0)
        usenum=0
        shift
        ;;
        -y)
        usesymbol=1
        shift
        ;;
        -h)
        echo "genpw [opts] len num"
        echo "-A    not use capital letter"
        echo "-0    not use number"
        echo "-y    use special symbol"
        return
        ;;
        *)
        POSITIONAL+=("$1")
        shift
        ;;
    esac
    done
    set -- "${POSITIONAL[@]}" # restore positional parameters

    if [ ${usecap} == "0" ]; then chars="[:lower:]"; fi
    if [ ${usenum} == "1" ]; then chars+="[:digit:]"; fi
    if [ ${usesymbol} == "1" ]; then chars+="[:punct:]"; fi

    if [ "0$1" != "0" ]; then length=$1; fi
    if [ "0$2" != "0" ]; then nums=$2; fi

    for ((j = 0; j < ${nums}; j++)); do
        tr -cd ${chars} < /dev/urandom | head -c ${length}; echo
    done
}
```

如果使用 `getopts` 会更短，就交给你来实现吧！