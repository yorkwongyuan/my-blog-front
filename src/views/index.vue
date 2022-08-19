<style lang="scss">
@import "@scss/custom-theme/mixins/mixin.scss";
@include b(index-page) {
  height: 100%;
  display:flex;
  flex-direction: column;
  background-image: url(../assets/imgs/index-bg.jpeg);
  @include e(main) {
    flex: 1;
  }
  @include e(menus) {
    border-radius: 10px;
    display: flex;
    flex-wrap: wrap;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    height: 400px;
    background: rgba(255, 255, 255, .5);
    // border-radius: 8px;
    backdrop-filter: blur(6px);
    overflow: hidden;
  }
  @include e(menu) {
    width: 50%;
    height: 50%;
    cursor: pointer;
    text-align: center;
    line-height: 200px;
    transition: all .3s;
    &:hover {
      color: $--color-primary;
      background-color: rgb(48, 207, 185);
      transform: scale(1.2);
    }
  }
  @include e(footer) {
    display: flex;
    align-content: center;
    justify-content: center;
  }
}
</style>
<template>
  <div class="index-page">
    <header-part></header-part>
    <div class="index-page__main">
      <div class="index-page__menus">
        <div class="index-page__menu" @click="link(item)" v-for="(item, index) in menus" :key="index">
          {{item.title}}
        </div>
      </div>
    </div>
     <div class="index-page__footer">
      <ICP />
      <beian />
    </div>
  </div>
</template>
<script>
import headerPart from '@components/layout/header.vue'
import ICP from '@components/gov-about/ICP.vue'
import beian from '@components/gov-about/beian.vue'
export default {
  name: "index-page",
  data () {
    return {
      menus: [
        {title: '技术', url: '/blog/lists'},
        {title: '开源', url: '/open-source/index'},
        {title: '相关网站', url: '/tool'},
        {title: '关于', url: '/aboutme'},
      ]
    }
  },
  components: {
    headerPart,
    ICP,
    beian
  },
  methods: {
    link (item) {
      this.$router.push(item.url)
    }
  }
}
</script>
