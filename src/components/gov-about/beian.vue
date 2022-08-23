<style lang="scss">
@import "@scss/custom-theme/mixins/mixin.scss";
@include b(beian) {
  display: flex;
  align-items: center;
  @include e(img) {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
  @include e(link) {
    color: $--color-text;
    &:hover {
      color: $--color-primary;
    }
  }
}
</style>
<template>
  <div class="beian">
    <img class="beian__img" src="./imgs/备案图标.png" alt="图案" />
    <div style="width:300px;margin:0 auto; padding:20px 0;">
      <a class="beian__link" target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=44011302003676" style="display:inline-block;text-decoration:none;height:20px;line-height:20px;">
        <p style="float:left;height:20px;line-height:20px;margin: 0px 0px 0px 5px;">
          粤公网安备 44011302003676号</p>
      </a>
    </div>  
  </div>
</template>
<script>
  export default {
    name: 'beian-page'
  }
</script>

