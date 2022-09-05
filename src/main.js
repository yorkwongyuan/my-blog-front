import Vue from 'vue'
import App from './App.vue'
import router from './router'
import hl from 'highlight.js' // 导入代码高亮文件
import 'highlight.js/styles/a11y-dark.css' // 导入代码高亮样式
import { registerMicroApps, start, initGlobalState } from 'qiankun'
import microApps from './micro-app'

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

const actions = initGlobalState({
  name: 'jack'
})
actions.onGlobalStateChange((state, prev) => {
  console.log('🚀 ~ file: main.js ~ line 27 ~ actions.onGlobalStateChange ~ state, prev', state, prev)
})
setTimeout(() => {
  actions.setGlobalState({
    name: 'york'
  });
}, 1000)
registerMicroApps(microApps, {
  beforeLoad: app => {
    console.log('beforeLoad app name ---> ', app.name)
  },
  beforeMount: [
    app => {
      console.log('beforeMount app name ---> ', app.name)
    }
  ],
  afterMount: [
    app => {
      console.log('afterMount app name ---> ', app.name)
    }
  ],
  afterUnmount: [
    app => {
      console.log('afterUnmount app name ---> ', app.name)
    }
  ]
})

start()