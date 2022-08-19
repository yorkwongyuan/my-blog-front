export default `---
theme: condensed-night-purple
highlight: an-old-hope
---


买了台腾讯云服务器, 发现登录默认端口都是22, 每次登录都要输入密码, 怪不爽的, 于是决定针对这两点, 进行一下优化: 改掉22默认端口, 实现免密登录!

我们按照常规流程登录:

1. ssh root@xxx.xx.xxx.xx (默认端口为22)
2. 输入密码


# 修改默认端口
netstat -anlp | grep sshd 查看现在sshd服务的端口, 此时应该只有22端口

vi /etc/ssh/sshd_config 修改ssh配置文件, 我们需要打开sshd_config配置文件, 我们将目光锁定到**Port**选项, 如图:
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6f0bf18b5b2545da9001caaa417ce80f~tplv-k3u1fbpfcp-zoom-1.image)

我们将光标移动端#Port 22这行, 将前面的井号删除,也就是相当于去掉了注释, 然后将端口号改为**10022**

但是要注意上面还有一段话:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8e2e9984646c4456be13fc2a630ba2ef~tplv-k3u1fbpfcp-zoom-1.image)

大概意思就是, 如果你要修改SELinux系统的端口, 那么你需要使用semanage port -a -t ssh_port_t -p tcp #PORTNUMBER命令告诉SELinux你这次的改变, 命令如下:

> SELinux模块是centos2.4以上集成的一个安全性模块

wq, 保存退出,

执行semanage port -a -t ssh_port_t -p tcp 10022

此时, 会报出-bash: semanage: 未找到命令!

我们可以使用反查命令, 查出哪个包提供了semanage命令

yum whatprovides semanage

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/45d379b29a6242469f3dae5d4f1e3435~tplv-k3u1fbpfcp-zoom-1.image)

由此, 我们可以查出是policycoreutils-python这个包

我们可以直接安装这个包

yum install -y policycoreutils-python

注意, 输入安装命令, 包名后面可以不加版本号-2.5-34这些

然后我们再使用前面的命令

semanage port -a -t ssh_port_t -p tcp 10022

然后我们要确认下我们是否成功增加了这个端口

semanage port -l | grep ssh

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/723f5c11d6bb452f8a8db6a5840460fd~tplv-k3u1fbpfcp-zoom-1.image)

说明已经添加成功!

这里注意下, 我们发现这里多了一个10088端口, 可以通过以下命令删除

semanage port -d -t ssh_port_t -p tcp 10088

接着,我们需要重新启动一下ssh服务

service sshd restart

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/87d77d1cac56441b9d3f62279d287796~tplv-k3u1fbpfcp-zoom-1.image)

我们可以通过新端口登录了

ssh -p 10022 root@xxx.xx.xxx.xx

# 免密钥登录

1.  ssh-keygen 生成id_rsa文件

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d076a86a52414202a7bea873654183ac~tplv-k3u1fbpfcp-zoom-1.image)

2.  将本地的公钥, 复制到服务器(~/.ssh/authorized_keys)文件内

注意, 这里除了直接将本地公钥复制到服务器, 还能使用命令的方式来处理


ssh-copy-id -i ~/.ssh/id_rsa.pub root@xxx.xxx.xxx.xx
// 给文件夹赋予权限
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys


如果出现错误: Enter passphrase forkey'xxxx', 此时需要将公钥通过ssh-add加入到高速缓存中

ssh-add -k ~/.ssh/id_rsa

3.  修改本地~/.ssh下的config文件, 以实现免输入IP+port登录服务器


// ~/.ssh/config
Host TX-WY
  Port 10022
  HostName xxx.xx.xxx.xx
  User root
  IdentityFile ~/.ssh/id_rsa
  IdentitiesOnly yes
`
