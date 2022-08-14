import Vue from 'vue'
import App from './App.vue'
import router from './router'
import hl from 'highlight.js' // 导入代码高亮文件
import 'highlight.js/styles/a11y-dark.css' // 导入代码高亮样式

// 自定义一个代码高亮指令
Vue.directive('highlight', function (el) {
  const blocks = el.querySelectorAll('pre code')
  blocks.forEach((block) => {
    hl.highlightBlock(block)
  })
})

Vue.config.productionTip = false
new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
