---
layout: post
title:  "PKI 蹲坑指南"
data: 2019-04-14
categories:
- Translate
tags:
- PKI
---

公钥基础设施是一类伞形术语，它包含了要使用证书和密钥管理的一切内容。

下面来快速浏览一下这个重要的东东。


## 公钥加密

公钥加密需要一对密钥：一个 *公钥* 和一个 *私钥* 。每一个公钥加密实例都有他们自己的公钥和私钥。公钥可以和别人分享，但私钥一定要保密。

他们可以用来做两件事情：

- 使用公钥 *加密*，使用私钥 *解密*。
- 使用私钥 *签名*，使用公钥 *验证*。

一些常用的算法有 [RSA](https://en.wikipedia.org/wiki/RSA_(cryptosystem))（用于二者）和 [ECDSA](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm)（只用于签名）。

实际上，公钥加密算法非常慢。这就是为何几乎所有的协议（如 [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security) 和 [SSH](https://en.wikipedia.org/wiki/Secure_Shell)）都只用它们做认证。而使用快了许多的对称加密算法（如 [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)）做加密。这个过程需要一个共享的密钥，这里通常会出现[迪菲-赫尔曼密钥交换](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange)的影子。


## 哈希计算

哈希算法是一类函数（如 [SHA](https://en.wikipedia.org/wiki/Secure_Hash_Algorithms)），它接收任意输入，并计算出一个唯一定长的输出。这个输出被称作一个哈希（有时也叫做 *摘要*）。


## 签名

签名可以认证消息。大概步骤如下：

- 给一个消息签名，要用这条消息和一个私钥算出一个代码（也就是签名）。
- 使用公钥和原始消息，任何人可以验证，这个签名是否的确是该消息使用此公钥对应的私钥计算出来的。

签名整个消息相当低效，所以只签名它的哈希。这就是为什么你经常看到签名算法描述成 “ECDSA with SHA-256” 这个样子。


## 证书

证书是通过签名把名字和公钥组成的捆绑。它可以验证公钥的拥有者。

签发者被称为证书颁发机构（CA）。CA 通常是像 GeoTrust 或 Let's Encrypt 的公司。但对于内部 PKI，任何被配置成信任的节点都可以是 CA。

一个 CA 的证书可以由其他 CA 来签发，以此类推。这个签发链最顶端的证书叫做 *根证书*。根证书被信任并存储在本地。他们通常附在浏览器和操作系统上。

### 格式

一般当人们说起证书，是他们指的是 [X.509](https://en.wikipedia.org/wiki/X.509)。这是一种灵活的表示证书格式。X.509 被 TLS 使用，而 TLS 被像 HTTPS 和 Kubernetes 等这些使用。

X509 使用 [ASN.1](https://en.wikipedia.org/wiki/Abstract_Syntax_Notation_One) 。而 ASN.1 通常序列化成 [DER](https://en.wikipedia.org/wiki/X.690#DER_encoding)。而由于二进制传输是一个痛点，DER 又被编码成 PEM。PEM 本质上是 [Base64](https://en.wikipedia.org/wiki/Base64) 编码的 DER。

### 验证

证书验证要确保证书链有效且指向受信任的根证书。

当然，这假设我们信任这些 CA，因为知道他们符合健全的安全实践，并只向经过验证的对象颁发证书。

### 打包

既然验证需要完整的证书链，那证书经常会被打包分发。以 TLS 为例，证书链会在[握手](https://tools.ietf.org/html/rfc8446#section-4.4.2)阶段被发送。

通常 PEM 文件会被串成一个。 

证书也可以使用 [PKCS#12](https://en.wikipedia.org/wiki/PKCS_12)（也叫 PFX） 或 [CMS](https://tools.ietf.org/html/rfc5652)（原来的 [PKCS #7](https://tools.ietf.org/html/rfc2315)） 打包。主要区别是 PKCS#12 可以存放私钥。

### 签发

在申请一个证书时：

- 客户发送一个[证书签发请求](https://en.wikipedia.org/wiki/Certificate_signing_request)（CSR）给 CA。它包含客户的公钥以及一系列[标识名字属性](https://tools.ietf.org/html/rfc3739#section-3.1.2)（如果国家和域名）。
- 如果一切OK ，CA 从 CSR 生成一个证书

最简单的例子中，CA 只进行**域名验证**（DV）。这通常很快并能自动化完成，如检查特定的DNS 记录等。

对于更全面的审查，还有**组织验证**（OV）和扩展验证（EV）。OV 包括 DV 并会验证合法对象的所有权。根据 [CA/Browser Forum guidelines](https://cabforum.org/extended-validation/)，EV 是所有里面最慢但最全面的。EV 证书通常被用做重要的展示（如在 Safiri 中 URL 会变成绿色）。

对于内部PKI，你想怎么做就怎么做。你可以手动把证书发给节点，或进行自动的客户端 CSR 以及 签发。

### 废除

基本上有两种方法：[证书废除列表（CRL）](https://en.wikipedia.org/wiki/Certificate_revocation_list) 和 [OCSP](https://en.wikipedia.org/wiki/Online_Certificate_Status_Protocol)。一个 CRL 就是某个 CA 公布的一大列其废除的证书。OCSP 是一种协议，可以查询某个证书是否被废除。

两种方法都有其缺陷。它们增加了开销，很多软件都不采用。使用短期证书并简化签发流程可能是更简单的做法。


## 总结

- 用某人的公钥，可以验证他们的签名，也可以给他们发送用该公钥加密的消息
- 用我们自己的私钥，可以给消息签名，也可以解密发给我们的消息
- 证书可以验证公钥的所有者
- 我们信任某个证书是因为我们信任签发该证书的 CA
- 我们信任某个 CA 是因为 Apple/Google/Microsoft/其他 在服务器或者浏览器等等中添加了该 CA 的证书并信任这些证书


---

本文翻译自 [Chris Rehn](https://rehn.me/) 发表于其博客的文章，原文地址在 [PKI for busy people](https://rehn.me/posts/pki-for-busy-people.html)。