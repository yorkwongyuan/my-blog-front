<style lang="scss">
html, body {
  height: 100%;
}
#app {
  height: 100%;
  width: 100%;
  display:flex;
  flex-direction: column;
  .app-main {
    flex: 1;
  }
  .app-footer {
    text-align: center;
    height: 48px;
    line-height: 48px;
    color: #555;
    cursor: pointer;
  }
}
</style>
<template>
  <div id="app">
    <div class="app-main">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
// import headerBar from '@components/layout/header.vue'
import "@assets/css/reset.css";
export default {
  name: 'App',
  methods: {
  },
  components: {
    // headerBar
  }
}
</script>
