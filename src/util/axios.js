import axios from 'axios'

class Axios {
  constructor (baseURL) {
    this.baseURL = baseURL
  }
  getConfig () {
    return {
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      timeout: 10000
    }
  }
  request (options) {
    const instance = axios.create()
    const defaultConfig = this.getConfig()
    const config = {...defaultConfig, ...options}
    return instance(config)
  }
  get (url, config) {
    const options = {
      method: 'get',
      url,
      ...config
    }
    return this.request(options)
  }
  post (url, data) {
    const options = {
      method: 'post',
      url,
      data
    }
    return this.request(options)
  }
}

export default Axios