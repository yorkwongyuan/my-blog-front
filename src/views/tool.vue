<style lang="scss">
@import "@scss/custom-theme/mixins/mixin.scss";
@include b(tool) {
  height: 100%;
  display:flex;
  flex-direction: column;
  background-image:linear-gradient(to right,#d276f1,rgb(0, 140, 255));
  @include e(menus){
    padding: 16px;
    background-color: $-color-geekBlue--4;
    border-radius: 10px;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    overflow: hidden;
  }
  @include e(item) {
    height: 80px;
    cursor: pointer;
    &:hover {
      color: $--color-primary;
      background-clip: text;
    }
  }
}
</style>
<template>
  <div class="tool">
    <div class="tool__menus">
      <div class="tool__item" v-for="(item, index) in lists" :key="index" @click="link(item.url)">
        <div class="tool__title">
          {{item.title}}
        </div>
        <div class="tool__desc">
          {{item.desc}}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "tool-page",
  data () {
    return {
      lists: [
        {
          title: 'vsCode',
          desc: '前端主要开发工具之一',
          url: 'https://code.visualstudio.com/'
        },
        {
          title: 'nextJs',
          desc: '一个用于 生产环境的React 框架',
          url: 'https://www.nextjs.cn/'
        },
        {
          title: 'antDesign',
          desc: '企业级产品设计体系，创造高效愉悦的工作体验',
          url: 'https://ant.design/index-cn'
        },
        {
          title: 'Photoshop',
          desc: '从 Photoshop 开始，惊艳随之而来​',
          url: 'https://www.adobe.com/cn/products/photoshop.html'
        }
      ]
    }
  },
  components: {
  },
  methods: {
    link (url) {
      window.open(url, '_blank')
    }
  }
}
</script>
