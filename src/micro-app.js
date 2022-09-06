const microApps = [
  {
    name: 'sub-vue',
    entry: process.env.NODE_ENV === 'production' ? 'http://119.91.228.12:9661' : '//localhost:7788/',
    container: '#container', // 子应用挂在节点
    activeRule: '/sub-vue',
    props: {
      routerBase: '/sub-vue'
    }
  },
  {
    name: 'sub-react',
    entry: '//localhost:7789/',
    container: '#container', // 子应用挂在节点
    activeRule: '/sub-react',
    props: {
      routerBase: '/sub-react'
    }
  }
]

export default microApps