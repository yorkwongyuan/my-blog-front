const { defineConfig } = require('@vue/cli-service')
const path = require('path')
function resolve (dir) {
  return path.join(__dirname, dir)
}
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config.resolve.alias
      .set('@components', resolve('./src/components'))
      .set('vue$', 'vue/dist/vue.esm.js')
      .set('@assets', resolve('./src/assets'))
      .set('@', resolve('./src'))
      .set('@base', resolve('./src/base'))
      .set('@scss', resolve('./src/assets/css'))
      .set('@JS', resolve('./src/base/JS'))
      .set('public', resolve('./public')).end()
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end();
    config.plugin('html')
      .tap(args => {
        args[0].title = '前端技术'
        return args
      })
    if (process.env.NODE_ENV === 'development') {
      // config.devServer
      //   .set('proxy', dev.proxyTable)
    }
  },
})
