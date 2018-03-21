import wepy from 'wepy'
import BaseMixin from './base'

export default class FromMixin extends wepy.mixin {
  mixins = [BaseMixin]
  data = {}
  methods = {
    formChange(e) {
      if (e.detail.name && this[e.detail.name]) {
        this[e.detail.name] = e.detail.model
      }
    }
  }
}
