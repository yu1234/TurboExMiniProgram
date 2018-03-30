import BaseBehavior from '../../behavior/BaseBehavior'

const logFlag = 'tb-float-button'
Component({
  behaviors: [BaseBehavior],
  externalClasses: ['class-name', 'button-class'],
  properties: {
    position: {
      type: String,
      value: 'topLeft',
      observer(newValue) {
        let positionClass = 'wux-speed-dial--top-left'
        if (newValue === 'topRight') {
          positionClass = 'wux-speed-dial--top-right'
        } else if (newValue === 'bottomLeft') {
          positionClass = 'wux-speed-dial--bottom-left'
        } else if (newValue === 'bottomRight') {
          positionClass = 'wux-speed-dial--bottom-right'
        }
        this.setData({
          positionClass: positionClass
        })
      }
    },
    backdrop: {
      type: Boolean,
      value: false
    },
    buttons: {
      type: Array,
      value: []
    },
    open: {
      type: Boolean,
      value: false,
      observer(newVal) {
        let flag = false
        if (newVal === true) {
          flag = true
        }
        this.setData({
          opened: flag
        })
      }
    },
    name: {
      type: String,
      value: ''
    }
  },
  data: {
    opened: false,
    positionClass: 'wux-speed-dial--top-left'
  },
  methods: {
    /**
     * 隐藏
     */
    hide() {
      if (this.data.visible) {
        this.setHidden()
      }
    },
    /**
     * 显示
     */
    show() {
      if (!this.data.visible) {
        this.setVisible()
      }
    },
    /**
     * 关闭
     */
    close() {
      this.toggle(false)
    },
    /**
     * 打开
     */
    open() {
      this.toggle(true)
    },
    toggle(open) {
      let flag = false
      if (open) {
        flag = true
      }
      this.setData({
        open: flag
      })
      this.emit('toggle', {name: this.data.name, type: 'toggle', status: flag})
    },
    toggleTap(e) {
      !this.data.opened ? this.open() : this.close()
    },
    buttonTap(e) {
      const index = e.currentTarget.dataset.index
      this.emit('buttonTap', {index: index, button: this.data.buttons[index]})
      this.close()
    }
  },
  ready() {
  },
  created() {
  }
})
