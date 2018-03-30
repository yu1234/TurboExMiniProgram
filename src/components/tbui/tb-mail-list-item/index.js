import BaseBehavior from "../../behavior/BaseBehavior";

Component({
  behaviors: [BaseBehavior],
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
    },
    attach: {
      type: Boolean,
      value: false
    },
    backlog: {
      type: Boolean,
      value: false
    },
    importance: {
      type: Boolean,
      value: false
    },
    star: {
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
    },
    load(e) {
    },
    rightTap(e) {
      let params = {type: 'rightTap'}
      this.emit('rightTap', params)
    }
  }
})
