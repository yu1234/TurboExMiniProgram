import BaseBehavior from '../../behavior/BaseBehavior'

const logFlag = 'tb-radio'
Component({
  behaviors: [BaseBehavior],
  relations: {
    './tb-radio-group': {
      type: 'ancestor', // 关联的目标节点应为父节点
      linked: function (target) {
        // 每次被插入到tb-radio-group时执行，target是tb-radio-group节点实例对象，触发在attached生命周期之后
        const {parent, _checked} = this.data
        if (!parent || parent.__wxExparserNodeId__ !== target.__wxExparserNodeId__) {
          this.setData({
            parent: target
          })
          if (this.__wxExparserNodeId__ && target && target.onCheckChange) {
            target.onCheckChange(this.__wxExparserNodeId__, _checked)
          }
        }
      },
      linkChanged: function (target) {
        // 每次被移动后执行，target是tb-radio-group节点实例对象，触发在moved生命周期之后
      },
      unlinked: function (target) {
        // 每次被移除时执行，target是tb-radio-group节点实例对象，触发在detached生命周期之后
        this.setData({
          parent: null
        })
      }
    }
  },
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
        const {parent} = this.data
        if (this.__wxExparserNodeId__ && parent && parent.onCheckChange) {
          parent.onCheckChange(this.__wxExparserNodeId__, newVal)
        }
      }
    },
    color: {
      type: String,
      value: null
    },
    value: {
      type: null,
      value: null,
      observer(newVal) {
        if (newVal) {
          let tVal = ''
          if (typeof newVal !== 'string') {
            tVal = JSON.stringify(newVal)
          } else {
            tVal = newVal
          }
          this.setData({
            _value: tVal,
            model: newVal
          })
        } else {
          this.setData({
            _value: ''
          })
        }
      }
    }
  },
  data: {
    model: null,
    _checked: false,
    _value: null,
    parent: null
  },
  methods: {
    onChange(e) {
      const {parent, model} = this.data
      if (parent && parent.onChange) {
        parent.onChange(this.__wxExparserNodeId__, e.detail.value, model)
      }
    },
    onCheckChange(check) {
      let f = false
      if (check === true) {
        f = true
      }
      this.setData({
        _checked: f
      })
    }
  },
  ready() {
  },
  created() {
  }
})
