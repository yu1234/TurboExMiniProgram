import BaseBehavior from '../../behavior/BaseBehavior'

const logFlag = 'tb-checkbox'
Component({
  behaviors: [BaseBehavior],
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    title: {
      type: String,
      value: null
    },
    name: {
      type: String,
      value: ''
    },
    value: {
      type: String,
      value: null
    },
    type: {
      type: String,
      value: 'text',
      observer(newVal) {
        if (newVal === 'password') {
          this.setData({
            password: true
          })
        }
      }
    },
    model: {
      type: Array,
      value: [],
      observer(newVal) {
        this.setData({
          'value': newVal
        })
      }
    },
    placeholder: {
      type: String,
      value: null
    },
    placeholderStyle: {
      type: String,
      value: null
    },
    placeholderClass: {
      type: String,
      value: null
    },
    disabled: {
      type: Boolean,
      value: false
    },
    focus: {
      type: Boolean,
      value: false
    },
    cursorSpacing: {
      type: Number,
      value: 1
    },
    confirmType: {
      type: String,
      value: 'done'
    },
    confirmHold: {
      type: Boolean,
      value: false
    },
    cursor: {
      type: Number,
      value: null
    },
    selectionstart: {
      type: Number,
      value: -1
    },
    selectionEnd: {
      type: Number,
      value: -1
    },
    adjustPosition: {
      type: Boolean,
      value: true
    },
    hasRight: {
      type: Boolean,
      value: false
    }

  },
  data: {
    password: false,
    inputValue: 200
  },
  methods: {
    onInput(e) {
      let params = {type: 'input', name: this.data.name, value: e.detail.value, cursor: e.detail.cursor}
      this.emit('input', params)
    },
    onFocus(e) {
      let params = {type: 'focus', name: this.data.name, value: e.detail.value, height: e.detail.height}
      this.emit('focus', params)
    },
    onBlur(e) {
      let params = {type: 'blur', name: this.data.name, value: e.detail.value}
      this.emit('blur', params)
    },
    onConfirm(e) {
      let params = {type: 'confirm', name: this.data.name, value: e.detail.value}
      this.emit('confirm', params)
    }
  },
  ready() {
    let query = wx.createSelectorQuery().in(this)
    query.select('.tb-input').boundingClientRect()
    query.select('.tb-input .tb-label').boundingClientRect()
    query.select('.input-tag .right').boundingClientRect()
    query.exec((res) => {
      if (res && res.length > 0) {
        let node = res[0]
        let node1 = res[1]
        let node2 = res[2]
        let w = 0
        let w1 = 0
        let w2 = 0
        let inputW = 200
        if (this.data.hasRight) {
          if (node) {
            w = node.width || 0
          }
          if (node1) {
            w1 = node1.width || 0
          }
          if (node2) {
            w2 = node2.width || 0
          }
          inputW = parseInt(w) - parseInt(w1) - parseInt(w2) - 20
        } else {
          if (node) {
            w = node.width || 0
          }
          if (node1) {
            w1 = node1.width || 0
          }
          inputW = parseInt(w) - parseInt(w1) - 20
        }
        this.setData({
          inputValue: inputW
        })
      }
    })
  },
  created() {
  }
})
