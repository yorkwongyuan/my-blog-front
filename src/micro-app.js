const microApps = [
  {
    name: 'sub-vue',
    entry: '//localhost:7788/',
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