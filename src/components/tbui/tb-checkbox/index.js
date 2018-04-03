import BaseBehavior from '../../behavior/BaseBehavior'

const logFlag = 'tb-checkbox'
Component({
  behaviors: [BaseBehavior],
  properties: {
    label: {
      type: String,
      value: ''
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
      type: null,
      value: [],
      observer(newVal) {
        this.setData({
          '_model': newVal
        })
        if (newVal && this.isArray(newVal)) {
          let checked = false
          this.each(newVal, (v, i) => {
            if (v && JSON.stringify(v) === this.data._value) {
              checked = true
            }
          })
          this.setData({
            _checked: checked
          })
        } else if (newVal && typeof newVal === 'string') {
          let checked = false
          if (newVal === this.data._value) {
            checked = true
          }
          this.setData({
            _checked: checked
          })
        } else {
          this.setData({
            _checked: false
          })
        }
      }
    },
    value: {
      type: null,
      value: null,
      observer(newVal) {
        let _value = null
        if (newVal) {
          _value = JSON.stringify(newVal)
        }
        this.setData({
          _value: _value
        })
        let _model = this.data._model
        if (_model && this.isArray(_model)) {
          let checked = false
          this.each(_model, (v, i) => {
            if (v && JSON.stringify(v) === _value) {
              checked = true
            }
          })
          this.setData({
            _checked: checked
          })
        } else if (_model && typeof _model === 'string') {
          let checked = false
          if (_model === _value) {
            checked = true
          }
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
    _checked: false,
    _value: null
  },
  methods: {
    onChange(e) {
      if (this.isArrayNotNull(e.detail.value)) { // 选中
        if (this.isArray(this.data.model)) {
          let checked = false
          this.each(this.data._model, (v, i) => {
            if (v && JSON.stringify(v) === this.data._value) {
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
        } else if (typeof this.data.model === 'string') {
          this.setData({
            '_model': e.detail.value[0]
          })
        } else {
          this.setData({
            '_model': [this.data.value]
          })
        }
      } else { // 未选中
        if (this.isArray(this.data.model)) {
          let checked = false
          let index = -1
          this.each(this.data._model, (v, i) => {
            if (v && JSON.stringify(v) === this.data._value) {
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
        } else if (typeof this.data.model === 'string') {
          this.setData({
            '_model': ''
          })
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
