import BaseBehavior from '../../behavior/BaseBehavior'

const logFlag = 'tb-checkbox'
Component({
  behaviors: [BaseBehavior],
  properties: {
    label: {
      type: String,
      value: ''
    },
    value: {
      type: String,
      value: null
    },
    disabled: {
      type: Boolean,
      value: false
    },
    checked: {
      type: Boolean,
      value: false,
      observer(newVal) {
        this.setData({
          _checked: newVal
        })
      }
    },
    color: {
      type: String,
      value: null
    },
    name: {
      type: String,
      value: null
    },
    model: {
      type: Array,
      value: [],
      observer(newVal) {
        this.setData({
          '_model': newVal
        })
        if (this.isArray(this.data._model)) {
          let checked = false
          this.each(this.data._model, (v, i) => {
            if (v === this.data.value) {
              checked = true
            }
          })
          this.setData({
            _checked: checked
          })
        } else {
          this.setData({
            _checked: false
          })
        }
      }
    }
  },
  data: {
    _model: [],
    _checked: false
  },
  methods: {
    onChange(e) {
      if (this.isArrayNotNull(e.detail.value)) {
        if (this.isArray(this.data._model)) {
          let checked = false
          this.each(this.data._model, (v, i) => {
            if (v === this.data.value) {
              checked = true
            }
          })
          if (!checked) {
            let temp = this.data._model
            temp.push(this.data.value)
            this.setData({
              '_model': temp
            })
          }
        } else {
          this.setData({
            '_model': [this.data.value]
          })
        }
      } else {
        if (this.isArray(this.data._model)) {
          let checked = false
          let index = -1
          this.each(this.data._model, (v, i) => {
            if (v === this.data.value) {
              checked = true
              index = i
            }
          })
          if (checked && index > -1) {
            let temp = this.data._model
            temp.splice(index, 1)
            this.setData({
              '_model': temp
            })
          }
        } else {
          this.setData({
            '_model': []
          })
        }
      }

      var myEventDetail = {model: this.data._model, name: this.data.name} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('change', myEventDetail, myEventOption)
    }
  },
  ready() {
  },
  created() {
  }
})
