import Axios from './axios'
import config from '../config/index'
const baseURL = process.env.NODE_ENV === 'production' ? config.baseURL.prod : config.baseURL.dev
const axiosRequest = new Axios(baseURL)

export default axiosRequest
