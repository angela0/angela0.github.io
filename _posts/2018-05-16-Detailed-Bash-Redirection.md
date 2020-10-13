---
layout: post
title:  "详谈Bash的重定向"
data: 2018-05-15
published: false
categories:
- Linux
---

本篇文章内容主要为 bash 手册里面 **重定向** 一节翻译。

在一个命令被执行之前，它的输入和输出可以被一种特殊的符号重定向。重定向可以让被复制、打开以及关闭的文件句柄指向其他文件，并且可以改变该命令要读写的文件。重定向也可以用于在当前 shell 执行环境中修改文件句柄。重定向操作符可以出现在一个[简单命令]()之前，简单命令中的任意地方，或者跟在一个[命令]()后面。shell 按照从左到右的出现顺序处理重定向。


Before  a  command  is executed, its input and output may be redirected using a special notation interpreted by the shell.  Redirection allows commands' file handles to be duplicated, opened, closed, made to refer to different files, ancan change the files the command reads from and  writes
       to.   Redirection may also be used to modify file handles in the current shell execution environment.  The following redirection operators may pre‐
       cede or appear anywhere within a simple command or may follow a command.  Redirections are processed in the order they appear, from left to right.

       Each redirection that may be preceded by a file descriptor number may instead be preceded by a word of the form {varname}.  In this case, for  each
       redirection operator except >&- and <&-, the shell will allocate a file descriptor greater than or equal to 10 and assign it to varname.  If >&- or
       <&- is preceded by {varname}, the value of varname defines the file descriptor to close.

       In the following descriptions, if the file descriptor number is omitted, and the first character of the redirection operator is <, the  redirection
       refers  to the standard input (file descriptor 0).  If the first character of the redirection operator is >, the redirection refers to the standard
       output (file descriptor 1).

       The word following the redirection operator in the following descriptions, unless otherwise noted, is subjected to brace  expansion,  tilde  expan‐
       sion,  parameter  and variable expansion, command substitution, arithmetic expansion, quote removal, pathname expansion, and word splitting.  If it
       expands to more than one word, bash reports an error.

       Note that the order of redirections is significant.  For example, the command

              ls > dirlist 2>&1

       directs both standard output and standard error to the file dirlist, while the command

              ls 2>&1 > dirlist

       directs only the standard output to file dirlist, because the standard error was duplicated from the standard output before the standard output was
       redirected to dirlist.

       Bash handles several filenames specially when they are used in redirections, as described in the following table.  If the operating system on which
       bash is running provides these special files, bash will use them; otherwise it will emulate them internally with the behavior described below.
