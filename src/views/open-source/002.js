export default `
# 移动端前端组件库
[npm文档](https://www.npmjs.com/package/mwp-ui)
## 安装
通过npm安装
- npm install mwp-ui
引入
## 全局引入
- import Vue from 'vue';
- import mwpUi from 'mwp-ui'
- import 'mwp-ui/lib/styles/mwp-ui.css'
- Vue.use(mwpUi)
## 按需引入

- import Photo from 'mwp-ui/lib/photo'
- import 'mwp-ui/lib/styles/photo.css'

**'如果嫌麻烦,可以使用 babel-plugin-component插件进行配置将其简化。'**

'首先需要安装 babel-plugin-component'

- 'npm i babel-plugin-component -D'
'然后需要在.babelrc文件中加入配置'

"plugins": [
  ...
  [
    "component",
    {
      "libraryName": "mwp-ui",
      "styleLibrary": {
        "name": "styles",
        "base": false
      }
    }
  ]
  ...
]


此时的引入方式可以改为:

- import { Button } from 'mwp-ui'
- Vue.component(Button.name, Button)
或者在sfc文件中按常规方式引入

- import {Button} from 'mwp-ui'

...
components: {
  Button
}
...`