import axios from 'axios'
import Vue from 'vue'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 设置拦截器
// 请求拦截器
axios.interceptors.request.use(config => {
  // console.log(config)
  // 设置携带token
  config.headers.Authorization = window.sessionStorage.getItem('token')

  return config
})

Vue.prototype.$http = axios
