<style lang="scss">
@import "@scss/custom-theme/mixins/mixin.scss";
@include b(open-source) {
  background-image: url(../../assets/imgs/open-bg.jpeg);
  width: 100%;
  height: 100%;
  background-size: cover;
  @include e(menus){
    border-radius: 10px;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    background: rgba(255, 255, 255, .5);
    overflow: hidden;
  }
  @include e(menu) {
    height: 80px;
    line-height: 80px;
    text-align: center;
    display: block;
    cursor: pointer;
    backdrop-filter: blur(6px);
    transition: all .3s;
    &:hover {
      border: 1px solid white;
      backdrop-filter: blur(1px);
    }
  }
}
</style>
<template>
  <div class="open-source">
    <div class="open-source__menus">
      <div class="open-source__menu" @click="link(item)" v-for="(item, index) in menus" :key="index">
        {{item.title}}
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "open-source",
  data () {
    return {
      menus: [
        {title: 'web组件库', url: '/open-source/detail', id: '001'},
        {title: '移动端组件库', url: '/open-source/detail', id: '002'}
      ]
    }
  },
  components: {},
  methods: {
    link (item) {
      this.$router.push({
        path: item.url,
        query: {
          id: item.id
        }
      })
    }
  }
}
</script>
