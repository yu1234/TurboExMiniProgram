import wepy from 'wepy'
import BaseMixin from './base'

export default class FromMixin extends wepy.mixin {
  mixins = [BaseMixin]
  data = {}
  methods = {
    formChange(e) {
      let name = e.detail.name
      let value = e.detail.model
      if (name) {
        let keys = name.split('.')
        if (keys.length === 1) {
          this[keys[0]] = value
        } else if (keys.length === 2) {
          if (this[keys[0]]) {
            this[keys[0]][keys[1]] = value
          }
        }
      }
    }
  }
}
