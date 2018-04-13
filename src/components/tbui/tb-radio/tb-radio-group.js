import BaseBehavior from '../../behavior/BaseBehavior'

const logFlag = 'tb-radio'
Component({
  behaviors: [BaseBehavior],
  relations: {
    './tb-radio': {
      type: 'descendant', // 关联的目标节点应为子节点
      linked: function (target) {
        // 每次有tb-radio被插入时执行，target是该节点实例对象，触发在该节点attached生命周期之后
        let {children, model} = this.data
        children = children || {}
        if (target && target.__wxExparserNodeId__) {
          children[target.__wxExparserNodeId__] = target
          this.setData({
            children: children
          })
          this.onModelChange(model)
        }
      },
      linkChanged: function (target) {
        // 每次有tb-radio被移动后执行，target是该节点实例对象，触发在该节点moved生命周期之后
      },
      unlinked: function (target) {
        // 每次有tb-radio被移除时执行，target是该节点实例对象，触发在该节点detached生命周期之后
        let {children} = this.data
        children = children || {}
        if (target && children[target.__wxExparserNodeId__]) {
          delete children[target.__wxExparserNodeId__]
          this.setData({
            children: children
          })
        }
      }
    }
  },
  properties: {
    model: {
      type: null,
      value: '',
      observer(newVal) {
        this.onModelChange(newVal)
      }
    },
    name: {
      type: String,
      value: null
    }
  },
  data: {
    children: {},
    currentCheck: null
  },
  methods: {
    onChange(id, val) {
      const {children, name} = this.data
      if (children[id]) {
        let {model, _value} = children[id].data
        if (val === _value) {
          this.onCheckChange(id, true)
          var params = {model: model, name: name}
          this.emit('change', params)
        } else {
          this.onCheckChange(id, false)
        }
      }
    },
    onCheckChange(id, check) {
      const {children, currentCheck} = this.data
      if (children[id]) {
        if (check === true) {
          if (currentCheck !== id) {
            if (children[currentCheck]) {
              children[currentCheck].onCheckChange(false)
            }
            children[id].onCheckChange(check)
            this.setData({
              currentCheck: id
            })
          }
        } else {
          children[id].onCheckChange(false)
        }
      }
    },
    onModelChange(model) {
      const {children} = this.data
      let tVal = ''
      if (typeof model !== 'string') {
        tVal = JSON.stringify(model)
      } else {
        tVal = model
      }
      this.each(children, (v, k) => {
        if (v) {
          const {_value} = v.data
          if (_value === tVal) {
            this.onCheckChange(k, true)
          }
        }
      })
    }
  },
  ready() {
  },
  created() {
  }
})
