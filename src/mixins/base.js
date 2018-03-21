import wepy from 'wepy'

export default class BaseMixin extends wepy.mixin {
  data = {
    statusBarHeight: 0,
    mixin: 'This is mixin data.'
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
}
