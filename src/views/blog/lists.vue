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
    cursor: pointer;
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
