Component({
  properties: {
    open: {
      type: Boolean,
      value: false,
      observer(status) {
        if (status === true) {
          this.show()
        } else {
          this.hide()
        }
      }
    },
    position: {
      type: String,
      value: 'center',
      observer(p) {
        if (p === 'top' || p === 'left' || p === 'right' || p === 'bottom') {
          this.setData({
            popupPosition: p
          })
        } else {
          this.setData({
            popupPosition: 'center'
          })
        }
      }
    },
    overlay: {
      type: Boolean,
      value: true
    }
  },
  data: {
    showPopup: false,
    popupPosition: 'center'
  },
  methods: {
    togglePopup() {
      if (this.data.showPopup) {
        this.hide()
      } else {
        this.show()
      }
    },
    show() {
      this.setData({
        showPopup: true
      })
      let myEventDetail = {aaa: 'aaa'} // detail对象，提供给事件监听函数
      let myEventOption = {bbb: 'bbbb'} // 触发事件的选项
      this.triggerEvent('show', myEventDetail, myEventOption)
    },
    hide() {
      this.setData({
        showPopup: false
      })
      let myEventDetail = {cccc: 'cccc'} // detail对象，提供给事件监听函数
      let myEventOption = {ddd: 'ddd'} // 触发事件的选项
      this.triggerEvent('hide', myEventDetail, myEventOption)
    }
  }
})
