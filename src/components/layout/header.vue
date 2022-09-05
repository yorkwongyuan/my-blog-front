<style lang="scss">
@import "@scss/custom-theme/mixins/mixin.scss";
@include b(header) {
  display: flex;
  height: 48px;
  width: 100%;
  background-color: rgba(255,255,255,.6);
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  @include e(item) {
    position: relative;
    cursor: pointer;
    margin-left: 8px;
    &:after {
      transition: all .3s;
      left: 50%;
      transform: translateX(-50%);
      bottom: -2px;
      position: absolute;
      content: "";
      background-color: $--color-primary;
      height: 3px;
      width: 0%;
    }
    &:hover {
      color: $--color-primary;
      &:after {
        width: 100%;
      }
    }
  }
  @include e(left) {
    // color: #fff;
    color: black;
    // text-shadow: 
    //   0 0 10px #0ebeff,
    //   0 0 20px #0ebeff,
    //   0 0 50px #0ebeff,
    //   0 0 100px #0ebeff,
    //   0 0 200px #0ebeff
  }
  @include e(right) {
    display: flex;
  }
}
</style>
<template>
  <div class="header">
    <div class="header__left">
      计算机知识学习
    </div>
    <div class="header__right">
      <div class="header__item" @click="toVue">vue</div>
      <div class="header__item" @click="toReact">react</div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'header-part',
  methods: {
    toVue () {
      this.$router.push('/sub-vue')
    },
    toReact () {
      this.$router.push('/sub-react')
    }
  }
}
</script>
