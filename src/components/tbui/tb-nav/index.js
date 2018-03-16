Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    title: {
      type: String,
      value: ''
    },
    navBackBtn: {
      type: Boolean,
      value: true
    },
    backgroundColor: {
      type: String,
      value: '#f7f7f8'
    },
    textColor: {
      type: String,
      value: 'black'
    },
    navBackBtnColor: {
      type: String,
      value: '#333'
    },
    hasLeft: {
      type: Boolean,
      value: false
    },
    hasRight: {
      type: Boolean,
      value: false
    }
  },
  data: {
    statusBarHeight: 20
  },
  methods: {
    back() {
      wx.navigateBack()
    }
  },
  ready() {
  },
  created() {
  }
})
