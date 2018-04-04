import wepy from 'wepy'
import {twCallBeanPromise, twFormatGetFileCallBeanUri} from '../utils/twmodule'

export default class BaseMixin extends wepy.mixin {
  data = {
    statusBarHeight: 0,
    sysFontSize: 16,
    mixin: 'This is mixin data.',
    pageSize: 20,
    defaultHeaderPhoto: '/assets/av1.png',
    decode: {
      nbsp: '&nbsp;',
      lt: '&lt;',
      gt: '&gt;',
      amp: '&amp;',
      apos: '&apos;',
      ensp: '&ensp;',
      emsp: '&emsp;'

    }
  }
  methods = {
    tap() {
      this.mixin = 'mixin data was changed'
    }
  }

  onShow() {
  }

  onLoad() {
    if (this.$parent.globalData.systemInfo.statusbarHeight) {
      this.statusBarHeight = this.$parent.globalData.systemInfo.statusbarHeight
    }
    if (this.$parent.globalData.systemInfo.fontSizeSetting) {
      this.sysFontSize = this.$parent.globalData.systemInfo.fontSizeSetting
    }
  }

  loadPage(url) {
    wepy.navigateTo({
      url: url
    })
  }

  loadTabPage(url) {
    wepy.switchTab({
      url: url
    })
  }

  backPage(delta) {
    wepy.navigateBack({
      delta: delta
    })
  }

  isArrayNotNull(arr) {
    let r = false
    if (arr && Array.isArray(arr) && arr.length > 0) {
      r = true
    }
    return r
  }

  isFunction(fn) {
    let r = false
    if (fn && fn instanceof Function) {
      r = true
    }
    return r
  }

  isObject(obj) {
    let r = false
    if (obj && obj instanceof Object) {
      r = true
    }
    return r
  }

  isArray(arr) {
    let r = false
    if (arr && Array.isArray(arr)) {
      r = true
    }
    return r
  }

  each(obj, callback) {
    if (this.isArrayNotNull(obj)) {
      for (let i = 0, len = obj.length; i < len; i++) {
        if (this.isFunction(callback)) {
          callback(obj[i], i)
        }
      }
    } else if (this.isObject(obj)) {
      let keys = Object.keys(obj)
      if (this.isArrayNotNull(keys)) {
        for (let i = 0, len = keys.length; i < len; i++) {
          if (this.isFunction(callback)) {
            callback(obj[keys[i]], keys[i])
          }
        }
      }
    }
  }

  concat(srcArr, ...distArr) {
    if (this.isArray(srcArr)) {
      if (this.isArray(distArr)) {
        let r = srcArr
        this.each(distArr, (value, i) => {
          if (this.isArray(value)) {
            r = r.concat(value)
          }
        })
        return r
      } else {
        return srcArr
      }
    } else {
      return []
    }
  }

  getSysUserInfo(accounts) {
    return new Promise((resolve) => {
      if (this.isArrayNotNull(accounts)) {
        let accountMap = {}
        let calls = []
        var keys = []
        this.each(accounts, (v, i) => {
          if (!this.$parent.globalData.sysUserMap[v] && v && v.length > 0) {
            accountMap[v] = v
          }
        })
        this.each(accountMap, function (value, key) {
          calls.push(twCallBeanPromise('du.useraccount.getuitem', {account: value}))
          keys.push(key)
        })
        if (this.isArrayNotNull(calls)) {
          Promise.all(calls).then((rets) => {
            if (this.isArrayNotNull(rets)) {
              this.each(rets, (v, i) => {
                let userObj = v.beanparam.data
                if (userObj.id) {
                  let src = twFormatGetFileCallBeanUri('config.user.head.get', {
                    id: userObj.id,
                    'isattach': false
                  })
                  let temp = {
                    id: userObj.id,
                    headerPhoto: src,
                    name: userObj.name,
                    accounts: userObj.accounts || [],
                    obj: userObj
                  }
                  this.$parent.globalData.sysUserMap[keys[i]] = temp
                  this.$parent.globalData.sysUserMap[temp.id] = temp
                }
              })
            }
            resolve(this.$parent.globalData.sysUserMap)
          })
        } else {
          resolve(this.$parent.globalData.sysUserMap)
        }
      } else {
        resolve(this.$parent.globalData.sysUserMap)
      }
    })
  }

  getSysUserInfoById(ids) {
    return new Promise((resolve) => {
      if (this.isArrayNotNull(ids)) {
        let accountMap = {}
        let calls = []
        this.each(ids, (v, i) => {
          if (!this.$parent.globalData.sysUserMap[v] && v && v.length > 0) {
            accountMap[v] = v
          }
        })
        this.each(accountMap, function (value, key) {
          calls.push(twCallBeanPromise('du.useraccount.getuitem', {id: value}))
        })
        if (this.isArrayNotNull(calls)) {
          Promise.all(calls).then((rets) => {
            if (this.isArrayNotNull(rets)) {
              this.each(rets, (v, i) => {
                let userObj = v.beanparam.data
                if (userObj.id) {
                  let src = twFormatGetFileCallBeanUri('config.user.head.get', {
                    id: userObj.id,
                    'isattach': false
                  })
                  let temp = {
                    id: userObj.id,
                    headerPhoto: src,
                    name: userObj.name,
                    accounts: userObj.accounts || [],
                    obj: userObj
                  }
                  this.$parent.globalData.sysUserMap[temp.id] = temp
                  if (this.isArrayNotNull(temp.accounts)) {
                    this.each(temp.accounts, (a, j) => {
                      if (a && a.username && a.domain) {
                        this.$parent.globalData.sysUserMap[`${a.username}@${a.domain}`] = temp
                      }
                    })
                  }
                }
              })
            }
            resolve(this.$parent.globalData.sysUserMap)
          })
        } else {
          resolve(this.$parent.globalData.sysUserMap)
        }
      } else {
        resolve(this.$parent.globalData.sysUserMap)
      }
    })
  }
}
