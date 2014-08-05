---
layout:  post
title: "怎么在ubuntu上面搭建hustOj和hustVoj"
data: 2014-05-21
categories:
- Notes
tags: 
- Ubuntu
- hust
- virtualOnlineJudge
- oj

---

###hustOj的搭建
####也许有错误的地方请指正
这个比较简单，官方的README文档说的也很清楚，不过我要把详细的步骤说一下：

这里只说自动安装，想要琢磨一下的话可以用手动安装

1. 安装svn  

		sudo apt-get install subversion

2. 使用svn下载安装文件及配置

		svn checkout http://hustoj.googlecode.com/svn/trunk/install hustoj

3. 根据自己的需要编辑hustoj文件夹里面的install.sh以及judge.conf文件，尤其是已经安装过mysql的机器，要将judge.conf里面的数据库配置更改一下，一般情况不需要做其他更改，直接运行install.sh

		sudo ./install.sh

4. 如果不出意外，这个时候已经安装完成，访问一下<a href="http://127.0.0.1" target="_blank">127.0.0.1</a>试试，应该可以访问，如果只出现 It works! 这个页面，你可以访问<a href="http://127.0.0.1/JudgeOnline" target="_blank">127.0.0.1/JudgeOnline</a>

5. 到这里注册一个帐号<a href="http://127.0.0.1/JudgeOnline/registerpage.php" target="_blank">127.0.0.1/JudgeOnline/registerpage.php</a>,建议使用admin

6. 将刚才建的admin帐号设置为管理员

		insert into privilege(user_id,rightstr) values('admin','administrator'); 

7. 到这里，OJ已经可以使用，可以导入题库等等，这里有整理好的题目<a href="http://code.google.com/p/freeproblemset/" target="_blank">code.google.com/p/freeproblemset</a>,后续管理工作就不再说了

如果不想倒腾的话，可以直接使用Live安装光盘进行安装

#####这个不是本文的重点，如果在安装过程中有什么疑问，可以到该项目wiki-FAQ里面查找或者提问<a href="https://code.google.com/p/hustoj/wiki/FAQ" target="_blank"></a>

<hr/>

###hust virtual OJ的搭建
####这个是本文的重点，因为网上的教程很少

因为这个虚拟OJ使用JSP，所以apache无法解析，可以考虑tomcat

下面就在已有hust oj的情况下，搭建hust virtual oj,当然如果访问量很大，放在一个服务器上肯定不行的

1. 既然是JSP项目，肯定要用jdk了，在linux下可以使用openjdk

		sudo apt-get install openjdk-7-jdk

2. 我们已经有apache2和mysql了，不用再安装了不过要建一个数据库,再建所需要的表，表的话有现成的sql文件，你可以直接导入，如果没有找到可以联系我，邮件给你

		mysql -uuser -ppassword			//user 是你的mysql用户名，password是该用户名的密码
		create database vhoj;		//新建一个名字是 vhoj 的数据库
		source db.sql;		//db.sql 是那个建表的sql文件

3. 安装tomcat

	到这里下载<a href="http://tomcat.apache.org" target="_blank">tomcat.apache.org</a>，在左侧选择一个版本点进去进行下载，下载的是core的tar.gz/zip的包，我下载的是tomcat7。将解压后的文件夹复制到 /usr/local 目录下，文件夹的名字任意，在这里我保持原来的不变。

	完成之后还要手动配置一下环境变量

		vim /etc/profile
	在文件的最后面加上下面几个语句

		CATALINA_HOME=/usr/local/apache-tomcat-7.0.53/
		PATH=$CATALINA_HOME/bin:$PATH
		export PATH CATALINA_HOME
	将/usr/local/apache-tomcat-7.0.53/bin/ 目录下的所有文件全部添加执行权限

		chmod +x -R /usr/local/apache-tomcat-7.0.53/bin/
	之后要执行bin目录里面的startup.sh来运行tomcat，停止用shutdown.sh
		./startup.sh

    访问<a href="http://127.0.0.1:8080">127.0.0.1:8080</a>,如果出现 apache tomcat的界面说明安装成功

4. 在 /usr/local/apache-tomcat-7.0.53/webapps/下新建一个文件夹 vjudge ,将下载回来的judge.war 复制到这个文件夹后解压

		unzip judge.war
	编辑vjudge/WEB-INF/db.properties，将数据库用户/密码改为你设置的

	编辑vjudge/WEB-INF/web.properties，如果你是在本机调试屏蔽前三行,basepath的路径要和你的一致;如果远程客户端使用，屏蔽后三行，basepash的路径要和你一致

	新建一个accounts.conf，将你在各大OJ注册的帐号放进去格式如下：

		POJ username password
		ZOJ username password
		UVALive username password
		SGU username password
	现在他就应该可以工作了

####有什么问题的话，欢迎探讨
