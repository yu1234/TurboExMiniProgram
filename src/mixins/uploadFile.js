import wepy from 'wepy'
import BaseMixin from './base'
import {uploadFiles} from '../utils/twmodule'

export default class UploadFileMixin extends wepy.mixin {
  mixins = [BaseMixin]
  data = {}
  methods = {}

  /**
   * 文件上传
   * @param filePaths 上传文件路径 Array
   * @param formData 需要
   */
  commonUploadFile(filePaths, formData) {
    return new Promise((resolve, reject) => {
      if (this.isArrayNotNull(filePaths)) {
        let successArr = []
        let failArr = []
        let len = filePaths.length
        let failCount = 0
        let successCount = 0
        let callback = {
          beforeUpload(res) {
            wepy.showLoading({title: `文件${res.index + 1}上传中...`})
          },
          success(res) {
            successCount++
            successArr.push(res)
          },
          fail(res) {
            failCount++
            failArr.push(res)
          },
          complete(res) {
            wepy.hideLoading()
            let index = res.index || 0
            if ((index + 1) >= len) {
              wepy.showToast({title: `文件上传完成,成功${successCount},失败${failCount}`, icon: 'none'})
              if (failArr.length > 0) {
                reject(failArr)
              }
              if (successArr.length > 0) {
                resolve(successArr)
              }
            }
          }
        }
        uploadFiles(filePaths, formData, callback)
      }
    })
  }
}
