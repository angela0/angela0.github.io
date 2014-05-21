---
layout: post
title:  "怎样在github上建立博客(细节问题)"
data: 2014-05-17 
categories:
- Notes
tags:
- github
- blog

---

###怎么建一个博客在github上?
最开始接触网络的时候是在qq空间里面发表日志和说说,不过觉得qq空间的功能太弱智,虽然它有html(同样弱智)和代码高亮功能.

后来自己找免费的空间使用wordpress搭建博客(学生党嘛，没钱),由于本人比较懒,呃啊,不想管理服务器,虽然是虚拟空间,那也是费劲的啊(呃，不是一般的懒啊,--）.

所以就找到了github,对,就是这个功能很强大的代码托管平台.

具体过程不再唠叨,网上大把大把的,可以baidu/google,官方给出的详细步骤在这里 [pages.github.com](http://pages.github.com)
我觉得这个教程就可以让大部分人搭起自己的博客.

下面说一下在搭建的过程中会遇到的几个问题：
<hr/>
* 如果你按照官方的详细步骤做完最后一步之后，发现打开username.github.com（username是你的github用户名，下同），只有一个hello world，如果你不懂点html的东西的话，你可能到这里就没了辙，不过没有关系，你可以到别人的github上面fork一下别人的blog，比如[github.com/jekyll/jekyll/wiki/sites](https://github.com/jekyll/jekyll/wiki/sites),里面给出了一些别人博客地址，还有博客托管的github地址,你可以直接去下载下来，根据自己的喜好，添加或者删除一些东西，可以自己用了。说到这里，要提醒的是，如果你不喜欢折腾，那还是老老实实找个新浪博客/博客园之类的用吧，其实他们做的也都挺不错的。
* git 的使用问题，如果你用windows下的git工具的话，可能不会有什么大的问题，照着教程一步一步做下去就okay。另外当你遇到不能上传的情况时，先把远程仓库pull下来再push。
* 第一次将本地的文件push到github上面,可能会出现这种问题:

      git push
      No refs in common and none specified; doing nothing.
	  Perhaps you should specify a branch such as 'master'.
	  fatal: The remote end hung up unexpectedly
	  error: failed to push some refs to 'file:///xxxxxxx.git'
	
解决方法很简单,使用

	git push origin master


* 先写这么多吧，有什么的话想起来再写。
