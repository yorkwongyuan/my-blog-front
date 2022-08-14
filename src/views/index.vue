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
}
</style>
<template>
  <div class="index-page">
    <header-part></header-part>
    <div class="index-page__main"></div>
     <div class="app-footer" @click="linkToGov">
      粤ICP备2022090698号-1
    </div>
  </div>
</template>
<script>
import headerPart from '@components/layout/header.vue'
export default {
  name: "index-page",
  components: {
    headerPart
  },
  methods: {
    linkToGov () {
      window.open('https://beian.miit.gov.cn')
    }
  }
}
</script>
