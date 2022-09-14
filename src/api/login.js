import axios from '@/util/request'

const login = async (params) => {
  return axios.post('/login/index', params)
}

export {
  login
}