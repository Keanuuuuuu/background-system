import { loginApi, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    // token: getToken(),
    name: '',
    avatar: 'https://avatars.githubusercontent.com/u/93373675?v=4',
    user: null
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  // SET_TOKEN: (state, token) => {
  //   state.token = token
  // },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_USER: (state, payload) => {
    state.user = payload
  }
}

const actions = {
  // 在Vuex的actions中去做请求，然后用commit触发mutations做状态转变
  // user login
  login({ commit }, userInfo) {
    // 第一个参数为Vuex中的固定参数，从中解构出commit，后续用于从actions中提交
    // 第二个参数为此次登录信息
    // console.log(userInfo);
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      // { username: username.trim(), password: password }
      loginApi(userInfo).then(response => {
        const { data } = response
        if(data){
          commit('SET_USER', data)
          // setToken(data.token)
          resolve()
        }else{
          reject(response)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
        const { data } = response

        // token可以的response会是一个用户信息的object
        if (typeof response === 'string') {
          // 为string类型说明未登录或token已经过期
          reject('Verification failed, please Login again.')
        }else{
          // 说明这个token可以，将用户信息存入Vuex
          commit('SET_USER', data)
        }

        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      removeToken() // must remove  token  first
      resetRouter()
      commit('RESET_STATE')
      resolve()
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

