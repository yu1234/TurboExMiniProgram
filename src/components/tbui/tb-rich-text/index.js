import WxParse from '../../../components/wxParse/wxParse'
import HtmlToJson from './html2json'

Component({
  properties: {
    tbRichTextContent: {
      type: String,
      value: '',
      observer(newVal) {
        WxParse.wxParse('content', 'html', newVal, this, 5)
        let transData = HtmlToJson.html2json(newVal, 'test')
        console.log(transData)
      }
    }
  },
  data: {},
  methods: {
    /**
     * a标签点击事件
     * @param e
     */
    wxParseTagATap(src, e) {
      console.log(src)
      let myEventDetail = {dataset: e.currentTarget.dataset, src: e.currentTarget.dataset.src}
      let myEventOption = {} // 触发事件的选项
      this.triggerEvent('onTagA', myEventDetail, myEventOption)
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
