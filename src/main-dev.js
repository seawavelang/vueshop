import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'

import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//axios请求拦截器
axios.interceptors.request.use(function(config){
  Nprogress.start()
  // 在向服务器发送请求之前对请求进行预处理
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // console.log(config)
  return config;
},function(error){
  console.log(error)
})

//axios响应拦截器
axios.interceptors.response.use(function(config){
  Nprogress.done()
  return config;
},function(error){
  console.log(error)
})

// 将axios挂载到Vue构造函数的原型对象上，这样其他的组件都可以使用axios
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

// 自定义指令实现input自动获取焦点
Vue.directive('focus', {
  inserted(el) {
    console.log(el)
    el.querySelector('input').focus()
  }
}),

// 处理时间
Vue.filter('dateformat', function(str) {
  var date = new Date(str *1000)
  var y = date.getFullYear()
  var mm = date.getMonth() + 1
  var d = date.getDate()
  var h = date.getHours()
  var m = date.getMinutes()
  var s = date.getSeconds()
  return `${y}-${mm}-${d} ${h}:${m}:${s}`
})

import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

