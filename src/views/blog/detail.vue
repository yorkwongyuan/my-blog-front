<style lang="scss">
@import "@scss/custom-theme/mixins/mixin.scss";
@include b(blog-detail) {
  height: 100%;
  overflow: hidden;
  background-color: #f0f0f0;
  background-image: linear-gradient(90deg,rgba(50,0,0,.05) 3%,transparent 0),linear-gradient(1turn,rgba(50,0,0,.05) 3%,transparent 0);
  background-position: 50%;
  background-size: 20px 20px;
  background-attachment: fixed;
  @include e(main) {
    padding: 16px;
    padding-top: 8px;
    width: 60vw;
    display: block;
    margin: 0 auto;
    overflow-y: auto;
    height: 100%;
    background: rgba(255, 255, 255, .3);
  }
}
</style>
<template>
  <div class="blog-detail">
    <main class="blog-detail__main">
      <div v-html="content"></div>
    </main>
  </div>
</template>
<script>
import MarkdownIt from 'markdown-it'
export default {
  name: 'blog-detail',
  data () {
    return {
      content: ''
    }
  },
  async mounted () {
    let content = await import(`./${this.$route.query.id}.js`)
    let md = new MarkdownIt()
    this.content = md.render(content.default)
  }
}
</script>
