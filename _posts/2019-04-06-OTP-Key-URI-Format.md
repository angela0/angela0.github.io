---
layout: post
title:  "OPT 密钥的 URI 格式"
data: 2019-04-06
categories:
- Notes
tags:
- OPT
---

OPT（一次密码） 是现在比较常用的一种两步验证方式。通常在使用的时候，用户使用 OTP 应用扫描网站给的二维码，就可以生成一组包括用户名、发行者以及一个动态改变的密码的信息。而如果用户无法扫描，只能手动填写的话，则需要填写的有一个密钥以及用户名等信息。这是因为二维码里的信息实际上是一个 URI，包含了上面需要的选项。

## 格式

该 URI 具有以下格式：

```
otpauth://TYPE/LABEL?PARAMETERS
```

### 举例

用户 `alice@google.com` 要使用 Example 公司提供的服务，Example 给他了一个 TOTP 密钥：

```
otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example
```

其中的 `JBSWY3DPEHPK3PXP` 是 base32 编码：

```
byte[] key = { 'H', 'e', 'l', 'l', 'o', '!', (byte) 0xDE, (byte) 0xAD, (byte) 0xBE, (byte) 0xEF };
```

这里还有一个带有所有参数的例子：

```
otpauth://totp/ACME%20Co:john.doe@email.com?secret=HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ&issuer=ACME%20Co&algorithm=SHA1&digits=6&period=30
```

## 类型 TYPE

可用的类型有 `hotp` 和 `totp` 2 种，区分密钥是 HOTP 的还是 TOTP 的。

## 标签 LABEL

标签是用来验证密钥是和哪个账户关联的。它包含一个账户名，这是一个 URL 编码的字符串；前面有一个可选的发行者字符串前缀，用来验证管理该账户的提供者或服务。这个前缀可以避免账户名重复。

这个前缀应该和账户名用 分号（可以是 URL 编码的分号 `%3A`）分隔，账户名前面可以用空格。前缀和账户名都不应该包含分号。根据 [RFC 5234](http://tools.ietf.org/html/rfc5234) ABNF 表示法如下：

```
label = accountname / issuer (“:” / “%3A”) *”%20” accountname
```

正确的样例如：`Example:alice@gmail.com`， `Provider1:Alice%20Smith`， `Big%20Corporation%3A%20alice%40bigco.com`

推荐前缀和下面要说到的发行者参数 **都使用**。


## 参数 Parameters

### 密钥 Secret

**必要**：根据 [RFC 3548](http://tools.ietf.org/html/rfc3548) `secret` 参数是一个 base32 编码的任意密钥。[RFC 3548 的第 2.2 节](https://tools.ietf.org/html/rfc3548#section-2.2) 指出不需要填充，应该忽略掉。

### 发行者 Issuer

**强烈推荐**：`issuer` 可以验证提供者，根据 [RFC 3986](http://tools.ietf.org/html/rfc3986) 需要 URL 编码。如果没有 `issuer` 参数，还可以写在 label 的前缀。但如果 2 个地方都有，那必须一样。

正确的样例如：`issuer=Example`，`issuer=Provider1` 和 `issuer=Big%20Corporation`。

### 算法 Algorithm

**可选**：`algorithm` 参数可以用以下几种：

- SHA1（默认）
- SHA256
- SHA512

### 位数 Digits

**可选**：`digits` 可以是 6 或者 8，它决定了一次密码的位数。默认是 6。


### 记数器 Counter

**必要**：如果 `type` 是 `hotp`，则 `counter` 参数是必须的。它用来设置初始的记数器值。

### 周期 Period

**可选**：只有 `type` 是 `totp` 时可以需要这个参数：`period` 参数定义了 TOTP 代码的可用时间，单位是秒。默认是 30 秒。


---

本文的大部分内容（包括主体格式）来自于 [google-authenticator 的 wiki](https://github.com/google/google-authenticator/wiki/Key-Uri-Format)，忽略了一些说明 google-authenticator 的实现说明。