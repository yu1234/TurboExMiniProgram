import WxParse from '../../../components/wxParse/wxParse'

Component({
  properties: {
    tbRichTextContent: {
      type: String,
      value: '',
      observer(newVal) {
        // WxParse.wxParse('content', 'html', newVal, this, 5)
      }
    }
  },
  data: {},
  methods: {
    /**
     * a标签点击事件
     * @param e
     */
    onTap(e) {
      console.log(e)
    },
    wxParseImgError(e) {
      console.log(e)
    }
  },
  ready() {
  },
  created() {
  }
})
