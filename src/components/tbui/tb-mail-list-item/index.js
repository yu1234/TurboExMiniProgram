Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    avatar: {
      type: String,
      value: null
    },
    title: {
      type: String,
      value: ''
    },
    titleAfter: {
      type: String,
      value: ''
    },
    subTitle: {
      type: String,
      value: ''
    },
    text: {
      type: String,
      value: ''
    },
    unRead: {
      type: Boolean,
      value: false
    },
    hasRight: {
      type: Boolean,
      value: false
    },
    top: {
      type: Boolean,
      value: false
    }
  },
  data: {},
  methods: {
    error(e) {
      this.setData({
        avatar: '/assets/av1.png'
      })
    }
  }
})
