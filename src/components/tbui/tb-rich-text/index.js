import HtmlToJson from './html2json'
import BaseBehavior from '../../behavior/BaseBehavior'

Component({
  behaviors: [BaseBehavior],
  properties: {
    type: {
      type: String,
      value: 'html'
    },
    padding: {
      type: Number,
      value: 5
    },
    imgPreview: {
      type: Boolean,
      value: true
    },
    nodes: {
      type: String,
      value: '',
      observer(newVal) {
        if (newVal) {
          this.htmlParse(newVal)
        } else {
          this.setData({
            _nodes: []
          })
        }
      }
    }
  },
  data: {
    _nodes: [],
    transData: {},
    windowWidth: 0,
    windowHeight: 0
  },
  methods: {
    /**
     * a标签点击事件
     * @param e
     */
    tagATap(e) {
      this.emit('tagATap', e.detail)
    },
    /**
     * a标签点击事件
     * @param e
     */
    tagImgTap(e) {
      const {imgPreview, transData} = this.data
      const {src} = e.detail
      if (imgPreview) {
        wx.previewImage({
          current: src, // 当前显示图片的http链接
          urls: transData.imageUrls // 需要预览的图片http链接列表
        })
      }
      this.emit('tagATap', e.detail)
    },
    htmlParse(data) {
      let transData = HtmlToJson.html2json(data, 'htmlRichText')
      this.setData({
        transData: transData
      })
      console.log(transData)
      if (transData.children) {
        this.setData({
          _nodes: transData.children
        })
      }
    }
  },
  ready() {
    const {padding} = this.data
    let res = wx.getSystemInfoSync()
    let windowWidth = 0
    let windowHeight = 0
    if (res.windowWidth && res.windowWidth > 0) {
      windowWidth = res.windowWidth - ((padding || 0) * 2)
    }
    if (res.windowHeight && res.windowHeight > 0) {
      windowHeight = res.windowHeight
    }
    this.setData({
      windowWidth: windowWidth,
      windowHeight: windowHeight
    })
  },
  created() {
  }
})
