<template>
  <div class="copy-code-container">
    <div class="copy-container flex-row">
      <template slot="title"> 复制代码 </template>
      <div class="ant-btn" @click="handleCopy(code, $event)"> <span type="copy"></span></div>

      <template slot="title"> 显示代码 </template>
      <span @click="handeShowCode" type="code"></span>
    </div>

    <div class="code-palce-container" :class="{ 'show-code': showCode }">
      <div class="code-box" v-highlight>
        <pre>
          <code :class="lang">{{code}}</code>
        </pre>
      </div>
    </div>
  </div>
</template>

<script>
import clip from '@/utils/clipboard' // use clipboard directly

export default {
  name: 'code-component',
  data () {
    return {
      showCode: false
    }
  },
  props: {
    code: {
      type: String,
      default: ''
    },
    lang: {
      type: String,
      default: 'javascript'
    }
  },
  methods: {
    handeShowCode () {
      this.showCode = !this.showCode
    },
    handleCopy (text, event) {
      clip(text, event)
    }
  }
}
</script>

<style lang="less" scoped>
.copy-code-container {
  width: 100%;

  .copy-container {
    width: 100%;
    height: 50px;
    justify-content: center;
    align-items: center;
    position: relative;

    .ant-btn{
      width: 58px;
      height: 38px;
      margin: 0;
      border: none;
      box-shadow: none;
      background-color: transparent;
      padding: 0;
    }

    i {
      cursor: pointer;
      font-size: 18px;
      padding: 10px 20px;
    }
  }

  .code-palce-container {
    width: 100%;
    height: 0;
    overflow: hidden;
    transition: all linear 0.1s;

    &.show-code {
      height: 100%;
    }

    .code-box {
      ::v-deep .hljs {
        padding: 0 20px;
        line-height: 25px;
      }
    }
  }
}
</style>
