---
layout: post
title: "一款新的Linux平台Markdown编辑器---Remarkable"
data: 2014-09-03
categories:
- notes
tags:
- markdown
- Remarkable

---

　　 Linux平台缺乏好的Markdown编辑器。ReText算是一个，但是他只是实现了基本的功能，并不算让人满意，并且好久没有更新过了，所以基本上都是使用Sublime。今天突然看到一个新的编辑器---Remarkable，便下来一试，一下便是使用的感受。

1. 支持Live Preview(0.956版本不完善，有时候不能正确定位Bug)

2. Systax Highlighting(自动识别语言，建议将代码块放在两个 `---` 之间)

3. 支持 Github Markdown

4. Custom CSS(CSS编辑器不够强大)

5. Export to PDF and HTML

6. 支持表格

7. 支持checklist

8. 自动识别链接

　　这里只里里列举了一部分个人觉得不错的功能，还有其他的功能不再一一列举，可以到其官网 [remarkableapp](http://remarkableapp.net/)了解更多。

---
	# include <stdio.h>
	
	int main(void)
	{
		int i = 0, j = 1;
		print("%d\n", i+j);
		return 0;
	}
---

- [ ] To Do
- [X] Done 


　　不足的地方在上面的括号中已经列出，还有一点在Ubuntu中他的保存提示信息让人不爽。相信在以后的版本中会更加的强大。

