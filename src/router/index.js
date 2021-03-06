import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const Login = () => import('components/Login.vue')
const Home = () => import('components/Home.vue')
const Welcome = () => import('components/HomeChilds/Welcome.vue')
const Users = () => import('views/Users/Users.vue')
const Rights = () => import('views/Power/Rights.vue')
const Roles = () => import('views/Power/Roles.vue')
const Cate = () => import('views/Goods/Cate.vue')
const Params = () => import('views/Goods/Params.vue')
const List = () => import('views/Goods/List.vue')
const Add = () => import('views/Goods/Add.vue')
const Order = () => import('views/Order/Order.vue')
const Report = () => import('views/Report/Report.vue')

const routes = [
  { path: '/login', component: Login },
  { path: '/', redirect: '/login' },
  {
    path: '/home',
    component: Home,
    // 进到home，就显示welcome界面
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 路由导航守卫
// 防止不登录直接访问后台页面
router.beforeEach((to, from, next) => {
  //console.log(to.path);
  // to是将要去的路径
  // from是从哪来的路径
  // next是放行，如果里面有参数在，则是强制跳转到参数的路径
  // 如果将要去的是login则允许
  if (to.path === '/login') {
    return next()
  }
  const token = window.sessionStorage.getItem('token')
  // 如果没有token，则强制跳转到login界面
  if (!token) {
    return next('/login')
  }
  // 有token,放行
  next()
})

export default router
