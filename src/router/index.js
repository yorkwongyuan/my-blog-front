import VueRouter from 'vue-router'
import Vue from 'vue'
const routes = [
  {
    path: '/',
    redirect: '/index'
  },
  {
    path: '/index',
    name: 'index',
    component: (resolve) => {
      require(['../views/index.vue'], resolve)
    }
  },
  {
    path: '/blog/lists',
    name: 'blogLists',
    component: (resolve) => {
      require(['../views/blog/lists.vue'], resolve)
    }
  },
  {
    path: '/blog/detail',
    name: 'blogDetail',
    component: (resolve) => {
      require(['../views/blog/detail.vue'], resolve)
    }
  }
]
Vue.use(VueRouter)
const router = new VueRouter({
  mode: 'hash',
  routes
})
console.log('🚀 ~ file: index.js ~ line 20 ~ router', router)
export default router