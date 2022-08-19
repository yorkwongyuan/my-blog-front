<style lang="scss">
@import "@scss/custom-theme/mixins/mixin.scss";
@include b(blog-lists) {
  height: 100%;
  overflow: hidden;
  background-color: #f0f0f0;
  background-image: linear-gradient(90deg,rgba(50,0,0,.05) 3%,transparent 0),linear-gradient(1turn,rgba(50,0,0,.05) 3%,transparent 0);
  background-position: 50%;
  background-size: 20px 20px;
  @include e(main) {
    padding-top: 8px;
    width: 600px;
    display: block;
    margin: 0 auto;
  }
  @include e(card) {
    padding: 8px 16px;
    width: 100%;
    height: 100px;
    border-radius: 4px;
    box-shadow: 1px 1px 5px rgb(0 0 0 / 50%);
    background-color: white;
    cursor: pointer;
    margin-bottom: 16px;
    transition: all .3s;
    &:hover {
      transform: scale(1.1);
    }
  }
  @include e(desc) {
    margin-top: 8px;
    font-size: 14px;
    color: $--color-text;
    word-break: break-all;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2; /* 这里是超出几行省略 */
    overflow: hidden;
  }
}
</style>
<template>
  <div class="blog-lists">
    <main class="blog-lists__main">
      <div class="blog-lists__card" v-for="(item, index) in lists" :key="index" @click="handleLink(item.id)">
        <b>{{item.title}}</b>
        <div class="blog-lists__desc">
          {{item.desc}}
        </div>
      </div>
    </main>
  </div>
</template>
<script>
export default {
  name: "blog-lists",
  data () {
    return {
      lists: [{
        title: '事件循环',
        desc: '我们的javascript可以在浏览器环境中执行, 由于是单线程, 所以为了保证所有任务的有序进行, 就有了**事件循环,** 而不同环境, 事件循环的机制有所不同, 所以我们这里介绍的姑且说是浏览器的事件循环.',
        id: '001'
      }, {
        title: '一起来钻vue3工具函数的牛角尖吧',
        desc: '前阵子打开vue3的源码, 看到了shared目录下的一堆通用方法, 发现有些方法写得很好, 有些看上去‘很简单’, 其实多看几遍,发现, 是我自己很简单, 只要钻下牛角尖, 就能发现些什么,归根到底还是自己之前很多技术细节没有深究到位, 因此, 决定写一篇文章做一下总结!',
        id: '002'
      }, {
        title: 'ssh 修改默认端口号/免密钥登录小记',
        desc: '买了台腾讯云服务器, 发现登录默认端口都是22, 每次登录都要输入密码, 怪不爽的, 于是决定针对这两点, 进行一下优化: 改掉22默认端口, 实现免密登录!',
        id: '003'
      }, {
        title: 'vue3源码学习--如何发布代码',
        desc: '本文主要总结了[vue3源码](https://github.com/vuejs/core)中, /scripts/release.js的实现逻辑和技术要点, 这部分代码主要负责vue3工程的发布, 其中功能点,简单来说就是**规范发布版本以及发布流程**. 能为我们自己开发一个类似的发布流程规范工具提供一些参考.',
        id: '004'
      }]
    }
  },
  methods: {
    handleLink (id) {
      this.$router.push({
        path: '/blog/detail',
        query: {
          id
        }
      })
    }
  }
}
</script>
