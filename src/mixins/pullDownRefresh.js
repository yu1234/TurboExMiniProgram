import wepy from 'wepy'

export default class PullDownRefreshMixin extends wepy.mixin {
  data = {
    refreshing: false
  }

  onPullDownRefresh() {
    if (!this.refreshing) {
      this.refreshing = true
      this.refresh()
    }
  }

  refresh() {
  }

  _refreshComplete() {
    this.refreshing = false
    wepy.stopPullDownRefresh()
  }
}
