import BaseBehavior from '../../behavior/BaseBehavior'

Component({
  behaviors: [BaseBehavior],
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    sysFontSize: {
      type: Number,
      value: 16
    },
    existTags: {
      type: Array,
      value: []
    },
    autoCompeteList: {
      type: Array,
      value: [],
      observer(newVal) {
        if (this.data.inputFocus && newVal.length > 0) {
          this.setData({
            'autoCompeteShow': true
          })
        }
      }
    },
    title: {
      type: String,
      value: null
    },
    name: {
      type: String,
      value: null
    }
  },
  data: {
    tags: [],
    inputFocus: false,
    inputBlur: true,
    inputValue: '',
    inputMaxValue: 80,
    inputWidth: 16,
    autoCompeteShow: false,
    autoCompeteSave: false
  },
  methods: {
    autoCompeteItemTap(e) {
      let item = e.target.dataset.item
      this.setTag(item.id, item.text)
      this.setData({
        'autoCompeteShow': false,
        'inputValue': ''
      })
    },
    autoCompeteScroll() {
      this.data.autoCompeteSave = true
    },
    onFocus() {
      this.setData({
        'inputFocus': true,
        'inputBlur': false
      })
      this.setInputWidth()
    },
    onBlur() {
      console.log('onBlur')
      this.setData({
        'inputBlur': true,
        'inputFocus': false
      })
      setTimeout(() => {
        if (this.data.autoCompeteSave) {
          this.setData({
            'autoCompeteSave': false
          })
        } else {
          if (this.data.inputValue && this.data.inputValue.trim().length > 0) {
            this.setTag(this.data.inputValue, this.data.inputValue)
          }
          this.setData({
            'autoCompeteShow': false,
            'inputValue': ''
          })
        }
        this.setInputWidth(1)
      }, 350)
    },
    onInput(e) {
      this.setInputWidth()
      let inputValue = e.detail.value
      let params = {type: 'onInput', name: this.data.name, value: inputValue}
      this.emit('onInput', params)
      this.setData({
        'inputValue': inputValue
      })
    },
    setTag(id, text) {
      let isPass = this.validator(id, text)
      if (isPass !== true) {
        return
      }
      let tags = this.data.tags
      tags.push({id: id, text: text})
      this.setData({
        'inputFocus': false,
        tags: tags
      })
      let params = {type: 'tagChange', name: this.data.name, tags: tags}
      this.setInputWidth()
      this.emit('tagChange', params)
    },
    setInputWidth(w) {
      if (w != null && w !== undefined) {
        this.setData({
          inputWidth: w
        })
      } else {
        let query = wx.createSelectorQuery().in(this)
        query.select('.input-tag .input .content .text .tag-input').fields({
          dataset: true,
          size: true,
          scrollOffset: true,
          properties: ['value']
        })
        query.exec((res) => {
          if (res && res.length > 0 && res[0]) {
            let inputNode = res[0]
            let inputNodeValue = inputNode.value
            if (!inputNodeValue) {
              this.setData({
                inputWidth: this.data.sysFontSize
              })
              return
            }
            if (this.data.sysFontSize) {
              let inputW = (inputNodeValue.length + 2) * this.data.sysFontSize
              if (inputW > this.data.inputMaxValue) {
                this.setData({
                  inputWidth: this.data.inputMaxValue
                })
              } else {
                this.setData({
                  inputWidth: parseInt(inputW) || this.data.sysFontSize
                })
              }
            }
          }
        })
      }
    },
    validator(id, text) {
      if (id) {
        var r = true
        if (id.indexOf('@') !== -1) {
          r = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.{0,1}[A-Za-z0-9]*$/.test(id)
          if (!r) {
            wx.showToast({title: '输入地址格式不正确', icon: 'none'})
            return false
          }
        } else {
          let type = this.getSysIdType(id)
          if (type !== 'wg' && type !== 'og') {
            r = false
            wx.showToast({title: '输入地址格式不正确', icon: 'none'})
            return false
          }
        }
        var hasAddressArray = this.data.existTags || []
        for (let i = 0, len = hasAddressArray.length; i < len; i++) {
          if (hasAddressArray[i] === id) {
            wx.showToast({
              title: (text + '地址已存在'),
              icon: 'none'
            })
            r = false
            break
          }
        }
        return r
      } else {
        wx.showToast({title: '输入地址格式不正确', icon: 'none'})
        return false
      }
    },
    /**
     * 获取idtype、datatype
     *
     * @param id
     * @returns
     */
    getSysIdType(id) {
      let typename = id.indexOf('ur') === 0 ? 'ur'
        : id.indexOf('og') === 0 ? 'og' : id.indexOf('wg') === 0 ? 'wg'
          : id.indexOf('ta') === 0 ? 'ta'
            : id.indexOf('rg') === 0 ? 'rg'
              : id.indexOf('pt') === 0 ? 'pt' : id
                .indexOf('_nf_') !== -1 ? 'nf' : ''
      return typename
    },
    rightIconTap() {
      let params = {type: 'rightIconTap', name: this.data.name}
      this.emit('rightIconTap', params)
    },
    tagTap(e) {
      let self = this
      let index = e.target.dataset.index
      wx.showActionSheet({
        itemList: ['删除'],
        itemColor: '#F23535',
        success(res) {
          console.log(res.tapIndex)
          if (res.tapIndex === 0) {
            self.removeTag(index)
          }
        }
      })
    },
    removeTag(index) {
      let tags = this.data.tags
      if (index >= 0 && tags && index < tags.length) {
        tags.splice(index, 1)
        this.setData({
          tags: tags
        })
      }
    }
  },
  ready() {
    let query = wx.createSelectorQuery().in(this)
    query.select('.input-tag .input .content').boundingClientRect()
    query.exec((res) => {
      if (res && res.length > 0 && res[0]) {
        let contentNode = res[0]
        let contentNodeWidth = contentNode.width || 0
        this.setData({
          inputMaxValue: parseInt(contentNodeWidth - 10)
        })
        this.setInputWidth()
      }
    })
  },
  created() {
  }
})
