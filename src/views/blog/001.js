export default `# 事件循环

## 浏览器事件循环

### 基本流程

我们的javascript可以在浏览器环境中执行, 由于是单线程, 所以为了保证所有任务的有序进行, 就有了**事件循环,** 而不同环境, 事件循环的机制有所不同, 所以我们这里介绍的姑且说是浏览器的事件循环.

其具体工作机制如下:

1.  同步任务在javascript引擎线程(主线程)下执行, 生成一个执行栈(Execution Context stack).
1.  主线程之外还有个任务队列(Task Queue), 异步任务如果有了结果, 其回调事件会被放入任务队列中, 因此, 任务队列, 又叫做'事件队列'.
1.  执行栈的同步任务完成之后, 就会去将任务队列, 找到其中第一个事件, 并放到主线程中调用!

一个简单的浏览器的事件循环如下:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d9a5f4ef64374f69899b69ca71cc7ce3~tplv-k3u1fbpfcp-zoom-1.image)

### 任务类型

#### 基本概念

上文说到的异步任务,则放入任务队列, 但是, 异步任务也有不同类型, 可分为**宏任务(macrotask)** 和**微任务(microtask),**

**宏任务: <script> 代码, setTimeout, setImmediate, setInterval, I/O, UI渲染**

**微任务: Promise, MutationObserver, Object.observe**

****

#### 为何需要区分宏任务/微任务?

我们知道, javascript是单线程的, 所以, js引擎线程和GUI渲染线程只能是交错执行的, 也就是js引擎线程干一会, 再让'位给'GUI渲染引擎干一会. 而有的任务, 恰恰需要等待渲染引擎干了之后, 再执行; 有的则不需要. 所以, 就把需要等待渲染的任务(也可以说是'比较慢'的任务)划归为宏任务, 不需要等待的划归为微任务.

#### 放置任务队列的规则

既然我们可以简单粗暴地认为宏任务'慢', 而微任务'快', (当然,我们应该知道, 本质上不是它们本身'快慢', 而是浏览器执行规则问题). 所以当异步任务(包括宏任务和微任务)有了结果之后(前面说的执行规则的第2步), 事件触发线程往任务队列里放置事件的规则是: 微任务排在前面, 而宏任务, 将被排在当前队列的最后! 两种任务各自内部的顺序是执行的顺序. 如果这么说有点抽象, 我们就来看下以下案例:
"
<style lang="scss" scoped>
.outer {
  background-color: green;
  height: 100px;
  .inner {
    height: 40px;
    background-color: red;
  }
}
</style>
<template>
  <div class="outer">
    <div class="inner"></div>
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
onMounted(() => {
  let inner = document.querySelector('.inner')
  let outer = document.querySelector('.outer')
  new MutationObserver(() => {
    console.log('mutation')
  }).observe(outer, {
    attributes: true
  })
  function onClick () {
    console.log(1)
    setTimeout(() => {
      console.log('timeout')
    }, 0)
    Promise.resolve('promise1').then(res => {
      console.log(res)
    })
    Promise.resolve().then(() => {
      console.log('promise2')
      setTimeout(() => {
        console.log('promise2-setTimeout1')
        Promise.resolve().then(() => {
          console.log('promise2-setTimeout2')
          setTimeout(() => {
            console.log('promise2-setTimeout3')
          }, 0)
        })
      }, 0)
    })
    outer.setAttribute('random-attr', Math.random())
    console.log(2)
  }
  inner.addEventListener('click', onClick)
  outer.addEventListener('click', onClick) 
})
</script>
"
不妨动手试试, 看看结果是什么, 如果看一眼, 没啥思路, 那就再看一眼, 还是没思路, 且听下放分析😂

为了直观展示顺序, 所以以下任务队列示例图中也包含当前正在执行的任务(左起第一个). 但实际中, 当前正在执行的任务是在执行栈中, 而不是任务队列, 请注意!

1.  当我们点击inner的时候, 由于冒泡事件, outer节点也将再执行一次, 我们说过I/O也是宏任务, 所以, outer将被放在inner之后等待执行, 此时的事件队列应该是

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/53b0a446bfac45f48004ffd2643ab9b6~tplv-k3u1fbpfcp-zoom-1.image)

2.  执行栈执行inner-onClick中的同步任务时, 可以很容易看出我们实际上只有console.log(1)和 console.log(2)是同步任务, 所以, 执行到这步的打印结果应该是就是: 1, 2
2.  而在同步任务执行中,我们发现了有'timeout'这个异步宏任务, 所以将其放入挂起执行, 由于其延迟时间为0, 所以, 有了结果后, 其回调会被放到任务队列的最后!

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e267bc294d5a416985427ead7a7c9d37~tplv-k3u1fbpfcp-zoom-1.image)

3.  我们接着往下看, 又发现了promise1 和 promise2, 我们知道, 这俩是微任务, 所以, 被挂起执行, 由于也是立刻得出结果,所以此时, 他们的回调事件将会被事件触发线程放入任务(事件)队列! 但由于它们是微任务, 所以, 按照它们俩的执行顺序, 可以'插队'在本轮宏任务之后!

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/636784951f7c4f899f7116021de836e9~tplv-k3u1fbpfcp-zoom-1.image)

4.  而在我们执行promise2的时候, 又发现它有promise2-setTimeout1这个宏任务, 所以它又被挂起执行, 其结果毫无悬念地放在了最后!

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/037c949397bf4de6aac9128bc72e93ba~tplv-k3u1fbpfcp-zoom-1.image)

5.  我们继续执行, 发现还有个setAttribute, 由于我们之前用mutationObserver监听了outer的属性, 所以mutation又被执行, 由于其为微任务, 所以调用结果被放在了promise2之后, outer之前!

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dde448a49930415e864c1fe53c13c6b9~tplv-k3u1fbpfcp-zoom-1.image)

6.  至此, 我们执行栈中的任务都执行完了, 可以开始从任务队列中取事件来执行! 根据上图, 现阶段打印的结果应该是 1,2, promise1, promise2, mutation, 对于outer, 注意, outer本身和inner都是同一个事件, 所以我们根据之前的经验就可以分析出执行outer事件后, 又会打印出出一批: 1,2, promise1, promise2, mutation, 也就是outer本身的同步任务和微任务! 所以现在打印出的结果是1,2, promise1, promise2, mutation, 1,2, promise1, promise2, mutation
6.  执行完outer之后, 我们知道, 除了上面说的微任务, 它也会产生宏任务timeout和setTimeout1, 而这俩, 肯定会在inner产生的宏任务的后面, 所以, outer刚执行完所有微任务时, 任务队列应该是这样:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/92b102de3514480cb84bcb3907442487~tplv-k3u1fbpfcp-zoom-1.image)

8.  此时我们接着执行到timeout, 打印出了一个timeout, 再执行setTimeout1, 打印出: promise2-setTimeout1, 而此时, 我们又发现了一个微任务setTimeout2, 所以, 它会被放到本轮宏任务后面

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e8becd048e5842d2be06a077e9865351~tplv-k3u1fbpfcp-zoom-1.image)

9.  我们执行完setTimeout1 之后, 就开始执行微任务setTimeout2, 打印出promise2-setTimeout2. 而我们又发现了一个宏任务setTimeout3, 由于是0s, 所以其回调又被放到了最后,所以, 刚执行完setTimeout2之后, 任务队列如下:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/85e2f06a8c3146f6b68bb387c60c1632~tplv-k3u1fbpfcp-zoom-1.image)

10. 好了, 总结下, 执行完inner的timeout, setTimeout1, setTimeout2 之后 , 我们新打印出了: timeout, promise2-setTimeout1, promise2-setTimeout2, 并得到了一个setTimeout3宏任务, 而outer的timeout, setTimeout1, setTimeout2 肯定也会产生相同的数据, 也会在任务队列最后放置一个setTimeout3宏任务! 所以我们又新打印出:timeout, promise2-setTimeout1, promise2-setTimeout2, timeout, promise2-setTimeout1, promise2-setTimeout2, 此时我们的任务队列还剩下:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/24720f12a53944a291528408e5c8b1be~tplv-k3u1fbpfcp-zoom-1.image)

11. 到目前为止, 我们的任务队列, 就剩下俩宏任务了, 不过这次它们内部, 没有什么别的任务了, 只是打印promise2-setTimeout3; 因此, 我们最终打印出来的结果为: 1,2, promise1, promise2, mutation, 1,2, promise1, promise2, mutation, timeout, promise2-setTimeout1, promise2-setTimeout2, timeout, promise2-setTimeout1, promise2-setTimeout2, promise2-setTimeout3, promise2-setTimeout3;

总结: 经过前面仔细的分析, 其实我们发现了, 任务队列的放置原则就是: 微任务按执行顺序放在本轮宏任务后面, 宏任务按照执行顺序放在任务队列的最后!

#### 关于宏任务的一点思考

我们通过上面的学习, 知道了宏任务容易收到页面渲染等因素的影响, 所以, 可以说是不太稳定的一个api, 大家如果面对一些需要精确把控同时又具有长时间运行的场景, 我觉得宏任务还是不太合适的, 例如, 我们要在页面上显示当前的时间, 精确到秒那种, 大家想想该怎么写? 按照常规做法, 我们可能会

"
setInterval(() => {
  ...
  let date = new Date()
  ...
}, 1000)
"

但是大家觉得这样操作合适吗? 时间确定会很精确地1秒1秒跳动吗? 答案是很难保证, 因为我们知道, 我们这个所谓的1000ms, 会收到很多因素影响, 所以, 当我们用在电脑/手机上的时候, 只要事件队列中的事件多了,或者渲染任务多了, 时间一久, 页面可能就不会太顺畅! 所以这时候, 就推荐使用requestanimationframe会更加稳妥些.

## NODE事件循环

介绍完了浏览器的事件循环, 接下来,我们要介绍Nodejs的事件循环, 说到这里, 我要事先说清楚, 所以的两者区别, 是在nodejs11以下才有区别! nodejs11之后, nodejs和浏览器的事件循环, 已经一致了!

### 基本流程

虽说nodejs11和浏览器一样了, 但是它们底层处理事件的机制, 仍然是不同的, 我们来看下nodejs 执行事件的一个循环规则, 在nodejs中, 同步任务和浏览器一样, 都是自上而下执行, 这个没什么多说的, 但是, 到了异步任务的阶段, nodejs会将异步任务交给libuv(一个事件驱动的跨平台抽象层)来处理, 它将所有事件分为了6中类型, 反复去执行, 直到所有事件执行完毕!

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4f265462a56b407488719a31a470c4a3~tplv-k3u1fbpfcp-zoom-1.image)

1.  timers, 这个阶段, 主要是处理setTimeout和setInterval等的回调
1.  pending callbacks, 处理上个阶段未执行的IO回调
1.  idle, prepare, 仅node内部使用.
1.  poll, 本阶段为首先进入的阶段, 也是最复杂的阶段, 其主要职责是获取新的IO事件执行与IO相关的回调. 其判断如下:


5.  如果设定了timers, 而且poll为空, 则会看timesr是否到期, 到期了则跳转到timers去执行.
-  如果没有设定tiemrs, 则看poll是否为空


   - 如果poll为空, 则看是否有设定setImmediate, 如果有则进入check阶段,执行setImmediate; 如果没有设定setImmediate, 则会等待回调被加入并执行
   - 如果poll不为空, 则继续循环执行队列.


5.  check阶段, 执行setImmediate的回调
5.  close callbacks, 执行socket关闭事件



### 任务类型

#### 基本概念

nodejs的任务类型, 也可以分为宏任务和微任务, 但是, 和浏览器稍有不同, 毕竟, nodejs不需要处理什么节点所以肯定没有MutationObserver这类和DOM节点有关的api.

**宏任务: 整体代码, setTimeout, setImmediate, setInterval, I/O**

**微任务: Promise, process.nextTick**

#### 任务处理规则

在介绍规则之前,我们先来看看以下这个简单的案例(相比于之前的案例,这个已经非常简单了)


console.log('start')
setTimeout(() => {
  console.log('timeout1')
  Promise.resolve().then(_ => {
    console.log('promise1')
  })
})
setTimeout(() => {
  console.log('timeout2')
  Promise.resolve().then(_ => {
    console.log('promise2')
  })
})

console.log('end')


如果是浏览器环境下, 现在我们应该能很轻松得出:start, end, timeout1, promise1, timeout2, promise2.

但是, 如果在nodejs11以下呢? 我们的结果却为:


start
end
timeout1
timeout2
promise1
promise2


为何会如此呢? 原因如下:

1.  start, end就不用说了, 这是最好理解的, 同步任务, 必然先执行
1.  timeout1, timeout2呢, 这是因为两者都是在timers阶段执行的, 所以就会被统一同时处理了
1.  promise1, promise2都是微任务, 而在这个环境下,微任务都在各个阶段结束后执行, 而非我们浏览器中, 宏任务执行之后马上执行微任务!

所以, 我们就可以总结出了, 在NodeJs11以下的环境中, 严格来讲, 不太侧重所谓的宏任务微任务的区分, 而是侧重于不同阶段任务类型的划分: 两个setTimeout都是同一类事件, 而又都在timers阶段, 那就统一处理了, 而不会等待到下一次循环; 而微任务也不会紧贴自己所属的宏任务之后, 而是在一个阶段过后, 才执行.

#### '规则破坏者'process.nextTick

我们刚才介绍了各种规则, 而各个任务都遵循着规则行事, 但是在nodejs当中, 有一个却是规则的破坏者, 它就是process.nextTick.


// node < 11.xx
console.log('start')
setTimeout(() => {
  console.log('timeout1')
  Promise.resolve().then(_ => {
    console.log('promise1')
  })
  process.nextTick(() => {
    console.log('next-tick')
  })
})
setTimeout(() => {
  console.log('timeout2')
  Promise.resolve().then(_ => {
    console.log('promise2')
  })
})

console.log('end')


大家能否猜出打印的结果呢?


start
end
timeout1
timeout2
next-tick
promise1
promise2


可以看到, next-tick直接出现在了第一阶段(timers阶段)的后面. 所以, 在nodejs11以前的版本中, process.nextTick将在下个阶段开始之前, 本阶段执行之后执行. 那么, 在nodejs11之后呢?


start
end
timeout1
next-tick
promise1
timeout2
promise2


可以看出 , 当我们的nodejs版本提升到11之后, 由于此时, nodejs的事件处理顺序已经和浏览器一致, 所以, 此时的process.nextTick就变成了, 在本轮任务(无论是宏任务还是微任务)结束之后, 才执行.`