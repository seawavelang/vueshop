import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/user/Users.vue'
import Rights from './components/power/Rights.vue'
import Roles from './components/power/Roles.vue'
import Cate from './components/goods/Cate.vue'
import Params from './components/goods/Params.vue'
import Goods from './components/goods/Goods.vue'
import Add from './components/goods/Add.vue'
import Orders from './components/orders/Orders.vue'
// import Reports from './components/report/Reports.vue'

Vue.use(Router)

const route = new Router({
  routes: [
    {path: '/', redirect: '/login'},
    {path: '/login', component: Login},
    {path: '/home', component: Home, redirect: '/welcome', children: [
      {path: '/welcome', component: Welcome},
      {path: '/users', component: Users},
      {path: '/rights', component: Rights},
      {path: '/roles', component: Roles},
      {path: '/categories', component: Cate},
      {path: '/params', component: Params},
      {path: '/goods', component: Goods},
      {path: '/goods/add', component: Add, name: 'Add'},
      {path: '/orders', component: Orders},
      {path: '/reports', component: () => import('./components/report/Reports.vue')}
    ]}
  ]
})

// 路由导航守卫 beforeEach
route.beforeEach((to, from, next) => {
  if(to.path == '/login') {
    next()
    return
  }
  const tokenStr = window.sessionStorage.getItem('token')
  // console.log(tokenStr)
  if(!tokenStr) {
    next('/login')
    return
  }
  next()
})
export default route
