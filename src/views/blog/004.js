export default `本文主要总结了[vue3源码](https://github.com/vuejs/core)中, /scripts/release.js的实现逻辑和技术要点, 这部分代码主要负责vue3工程的发布, 其中功能点,简单来说就是**规范发布版本以及发布流程**. 能为我们自己开发一个类似的发布流程规范工具提供一些参考.

主要涉及的知识点:

1.  npm script 钩子.
1.  minimist, chalk, execa, semver, enquirer, 等包的使用.



3.  semver规范介绍.
3.  pnpm的使用.

<!---->

5.  其他一小的些技术细节

# npm script 钩子

一般首次拉代码, 我们都会有个习惯那就是马上执行npm install, 也就是安装依赖, 但是第一步就翻车了

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/99b3ff1c8aec49988245d7bbd6ba4895~tplv-k3u1fbpfcp-zoom-1.image)

大体意思也很明确: 那就是本项目的包管理工具是pnpm! 什么是pnpm? 这个后续介绍, 先看看这个错误是怎么来的! 终于, 在package.json中, 我发现了这么一个命令:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ff157c41c0b545eb970f3a024d672a7a~tplv-k3u1fbpfcp-zoom-1.image)

没错, 这个就是npm script中的一个钩子, 也就是**在install之前会执行.**

规律就是prexx为执行xx命令之前调用,postxx为执行某命令之后调用, 例如:

-   preinstall/ postinstall: 安装依赖前/后执行
-   prepublish/postpublish: 发布之前/后执行
-   preuninstall/postuninstall: 卸载之前/后执行
-   pretest/posttest: 执行npm test之前/后执行

...大体规律如此, 这里不再一一列举

好, 现在来看看preinstall.js中的内容:

javascript
if (!/pnpm/.test(process.env.npm_execpath || '')) {
  console.warn(
    \u001b[33mThis repository requires using pnpm as the package manager  +
       for scripts to work properly.\u001b[39m\n
  )
  process.exit(1)
}


这里实际上是通过process.env.npm_execpath来判断当前是否使用pnpm来执行install命令, 那么process.env.npm_execpath又是什么呢?他实际返回的是命令的可执行文件的路径;

我们来做一个小的测试:

/package.json

json
...
"scripts": {
	"dev": "node ./index.js",
}
...


/index.js:

javascript
console.log(process.env.npm_execpath)


执行npm run dev

shell
/usr/local/lib/node_modules/npm/bin/npm-cli.js


执行pnpm run dev

shell
/usr/local/lib/node_modules/pnpm/bin/pnpm.cjs


因此这里其实就是要我们保证, 要用pnpm来执行安装!

# 依赖解析

安装了pnpm之后, 继续看今天主要要学习的内容:/scripts/release.js

首先来看下引入了哪些依赖包, 只有熟悉了它们的用法, 才能更好理解后续的源代码.

javascript
const args = require('minimist')(process.argv.slice(2))
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const semver = require('semver')
const currentVersion = require('../package.json').version
const { prompt } = require('enquirer')
const execa = require('execa')


## minimist

首先我们要了解的是minimist, 这是一个轻量级的node参数解析库;说白了, 就是处理入参的, 返回的是一个函数:

-   参数: process.argv.slice(2)返回的数组

     -   process.argv返回一个数组:


    -   第一个元素为[process.execPath](http://nodejs.cn/api/process.html#processexecpath)
        第二个元素为正在执行javascript的文件的路径


     -   后续才是我们命令行输入的参数, 所以, **一般会通过process.argv.slice(2)来获取命令行参数**


-   返回值: 对象

javascript
const minimist = require('minimist')
const args = minimist(process.argv.slice(2))
console.log('🚀 ~ file: index.js ~ line 2 ~ args', args)


这段简单的脚本, 命令行可以接受不同形式的参数:

### 双连字符

1.  传入键和值, 以等号隔开

shell
node index.js --name='矿工' --age=18 --gender='male'
🚀 ~ file: index.js ~ line 2 ~ args { _: [], name: '矿工', age: 18, gender: 'male' }


由此可知, 我们的参数被以空格和--分隔开, 以等号连接键和值, 这个库返回的是一个对象.

2.  只传键, 而不传值, 值默认会被定为true!

shell
node index.js --name='矿工' --isDevelopter
🚀 ~ file: index.js ~ line 2 ~ args { _: [], name: '矿工', isDevelopter: true }


### 单连字符

1.  批量创建值为true的参数

shell
node index.js -abc
// 🚀 ~ file: index.js ~ line 2 ~ args { _: [], a: true, b: true, c: true }


2.  创建混合类型的值

shell
node index -ab hello
🚀 ~ file: index.js ~ line 2 ~ args { _: [], a: true, b: 'hello' }


### 终端命令中无任何符号

将输入的参数将成为_元素的值

shell
node index a b c
// 🚀 ~ file: index.js ~ line 2 ~ args { _: [ 'a', 'b', 'c' ] }


### 函数的第二个参数

类型: 对象, 键为数据类型, 值为命令行参数

javascript
const minimist = require('minimist')
const args = minimist(process.argv.slice(2), {
  string: ['name']
})
console.log('🚀 ~ file: index.js ~ line 2 ~ args', args)


执行

shell
node index --name
🚀 ~ file: index.js ~ line 2 ~ args { _: [], name: '', age: 12 }


会发现, 我们没有给name并没有被赋值为true, 而是成了空字符串.

## chalk

chalk 是一个可以修改终端输出文字样式的包, 如果你经常看源码, 这也是一个'老熟人'了.非常简单, 这里不过多展开了

javascript
const chalk = require('chalk')
console.log(chalk.red('这就是红色'))
console.log(chalk.bold.green('粗体'))
console.log(chalk.yellow('黄色字体'))
console.log(chalk.bgWhite.black('白底黑字'))


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dd29e8a791c849c492401b0d01cc15d8~tplv-k3u1fbpfcp-zoom-1.image)

## semver

在开始介绍semver这个依赖之前, 我们先来了解下, 何为语义化版本规范?

### semver规范

语义化版本规范(semantic versioning).其规范大体如下:

1.  就构成组成来讲,我们的软件版本号由三部分组成:
- 主版本号, 新增了不兼容老版本的API的修改, 也就是大的版本迭代, 增加新的功能.
- 次版本号,做了向下兼容的功能性新增.
- 修订版本号, 做了向下兼容的问题修正.
- 先行版本号, 是在修订版本号后面加了-xx, 还有一串点分割符
    -  alpha版本, 也就是内部测试版本, 一般是内部测试用
    - beta版本, 也是测试版本, 但是在alpha版本之后, 这期间会一直加入新的功能.
    - release candidate版(RC版), 线上版本的候选版本, 不会再增加心功能了, 主要用于解决bug.
版本递增规则: 高位的增加之后, 所有的低位都要归零, 例如: 1.0.2 , 主版本升一个版本号之后, 就变
成了2.0.0.

我们可以看看vue的版本系统,可以通过npm view vue versions来查看vue的所有版本, 我们会发现, vue的版本格式是非常规范的

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8459959d4f95490f996e20b1b52f86ba~tplv-k3u1fbpfcp-zoom-1.image)

在package.json中, 还有些特殊符号表示特殊的含义

#### 固定大版本, 向后(新)兼容

^, 表示同一主版本下, 不得低于指定的版本

json
"chalk": "^4.1.0" // chalk, 只能是4.2.0, 4.3.2 这类, 不能是5.1.0


#### 固定主/次版本

~, 表示同一主版本, 次版本下, 不低于指定版本

json
"vue": "~2.2.1" // vue, 只能是2.2.x版本, 且不得低于2.2.1


#### 不等号/等号

>, <, >=, <=, =, 大于,小于, 等于某个版本

我们用npm view lodash versions, 找到一个lodash的版本, 然后在package.json中写下

json
"lodash": ">4.10.0"


然后npm install, 可以看到, 我们安装的lodash为最新版本

执行npm list lodash, 我们会看到

shell
lodash@4.17.21


我们再删除package-lock.json中的lodash版本, 修改package.json

shell
"lodash": "<4.10.0"


npm install, 执行npm list lodash,得到的lodash版本号为:

shell
lodash@4.9.0


由此我们可以得出结论: pacakge.json 中的版本体系, 其实很不严谨,它更多给版本提出‘指导性意见’, 没有定死版本号. 而准确确定版本号, 还是要靠package-lock.json文件!所以, 版本到底是多少, package-lock.json文件说得算! 严格来讲, 是该文件中, **packages/node_modules/package-name/version的值, 说得算!**

例如: package.json 中, lodash版本为^1.0.2

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4cadd4ddd1b9412b9c7d03ce9f1a6a99~tplv-k3u1fbpfcp-zoom-1.image)

可以看出, 和package-lock.json的packages下的版本号一致!

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7fb6c6484e9f40e0ae6d625749bc9715~tplv-k3u1fbpfcp-zoom-1.image)

但是我们npm list lodash一下:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fe8fda12f4ee4ced961901cfaabd0725~tplv-k3u1fbpfcp-zoom-1.image)

再看看package-lock.json的node_modules/lodash:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d66260159bae41048a55f756fc183667~tplv-k3u1fbpfcp-zoom-1.image)

说明安装的版本就是1.3.1, 如果你还不放心, 直接去node_modules下看看:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a7f7c57f4d864bec85895e4808bd0aae~tplv-k3u1fbpfcp-zoom-1.image)

#### 或

在package.json中, 如果使用了||符号, 再npm install, 通常会安装相对比较新的版本


"lodash": "4.7.0 || 4.2.1" // 最终将会安装lodash@4.7.0


#### 星号

表示任意版本, 一般 执行 install packageName@*, 来实现, 一般会安装任意版本


"lodash": "*"


### semver包介绍

好了, 说完了语义化规范的基本概念

我们言归正传来看下semver这个包(npm包版本: 7.3.2)的作用, 更多信息可以参考: <https://www.npmjs.com/package/semver>

这里我们重点关注两个方法,

第一个是semver.inc, 该方法主要用于规范版本号的提升:

- 参数:
    -    初始版本号
    -    需要被提升的版本号(主/次/修订版本/先行版本号)
    -    先行版本的标识, 诸如前面说过的, alpha, beta, release, 当然, 这里的变量是可以随意输入的. 同时要注意, 如果第二个参数是主/次/修订(major, minor, patch), 第三个参数无效!

-   返回值: 转换后的版本号

案例:

javascript
const semver = require('semver')
let currentVersion = require('./package.json').version
let newVersion = semver.inc(currentVersion, 'prerelease', 'beta')
// 我们由此获得了一个标准格式的版本号
console.log('🚀 ->', newVersion)
// 🚀 -> 1.0.1-beta.0


第二个是semver.prerelease, 主要用于获取一个先行版本的连字符后面的信息

-   参数: 一个先行版本号
-   返回值: 一个数组, 包含先行版本的标识以及版本号

案例: 执行命令: node index 1.2.3-beta.3

javascript
const minimist = require('minimist')
// 获取参数
const args = minimist(process.argv.slice(2))
// 获取终端入参, 即版本号1.2.3-beta.3
const targetVersion = args._[0]
let result = semver.prerelease(targetVersion)
console.log('🚀 ~ file: index.js ~ line 3 ~ main ~ result', result)
// 输出:
// 🚀 ~ file: index.js ~ line 14 ~ main ~ result [ 'beta', 3 ]


## enquirer

是一个交互式询问用户输入的包, 可以让用户和程序进行一个交互, 这种交互效果我们在脚手架构建项目时经常遇到.这样说可能有点抽象, 看张图就明白了, 我们的发布流程, 交互全靠它了

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2ec86515a8c84498a6e4c359ddf209c7~tplv-k3u1fbpfcp-zoom-1.image)

好了, 我们来具体看看认识下这个包吧, 更多内容可以参考具体文档: <https://www.npmjs.com/package/enquirer>

这里我们重点关注下prompt方法, 这是一个异步方法,字面意思就是提示之类的

参数: 接受一个数组/对象

返回: 返回的是一个对象, 键是参数中name属性的值

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/495c887e1ce94f43ab8a04cb63c3cf33~tplv-k3u1fbpfcp-zoom-1.image)

对象里的属性主要就是type, name,message, type主要是交互的类型, 如源码中的'input'就是输入, 'select'就是选

| 参数      | 是否必填 | 数据类型             | 取值范围                  | 说明     |
| ------- | ---- | ---------------- | --------------------- | ------ |
| type    | 是    | string|function | input/select/confirm等 | 交互类型   |
| name    | 是    | string|function | -                    | 输入内容的键 |
| message | 是    | string|function | -                    | 提示语    |
| initial | 否    | string|function | -                    | 默认值    |
| choices | 否    | array            | -                    | 多选方案   |

我们再来结合前面说semver/minimist的实际操作一波

javascript
const {prompt} = require('enquirer')
const semver = require('semver')
const args = require('minimist')(process.argv.slice(2))
const currentVersion = require('./package.json').version
// 获取参数
const preId = args.preid || ''
// 选择发布版本
const versionIncrements = [
  'major', 'minor', 'patch',
  ...(preId ? ['release', 'prerelease', 'prepatch', 'preminor']: [])
]

const inc = i => semver.inc(currentVersion, i, preId)
const response2 = prompt({
  type: 'select',
  name: 'release',
  message: '请选择你的发布版本',
  choices: versionIncrements.map(i => {i} {inc(i)}).concat(['custom'])
})

response2.then(res => {
  console.log('我们选择了:', res)
})


运行效果如下:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8139edf80cb04466ac9303e8ba7189f7~tplv-k3u1fbpfcp-zoom-1.image)

## execa

这个包, 说白了, 就是一个可以调用shell的node模块

更多可以参考文档: <https://www.npmjs.com/package/execa>

这里我们简单操作一下

javascript
const execa = require('execa')
execa('echo', ['我就是一个矿工']).then(res => {
  console.log('🚀 ~ file: index.js ~ line 4 ~ execa ~ res', res.stdout)
})
输出结果:
// 🚀 ~ file: index.js ~ line 4 ~ execa ~ res 我就是一个矿工eted in 2ms


# 封装方法的解析

介绍完了引入的包, 我们再看下基于以上的依赖包, 源码中封装了哪些后续会用到的方法, 如果仔细看完前面对于几个依赖的介绍, 这部分是非常好理解的, 当然, 你也可以选择接跳过这块.

javascript
// 省略了前面已经介绍了的依赖的引入部分
...
const currentVersion = require('../package.json').version
// 第10行
// 首先获取终端的preid入参, 形如: node index.js --preid=beta
// 这里的preId, 意思就是先行版本标识, 诸如: beta, alpha.
// 以下这段源码的含义就是:
// 如果用户输入了先行版本标识, 则以该标识作为先行版本的一部分
// 否则通过semver.prerelease方法, 从本身版本中获取
const preId =
  args.preid ||
  (semver.prerelease(currentVersion) && semver.prerelease(currentVersion)[0])
// 读取用户输入的--dry参数, 决定是否空跑
const isDryRun = args.dry
// 是否跳过测试
const skipTests = args.skipTests
// 是否跳过构建
const skipBuild = args.skipBuild
// 读取packages文件夹下的所有内容, 除.ts文件以及.开头的文件
// 读取出来的就是一个数组:['compiler-core', 'compiler-dom',...],
// 反正最后的产出就是/packages下的所有文件夹的名字
const packages = fs
  .readdirSync(path.resolve(__dirname, '../packages'))
  .filter(p => !p.endsWith('.ts') && !p.startsWith('.'))
// 忽略的包
const skippedPackages = []

// inc方法, 输入当前版本, 要修改的位, 追加版本标识; 返回增长后的版本号
const inc = i => semver.inc(currentVersion, i, preId)
// bin方法, 获取命令的路径(在node_modules/.bin之下)
const bin = name => path.resolve(__dirname, '../node_modules/.bin/' + name)
// 执行命令
// 参数为命令的文件路径, 参数
const run = (bin, args, opts = {}) =>
  execa(bin, args, { stdio: 'inherit', ...opts })
// 前面提到的dry模式, 也就是所谓的‘空跑’, 只打印执行了哪些命令, 而不去真正执行
const dryRun = (bin, args, opts = {}) =>
  console.log(chalk.blue([dryrun] {bin} {args.join(' ')}), opts)
// 通过isDryRun来结合dryRun和run命令
const runIfNotDry = isDryRun ? dryRun : run
// 获取某个包的绝对路径
const getPkgRoot = pkg => path.resolve(__dirname, '../packages/' + pkg)
// 打印信息, 主要打印些蓝色的文字, 提示阶段性内容
const step = msg => console.log(chalk.cyan(msg))
...
主函数部分省略


# 主函数解析

终于进入了主函数部分, 通过对前2部分有了个大概了解, 我们来看下主函数, 总体说来, 主要做了这几件事:

1.  确定版本
1.  单元测试
3.  更新版本
3.  编译
5.  生成日志
5.  更新pnpm-lock
7.  git 提交
7.  发布

好了, 让我们一部分一部分来

## 确定版本

可以看到, 在本阶段, 主要的目的是确定用户要发布的版本.

具体用到了minimist, enquirer等包, 通过用户的选择/输入来确定版本.

javascript
const currentVersion = require('../package.json').version
...
// 版本位的数组
const versionIncrements = [
  'patch',
  'minor',
  'major',
  ...(preId ? ['prepatch', 'preminor', 'premajor', 'prerelease'] : [])
]
...
const inc = i => semver.inc(currentVersion, i, preId)
...
// 主函数
async function main () {
...
  // 第40行
  // 获取终端输入的参数, 注意, minimist的_项是一个数组, 数组里包含的都是前面不带任何符号的
  // 参数, 形如: node index.js 1.0.2, 那么, 此时的args._[0]也就是targetVersion就是1.0.2
  let targetVersion = args._[0]

  // 如果没有目标版本, 也就是在终端没输入版本号
  if (!targetVersion) {
    // no explicit version, offer suggestions
    // 让用户选择要新增的版本号的位
    const { release } = await prompt({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: versionIncrements.map(i => {i} ({inc(i)})).concat(['custom'])
    })
    // 如果用户选择了custom
    if (release === 'custom') {
      // 则输入版本号
      targetVersion = (
        await prompt({
          type: 'input',
          name: 'version',
          message: 'Input custom version',
          initial: currentVersion
        })
      ).version
    } else {
      targetVersion = release.match(/((.*))/)[1]
    }
  }
  // 如果输入的版本号不合法
  // 注意, 此处正是使用semver, 版本语义化库来判断
  if (!semver.valid(targetVersion)) {
    // 报错
    throw new Error(invalid target version: {targetVersion})
  }
  // 确定是否使用输入的版本号
  const { yes } = await prompt({
    type: 'confirm',
    name: 'yes',
    message: Releasing v{targetVersion}. Confirm?
  })
...
}


## 执行单元测试

很显然, 这里实际上执行的是jest 和 pnpm test两个命令

javascript
...
const bin = name => path.resolve(__dirname, '../node_modules/.bin/' + name)
const run = (bin, args, opts = {}) =>
  execa(bin, args, { stdio: 'inherit', ...opts })
...
// 第80行  
step('\nRunning tests...')
if (!skipTests && !isDryRun) {
	await run(bin('jest'), ['--clearCache'])
	await run('pnpm', ['test', '--', '--bail'])
} else {
	console.log((skipped))
}


这段源码本身的意思很简单, 就是执行jest单元测试, 然后执行pnpm test! 这里我们需要再提示2点:

1.  jest是局部安装的, 通过bin方法执行了 /node_modules/.bin/下的jest可执行文件. (我们平时使用的npm run xx, 实际上是执行了node_modules/.bin文件夹下的可执行文件)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f4e34b802d9746248ebfc268c84c3f21~tplv-k3u1fbpfcp-zoom-1.image)

2.  pnpm, 更多信息可以参考官网: [pnpm](https://pnpm.io/zh/motivation),这里做一个简单介绍:

其实正如官网说的:这是一个快速的, 节省磁盘的**包管理工具**

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7c6f4d7eecf349e5830f0e2d80ab914d~tplv-k3u1fbpfcp-zoom-1.image)

说白了还不就是个包管理, 我们已经有了npm/yarn了, 那为什么要用它?

### 更快,更节省空间

这里我们进行一个小测试:

新建两个工程,都用pnpm只安装了一个express包,并且, 一个版本为**4.17.0**, 另一个版本为**4.17.2**:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/296689c279334a7a9ca1d955cf8950e5~tplv-k3u1fbpfcp-zoom-1.image)![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6b67ed04bd6e4b1da99ff874b2e783c7~tplv-k3u1fbpfcp-zoom-1.image)

这里提出一个问题, 我们安装了几个完整的express包? 按之前npm的逻辑, 当然是俩喽, 何况他们版本都不一样, 难不成还能是一个? 这里, 我们打开第一个express的index.js文件, 试着修改点啥, 再看看另一个express的index.js文件, 看看啥效果:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2319d04f53e14402b5737c1c9edc05dc~tplv-k3u1fbpfcp-zoom-1.image)![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/888bde94cb964c52bce183542fb54a33~tplv-k3u1fbpfcp-zoom-1.image)

我们会发现, 两者竟然会同步修改! **注意,这还是两个不同工程的, 不同版本的本地安装的express!**

因此我们可以理解文档里的这句话了:

当使用 npm 或 Yarn 时，如果你有100个项目使用了某个依赖（dependency），就会有100份该依赖的副本保存在硬盘上。 而在使用 pnpm 时，依赖会被存储在内容可寻址的存储中

所以说, 使用pnpm可以大大节省我们的硬盘空间! 而本案例中, 即使是2个不同版本的pnpm, 都能做到代码的复用, 只需要安装不同的部分! 我们也就可以推导出, 如果我们再安装一个express, 它的速度自然要比从头开始下载的npm快得多!

### 非扁平化node_modules文件夹

npm3之后, node_modules文件夹启用了扁平化的设计方式, 这种方式可以减少依赖嵌套深度, 但是, 存在的问题就是我们会引导我们依赖的依赖, 即使我们本不不需!

关于这点, 我们再做一个测试, 我们再创建一个工程,只是,这个工程用原来的npm创建

javascript
// npm-demo
const parseurl = require('parseurl')
console.log(parseurl, 'parseurl in express')
// [Function: parseurl] { original: [Function: originalurl] } parseurl in express



// pnpm-demo
const parseurl = require('parseurl')
console.log(parseurl, 'parseurl in express')
// 报错: Error: Cannot find module 'parseurl'


我们会发现, npm的项目, 可以引入express的依赖parseurl, 而pnpm则不会

除此之外, 扁平化算法难度很高, 往往需要更多的维护人员, 更多关于pnpm在node_modules上的处理, 可以参考文档,[Why should we use pnpm?](https://www.kochan.io/nodejs/why-should-we-use-pnpm.html)

## 更新所有包版本

这部分逻辑也较好理解, 主要就做了两件事:

1.  更新根目录下的package.json的版本号以及vue相关的依赖的版本号
1.  更新packages文件夹下所有包的package.json的版本号以及vue相关的依赖的版本号

javascript
// 第89行 
// 更新依赖
step('\nUpdating cross dependencies...')
 updateVersions(targetVersion)
...
// 148行
function updateVersions(version) {
  // 1. update root package.json
  // 1. 更新根目录下的package.json文件
  updatePackage(path.resolve(__dirname, '..'), version)
  // 2. update all packages
  // 2. 更新所有packages目录下的包
  packages.forEach(p => updatePackage(getPkgRoot(p), version))
}

function updatePackage(pkgRoot, version) {
  const pkgPath = path.resolve(pkgRoot, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  pkg.version = version
  // 更新各个包中的package.json中的dependencies/peerDependencies中, @vue/xx
  // 的依赖的版本
  updateDeps(pkg, 'dependencies', version)
  updateDeps(pkg, 'peerDependencies', version)
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

function updateDeps(pkg, depType, version) {
  const deps = pkg[depType]
  if (!deps) return
  Object.keys(deps).forEach(dep => {
    if (
      dep === 'vue' ||
      (dep.startsWith('@vue') && packages.includes(dep.replace(/^@vue//, '')))
    ) {
      console.log(
        chalk.yellow({pkg.name} -> {depType} -> {dep}@{version})
      )
      deps[dep] = version
    }
  })
}


## 编译所有的包

前面介绍过run方法和pnpm了, 这里也就很好理解了:

执行了pnpm run build -- --release以及pnpm run test-dts-only! 具体执行逻辑, 有兴趣可以看相关的代码, 此处不做展开.

javascript
// build all packages with types
step('\nBuilding all packages...')
if (!skipBuild && !isDryRun) {
  await run('pnpm', ['run', 'build', '--', '--release'])
  // test generated dts files
  step('\nVerifying type declarations...')
  await run('pnpm', ['run', 'test-dts-only'])
} else {
  console.log((skipped))
}


注意这里pnpm run build -- --release 中为何有一个空的--, 这里实际上是等同于 node scripts/build.js --release. 中间的 --, 就是npm/pnpm 传递给script的参数

## 生成日志

执行pnpm run changelog, 生成日志, 具体可以看[conventional-changelog-cli](https://www.npmjs.com/package/conventional-changelog-cli)文档,此处不做展开

javascript
// generate changelog
step('\nGenerating changelog...')
await run(pnpm, ['run', 'changelog'])


## 更新pnpm-lock.yaml文件

这里执行了命令pnpm install --prefer-offline, 安装依赖, 同时, 更新pnpm-lock.yaml代码很简单

javascript
// update pnpm-lock.yaml
step('\nUpdating lockfile...')
await run(pnpm, ['install', '--prefer-offline'])


这里需要注意的是: --prefer-offline这个入参数

-   默认值: false
-   类型: Boolean

如果为true,则每次npm install 缺失数据将会从服务器中获取, 绕过缓存检查!更多详细信息可以参数[文档](https://pnpm.io/zh/cli/install#%E6%91%98%E8%A6%81)

## git提交仓库

这部分主要和git相关,

-   git diff, 找出此次提交的不同
-   git add -A, 也就是将所有: 新增的, 修改的, 替换的, 删除的, 全部从工作区添加到暂存区.

<!---->

-   git commit -m 'xx', 将暂存区数据提交到本地仓库
-   git tag, 给当前提交打上版本标签

<!---->

-   git push 提交代码

javascript
const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
if (stdout) {
  step('\nCommitting changes...')
  await runIfNotDry('git', ['add', '-A'])
  await runIfNotDry('git', ['commit', '-m', release: v{targetVersion}])
} else {
  console.log('No changes to commit.')
}
...
 // push to GitHub
step('\nPushing to GitHub...')
await runIfNotDry('git', ['tag', v{targetVersion}])
await runIfNotDry('git', ['push', 'origin', refs/tags/v{targetVersion}])
await runIfNotDry('git', ['push'])


## 发布

这里的发布, 本质上执行了yarn run publish来进行版本的发布

javascript
// publish packages
step('\nPublishing packages...')
for (const pkg of packages) {
  await publishPackage(pkg, targetVersion, runIfNotDry)
}
...
async function publishPackage(pkgName, version, runIfNotDry) {
  if (skippedPackages.includes(pkgName)) {
    return
  }
  const pkgRoot = getPkgRoot(pkgName)
  const pkgPath = path.resolve(pkgRoot, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  if (pkg.private) {
    return
  }

  // For now, all 3.x packages except "vue" can be published as
  // latest, whereas "vue" will be published under the "next" tag.
  let releaseTag = null
  if (args.tag) {
    releaseTag = args.tag
  } else if (version.includes('alpha')) {
    releaseTag = 'alpha'
  } else if (version.includes('beta')) {
    releaseTag = 'beta'
  } else if (version.includes('rc')) {
    releaseTag = 'rc'
  } else if (pkgName === 'vue') {
    // TODO remove when 3.x becomes default
    releaseTag = 'next'
  }

  // TODO use inferred release channel after official 3.0 release
  // const releaseTag = semver.prerelease(version)[0] || null

  step(Publishing {pkgName}...)
  try {
    await runIfNotDry(
      // note: use of yarn is intentional here as we rely on its publishing
      // behavior.
      'yarn',
      [
        'publish',
        '--new-version',
        version,
        ...(releaseTag ? ['--tag', releaseTag] : []),
        '--access',
        'public'
      ],
      {
        cwd: pkgRoot,
        stdio: 'pipe'
      }
    )
    console.log(chalk.green(Successfully published {pkgName}@{version}))
  } catch (e) {
    if (e.stderr.match(/previously published/)) {
      console.log(chalk.red(Skipping already published: {pkgName}))
    } else {
      throw e
    }
  }
}`
