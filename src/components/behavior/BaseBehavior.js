module.exports = Behavior({
  behaviors: [],
  properties: {},
  data: {
    animateCss: null,
    visible: true
  },
  methods: {
    isFunction(fn) {
      let r = false
      if (fn && fn instanceof Function) {
        r = true
      }
      return r
    },
    isObject(obj) {
      let r = false
      if (obj && obj instanceof Object) {
        r = true
      }
      return r
    },
    isArray(arr) {
      let r = false
      if (arr && Array.isArray(arr)) {
        r = true
      }
      return r
    },
    isArrayNotNull(arr) {
      let r = false
      if (arr && Array.isArray(arr) && arr.length > 0) {
        r = true
      }
      return r
    },
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
    },
    emit(name, params, option) {
      let myEventDetail = params || {} // detail对象，提供给事件监听函数
      let myEventOption = option || {} // 触发事件的选项
      this.triggerEvent(name, myEventDetail, myEventOption)
    },
    /**
     * 设置元素显示
     */
    setVisible() {
      let className = `wux-animate--fade-in`
      this.setData({
        animateCss: className,
        visible: true
      })
    },
    /**
     * 设置元素隐藏
     * @param className
     * @param timer
     */
    setHidden(className = `wux-animate--fade-out`, timer = 300) {
      this.setData({
        animateCss: className,
      })
      setTimeout(() => {
        this.setData({
          visible: false
        })
      }, timer)
    }
  }
})
