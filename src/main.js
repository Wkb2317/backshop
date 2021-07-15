import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import '@/network/axios.js'
// 引入element自定义组件
import '@/plugins/element.js'
// 引入字体图标
import 'assets/font/iconfont.css'
// 初始化
import('assets/css/base.css')

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
