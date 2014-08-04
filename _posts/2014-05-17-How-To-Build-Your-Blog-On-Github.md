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

---
1.如果你按照官方的详细步骤做完最后一步之后，发现打开username.github.com（username是你的github用户名，下同），只有一个hello world，如果你不懂点html的东西的话，你可能到这里就没了辙。

不过没有关系，你可以到别人的github上面fork一下别人的blog，比如[github.com/jekyll/jekyll/wiki/sites](https://github.com/jekyll/jekyll/wiki/sites),里面给出了一些别人博客地址，还有博客托管的github地址,你可以直接去下载下来，根据自己的喜好，添加或者删除一些东西，可以自己用了。

说到这里，要提醒的是，如果你不喜欢折腾，那还是老老实实找个新浪博客/博客园之类的用吧，其实他们做的也都挺不错的。
  
------
2.git 的使用问题，如果你用windows下的git工具的话，可能不会有什么大的问题，照着教程一步一步做下去就okay。另外当你遇到不能上传的情况时，先把远程仓库pull下来再push。

------
3.第一次将本地的文件push到github上面,可能会出现这种问题:

      git push
      No refs in common and none specified; doing nothing.
	  Perhaps you should specify a branch such as 'master'.
	  fatal: The remote end hung up unexpectedly
	  error: failed to push some refs to 'file:///xxxxxxx.git'
	
解决方法很简单,使用

	git push origin master
	
------
4.如果在git push时候遇到下面这种情况：

		To git@github.com:angela0/angela0.github.io.git
		 ! [rejected]        master -> master (non-fast-forward)
		 error: failed to push some refs to 'git@github.com:angela0/angela0.github.io.git'
		 To prevent you from losing history, non-fast-forward updates were rejected
		 Merge the remote changes (e.g. 'git pull') before pushing again.  See the
		 'Note about fast-forwards' section of 'git push --help' for details.
	你可以先执行git pull 将远程跟本地同步之后再git push

----	
5.远程验证
  
  你第一次向github远程仓库提交代码之前要先配置一下git如果不使用ssh key验证的话每次提交都要输入帐号密码，比较麻烦，所以最好使用ssh key。
  
  a. 执行如下代码：
        
         ssh-keygen -t rsa -C "your_email@youremail.com"
        
     其中your_email@youremail.com是你的邮箱地址
  
  b. 在github的 Accoun settings 里面找到SSH keys -> Add SSH key, title无所谓，但最好能表示出是哪个电脑上的,然后把刚才在 ~/.ssh/ 文件夹中生成的x.pub里面的内容拷贝进去。
  
  c. 保存后可以通过下面命令来测试一下：
  
         ssh -T git@github.com
     
     如果成功会出现下面提示：
       
         You've successfully authenticated, but GitHub does not provide shell access
         
  d. 设置username和email
  
         git config --global user.name "your name"
         git config --global user.email "your_email@youremail.com"
         
  e. 这样应该就可以了

------
6.如果使用Mac或者windows的话，可以到[mac](http://mac.github.com)和
  [windows](http://windows.github.com)页面下载github工具，十分方便

*先写这么多吧，有什么的话想起来再写。
