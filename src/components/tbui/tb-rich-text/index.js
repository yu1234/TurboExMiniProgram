Component({
  properties: {
    tbRichTextContent: {
      type: String,
      value: '',
      observer(newVal) {
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
