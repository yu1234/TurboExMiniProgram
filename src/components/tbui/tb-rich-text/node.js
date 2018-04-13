import BaseBehavior from '../../behavior/BaseBehavior'

Component({
  behaviors: [BaseBehavior],
  properties: {
    nodes: {
      type: Array,
      value: '',
      observer(newVal) {
        this.setData({
          _nodes: newVal
        })
      }
    },
    windowWidth: {
      type: Number,
      value: 0
    },
    windowHeight: {
      type: Number,
      value: 0
    },
    padding: {
      type: Number,
      value: 5
    }
  },
  data: {
    _nodes: [],
  },
  methods: {
    /**
     * a标签点击事件
     * @param e
     */
    wxParseTagATap(e) {
      let src = e.currentTarget.dataset.src
      this.emit('tagATap', {src: src})
    },
    /**
     * a标签点击事件(b)
     * @param e
     */
    tagATap(e) {
      this.emit('tagATap', e.detail)
    },
    /**
     * img标签点击事件
     * @param e
     */
    wxParseImgTap(e) {
      this.emit('tagImgTap', e.currentTarget.dataset)
    },
    /**
     * img标签点击事件(b)
     * @param e
     */
    tagImgTap(e) {
      this.emit('tagATap', e.detail)
    },
    /**
     * 图片视觉宽高计算函数区
     **/
    wxParseImgLoad(e) {
      this.calMoreImageInfo(e)
    },
    calMoreImageInfo(e) {
      const {width, height} = e.detail
      let index = parseInt(e.currentTarget.dataset.index || -1)
      const {_nodes} = this.data
      let recal = this.wxAutoImageCal(width, height)
      if (this.isArray(_nodes) && _nodes.length > index && index > 0) {
        let dataKey = `_nodes[${index}].width`
        this.setData({
          [dataKey]: recal.imageWidth
        })
        console.log(this.data._nodes[index])
      }
    },
    // 计算视觉优先的图片宽高
    wxAutoImageCal(originalWidth, originalHeight) {
      // 获取图片的原始长宽
      const {windowWidth} = this.data
      let autoWidth = 0
      let autoHeight = 0
      let results = {}
      // 判断按照那种方式进行缩放
      if (originalWidth > windowWidth) {
        // 在图片width大于手机屏幕width时候
        autoWidth = windowWidth
        autoHeight = (autoWidth * originalHeight) / originalWidth
        results.imageWidth = autoWidth
        results.imageheight = autoHeight
      } else {
        autoWidth = windowWidth
        autoHeight = (autoWidth * originalHeight) / originalWidth
        results.imageWidth = autoWidth
        results.imageheight = autoHeight
        // 否则展示原来的数据
        /*  results.imageWidth = originalWidth
          results.imageheight = originalHeight*/
      }
      return results
    }
  },
  ready() {
  },
  created() {
  }
})
