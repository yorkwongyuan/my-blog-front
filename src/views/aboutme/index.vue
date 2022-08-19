<style lang="scss">
@import "@scss/custom-theme/mixins/mixin.scss";
@include b(aboutme) {
  width: 100%;
  height: 100%;
  background-size: cover;
  @include e(text){
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 30px;
    &::after{
      content: '|';
      animation: blink 1s infinite
    }
  }
  @keyframes blink{
    from{
        opacity: 0;
    }
    to{
        opacity: 1;
    }
  }
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
  <div class="aboutme">
    <div class="aboutme__text">

    </div>
  </div>
</template>
<script>
// import Pinyin from 'pinyin'
export default {
  name: "aboutme-page",
  data () {
    return {
      menus: [],
      index: 0
    }
  },
  components: {},
  methods: {
    write () {
      const dom = document.querySelector('.aboutme__text')
      const text = '本网站主要用于技术分享, 包括前端/后端等技术栈, 且会不断进行完善😄, 并严格遵守国家法律法规!'
      const arr = text.split('')
      function writing () {
          if (this.index < arr.length) {
              dom.innerHTML += arr[this.index]
              setTimeout(writing.bind(this), 200, ++this.index)
          }
      }
      writing.call(this)
    }
  },
  mounted () {
    this.write()
  }
}
</script>
