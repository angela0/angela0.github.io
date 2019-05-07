---
layout: post
title:  "程序日志最佳实践"
data: 2019-05-04
categories:
- Translate
tag:
- Log
---

应用程序级别的日志是你的程序向你反馈的唯一方式。拥有值得称道的搜索功能的适当日志就像在黑暗的房间里有一把火炬。

日志的利用价值被完全低估了。作为软件工程师，我们可以利用程序中的日志来解决问题，并了解应用程序的健康状况。

> 日志也有助于分析应用程序性能。

几年前我曾写过[关于日志的文章](https://geshan.com.np/blog/2015/08/importance-of-logging-in-your-applications/)。本文重点介绍从应用程序级别进行日志记录时可以遵循的最佳实践，以及它如何帮助软件工程师。


## 最佳实践

### 优化记录的信息

信息太多就略显聒噪，太少不能说明问题。在日志量上取得平衡很难，但这是一个挑战。在微服务中，还要考虑服务之间的可跟踪性，例如要使用唯一的请求标识符。需要记住的是日志是暂时的，而不是永久的。由于它们没有存储在数据库中，所以通常具有从几天或几周的生命周期。

### 始终遵循严重性级别

`emergency` 日志意味着你的待命电话可能在凌晨 2 点响起，但 `info` 日志不会打扰任何人。团队必须有一些像 [syslog](https://tools.ietf.org/html/rfc5424) 这样的标准。

### 结构化你的日志

在日志行中包含一个结构，比如有一条消息和一个上下文数组来添加更多信息。遵循商定的 JSON 标准进行日志记录，可以让解析和搜索都容易多了。你甚至可以设置一些规则，例如日期必需有，描述不能超过 255 个字符，额外信息放在上下文中。有了这些简单的规则可以在需要时更轻松地找到日志。强烈建议提供带有日志行的上下文，例如在记录订单无法发送时添加订单的详细信息（当然只包含不敏感的信息）。

### 小心写日志（不能妨碍性能）

确保添加日志不会影响响应时间。尽可能以异步方式写入日志，甚至可以写入本地的日志文件中，再用日志转发器发送到日志服务器。你还可以根据使用的语言/框架使用久经​​考验的日志库。队列也是一个选择，但要知道查看日志可能存在的延迟。

### 使用合适的工具完成工作

选择传输，查看，搜索以及排序日志的工具和服务关乎整个团队。根据预算和使用外部服务的意愿，团队可以使用像 [ELK](https://www.elastic.co/elk-stack)/[Graylog](https://www.graylog.org/) 这样完全自我管理的技术栈，或者使用 [Logentries](https://logentries.com/)/[Sematext Logsense](https://sematext.com/logsene/) 这样完整的 SAAS 服务。主要是得有效地满足你的需求。例如，如果你对实时有需求，队列就不是最佳的选择。因此，要设计适合你需求的日志记录基础架构。


## 幻灯片

我曾经做过一个关于“日志最佳实践”的演讲，下面是演讲用的幻灯片。

<script async class="speakerdeck-embed" data-id="4f33e89002cc4a29926808ef42457fc2" data-ratio="1.77777777777778" src="//speakerdeck.com/assets/embed.js"></script>

你可以在 [slideshare](https://www.slideshare.net/geshan/logging-best-practices) 或者 [speaker deck](https://speakerdeck.com/geshan/logging-best-practices) 上观看这个幻灯片。


## 总结

> 如果狗是人类最好的朋友，那么日志就是软件工程师最好的朋友。
 
充分利用日志以充分利用日志，并牢记有关日志记录的最佳实践。


---

本文翻译自 [geshan](https://geshan.com.np) 发表于其博客的文章，原文地址在 [Logging best practices to get the most out of application level logging](https://geshan.com.np/blog/2019/03/follow-these-logging-best-practices-to-get-the-most-out-of-application-level-logging-slides/)。
