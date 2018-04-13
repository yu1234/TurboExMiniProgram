import wepy from 'wepy'
import {getFileType} from '../utils/utils'

export default class PreviewMixin extends wepy.mixin {
  canPreviewObj = {
    doc: 'word',
    xls: 'word',
    ppt: 'word',
    pdf: 'word',
    docx: 'word',
    xlsx: 'word',
    pptx: 'word',
    txt: 'word',
    png: 'img',
    jpeg: 'img',
    jpg: 'img',
    gif: 'img',
    mp4: 'video',
    avi: 'video',
    rmvb: 'video',
    flv: 'video',
    mkv: 'video',
    mp3: 'audio'
  }

  filePreview(obj) {
    if (obj && obj.name && obj.path) {
      let fileType = getFileType(obj.name)
      let canPreviewType = this.canPreviewObj[fileType]
      if (canPreviewType) {
        if (canPreviewType === 'word') {
          this.openWordFile(obj.path, fileType)
        } else if (canPreviewType === 'img') {
          this.openImgFile([obj.path])
        } else if (canPreviewType === 'video') {
          this.openVideoFile(obj.path, obj.name)
        } else if (canPreviewType === 'audio') {
          this.openVideoFile(obj.path, obj.name)
        }
      } else {
        wepy.showToast({title: '该文件不支持打开', icon: 'none'})
      }
    } else {
      wepy.showToast({title: '打开失败', icon: 'none'})
    }
  }

  /**
   * 打开文档文件
   * @param filePath
   * @param fileType
   */
  openWordFile(filePath, fileType) {
    wepy.showLoading({title: '文件打开中...'})
    wepy.openDocument({
      filePath: filePath,
      fileType: fileType,
      success() {
        wepy.hideLoading()
      },
      fail(e) {
        wepy.hideLoading()
        wepy.showToast({title: '文件打开失败,请检测文件是否损坏', icon: 'none'})
      }
    })
  }

  /**
   * 打开图片
   * @param filePaths
   */
  openImgFile(filePaths) {
    wepy.showLoading({title: '图片打开中...'})
    wepy.previewImage({
      urls: filePaths, // 需要预览的图片http链接列表
      success: function (res) {
        wepy.hideLoading()
      },
      fail(e) {
        wepy.hideLoading()
        wepy.showToast({title: '打开失败,请检测文件是否损坏', icon: 'none'})
      }
    })
  }

  /**
   *打开视频文件
   * @param filePath
   * @param name
   */
  openVideoFile(filePath, name) {
    if (filePath) {
      let p = {
        name: name,
        type: 'open',
        filePath: filePath

      }
      let params = JSON.stringify(p)
      this.loadPage(`/pages/video/video?params=${params}`)
    } else {
      wepy.showToast({title: '播放失败,请检测文件是否损坏', icon: 'none'})
    }
  }
}
