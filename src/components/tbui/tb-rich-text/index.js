import WxParse from '../../../components/wxParse/wxParse'
import Wxmlify from '../../wxmlify/wxmlify'

Component({
  properties: {
    tbRichTextContent: {
      type: String,
      value: '',
      observer(newVal) {
        // WxParse.wxParse('content', 'html', newVal, this, 5)
        let wxmlify = new Wxmlify(newVal, this, {})
        this.setData({
          wxmlify: wxmlify
        })
      }
    }
  },
  data: {
    wxmlify: null
  },
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
