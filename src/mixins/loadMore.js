import wepy from 'wepy'

export default class LoadMoreMixin extends wepy.mixin {
  data = {
    loadingMore: false,
    noMoreDate: false
  }

  onReachBottom() {
    console.log('onReachBottom')
    if (!this.loadingMore && !this.noMoreDate) {
      this.loadingMore = true
      this.loadMore()
    }
  }

  loadMore() {
  }

  _loadMoreComplete(noMoreDate) {
    this.loadingMore = false
    if (noMoreDate === true) {
      this.noMoreDate = noMoreDate
    } else {
      this.noMoreDate = false
    }
  }
}
