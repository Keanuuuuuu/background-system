import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

// const whiteList = ['/login'] // no redirect whitelist 白名单。不需要权限可以访问的页面

// beforeEach路由前置守卫
router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // 获取本地用户信息
  const hasGetUserInfo = store.getters.users
  const hasToken = localStorage.getItem('adminToken')

  if(to.meta.auth){
    // 进入到这里说明此页面需要权限
    if(hasGetUserInfo){
      next()
    }else{

      if(hasToken){
        // 有token需要验证token是否有效

        try{
          await store.dispatch('user/getInfo')
          next()
        }catch(error){
          await store.dispatch('user/resetToken')
          Message.error('登录已过期，请重新登录')
          next({ path: `/login?redirect=${to.path}`})
          NProgress.done()// ele进度条走完
        }

      }else{
        next({ path: `/login?redirect=${to.path}`})
        NProgress.done()// ele进度条走完
      }

    }

  }else{
    // 这里说明不需要鉴权
    if(to.path === '/login' && hasGetUserInfo){
      // 如果去login但是又有用户信息，说明是已经登录状态企图再次登录，那就直接导航到首页，b站是这样做的
      next({ path: '/'})

    }else{
      next()
    }
    NProgress.done()// ele进度条走完
  }


  // 下方是Vue-element-admin原本的鉴权流程

  // if (hasToken) {
  //   if (to.path === '/login') {
  //     // if is logged in, redirect to the home page
  //     next({ path: '/' })
  //     NProgress.done()
  //   } else {
  //     // 说明进入的不是login，看一下是否有用户信息，对应我们之前Vuex的user字段
  //     const hasGetUserInfo = store.getters.name
  //     if (hasGetUserInfo) {
  //       next()
  //     } else {
  //       // 进到这里说明没有存储用户信息user，但是却有token，那么我们就使用loaclStorage的token去服务器拿用户信息user
  //       try {
  //         // get user info
  //         await store.dispatch('user/getInfo')

  //         next()
  //       } catch (error) {
  //         // 进入到这里说明token有问题（过期、篡改等），那就重置token，重新登录
  //         // remove token and go to login page to re-login
  //         await store.dispatch('user/resetToken')
  //         Message.error(error || 'Has Error')
  //         next(`/login?redirect=${to.path}`)
  //         NProgress.done()
  //       }
  //     }
  //   }
  // } else {
  //   /* has no token*/

  //   if (whiteList.indexOf(to.path) !== -1) {
  //     // 判断是去往白名单内容的页面
  //     next()
  //   } else {
  //     // 去不在白名单内地页面
  //     // 那就导航到登录页面
  //     next(`/login?redirect=${to.path}`)
  //     NProgress.done()
  //   }
  // }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
