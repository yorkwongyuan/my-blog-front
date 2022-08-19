<style lang="scss">
@import "@scss/custom-theme/mixins/mixin.scss";
@include b(ICP) {
  display: flex;
  align-items: center;
  color: $--color-text;
  margin-right: 20px;
  cursor: pointer;
  &:hover {
    color: $--color-primary;
  }
}
</style>
<template>
  <div class="ICP" @click="linkToGov">
    粤ICP备2022090698号-1
  </div>  
</template>
<script>
  export default {
    name: 'ICP-page',
    methods: {
      linkToGov () {
        window.open('https://beian.miit.gov.cn')
      }
    }
  }
</script>

