Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  externalClasses: ['sub-title-class','item-class'],
  properties: {
    avatar: {
      type: String,
      value: null
    },
    title: {
      type: String,
      value: null
    },
    titleAfter: {
      type: String,
      value: null
    },
    subTitle: {
      type: String,
      value: null
    },
    subTitleAfter: {
      type: String,
      value: null
    },
    text: {
      type: String,
      value: null
    },
    hasLeft: {
      type: Boolean,
      value: false
    },
    hasTitleAfterSlot: {
      type: Boolean,
      value: false
    },
    hasSubTitleAfterSlot: {
      type: Boolean,
      value: false
    },
    hasRight: {
      type: Boolean,
      value: false
    },
    hasStrip: {
      type: Boolean,
      value: false
    },
    titleBold: {
      type: Boolean,
      value: false
    }
  },
  data: {},
  methods: {
    onTap() {
      console.log(this)
    },
    error(e) {
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('error', e, myEventOption)
    }
  },
  ready() {
  }
})
