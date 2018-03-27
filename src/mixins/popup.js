import wepy from 'wepy'
import BaseMixin from './base'

export default class PopupMixin extends wepy.mixin {
  mixins = []
  data = {}
  methods = {
    openPopup(name) {
      if (this.popup[name] !== null && this.popup[name] !== undefined) {
        this.popup[name] = true
      }
    },
    closePopup(name) {
      if (this.popup[name] !== null && this.popup[name] !== undefined) {
        this.popup[name] = false
      }
    },
    popupChange(e) {
      let name = e.detail.name
      let type = e.detail.type
      if (type === 'show') {
        if (this.popup[name] !== null && this.popup[name] !== undefined) {
          this.popup[name] = true
        }
      } else if (type === 'hide') {
        if (this.popup[name] !== null && this.popup[name] !== undefined) {
          this.popup[name] = false
        }
      }
    }
  }

  openPopup(name) {
    if (this.popup[name] !== null && this.popup[name] !== undefined) {
      this.popup[name] = true
    }
  }

  closePopup(name) {
    if (this.popup[name] !== null && this.popup[name] !== undefined) {
      this.popup[name] = false
    }
  }
}
