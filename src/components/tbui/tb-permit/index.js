import BaseBehavior from '../../behavior/BaseBehavior'

Component({
  behaviors: [BaseBehavior],
  externalClasses: [],
  properties: {
    confirmText: {
      type: String,
      value: '确定'
    },
    cancelText: {
      type: String,
      value: '取消'
    },
    confirmColor: {
      type: String,
      value: '#49A9F2'
    },
    cancelColor: {
      type: String,
      value: '#666666'
    }
  },
  data: {
    password: '',
    dialogComponent: null,
    ok: null,
    cancel: null
  },
  methods: {
    show(ok, cancel) {
      const {dialogComponent} = this.data
      dialogComponent && dialogComponent.show()
      if (ok) {
        this.setData({
          ok: ok
        })
      }
      if (cancel) {
        this.setData({
          cancel: cancel
        })
      }
    },
    close(cancel) {
      const {dialogComponent} = this.data
      dialogComponent && dialogComponent.hide()
      this.clearInput()
    },
    onConfirm(e) {
      let params = e.detail || {}
      const {ok, password} = this.data
      if (!password) {
        wx.showToast({'title': '请输入密码', icon: 'none'})
        return
      }
      params.password = password
      this.emit('confirm', params)
      if (this.isFunction(ok)) {
        ok(password)
      }
      this.close()
    },
    onCancel(e) {
      const {cancel} = this.data
      if (this.isFunction(cancel)) {
        cancel()
      }
      this.emit('cancel', e.detail)
    },
    onInput(e) {
      this.setData({
        password: e.detail.value
      })
    },
    clearInput() {
      this.setData({
        password: ''
      })
    }
  },
  ready() {
    let dialogComponent = this.selectComponent('.wxc-dialog')
    this.setData({
      dialogComponent: dialogComponent
    })
  },
  created() {
  }
})
