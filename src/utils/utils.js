import wepy from 'wepy'
import {getSessionId} from '../config'
import TbError from './TbError'

let utils = {
  request: {
    post: function (url, data) {
      return new Promise(function (resolve, reject) {
        if (!url) {
          reject(new Error('请求路径不能为空'))
          return
        }
        let paramObj = {
          url: url,
          type: 'POST',
          data: data || {},
          header: {
            'content-type': 'application/x-www-form-urlencoded',
            'Cookie': `JSESSIONID=${getSessionId()}`
          },
          success: function (result) {
            resolve(result)
          },
          fail: function (e) {
            reject(new Error(e))
          }
        }
        wepy.request(paramObj)
      })
    },
    get: function (url) {
      return new Promise(function (resolve, reject) {
        if (!url) {
          reject(new Error('请求路径不能为空'))
          return
        }
        let paramObj = {
          url: url,
          type: 'GET',
          header: {
            'content-type': 'application/x-www-form-urlencoded',
            'Cookie': `JSESSIONID=${getSessionId()}`
          },
          success: function (result) {
            resolve(result)
          },
          fail: function (e) {
            reject(new Error(e))
          }
        }
        wepy.request(paramObj)
      })
    }
  },
  defaultErrors: {
    customError(message) {
      return new TbError(message, 1000)
    },
    dataEmptyError: new TbError('请求数据为空', 1001),
    networkError: new TbError('网络错误,请重试', 1002),
    serverError: new TbError('服务器错误,请重试', 1003)
  },
  // 解析日期
  parseDate(strDate) {
    let r = ''
    // 获取日期对象
    let date = utils.strToDate(strDate)
    if (date) {
      let now = new Date()
      let nYear = now.getFullYear()
      let nMonth = now.getMonth()
      let nDay = now.getDate()
      let nH = now.getHours()
      let nM = now.getMinutes()

      let sYear = date.getFullYear()
      let sMonth = date.getMonth()
      let sDay = date.getDate()
      let sH = date.getHours()
      let sM = date.getMinutes()
      if (nYear !== sYear) {
        return utils.formatDate(date, 'yyyy-MM-dd')
      } else if (nMonth === sMonth && nDay === sDay) {
        if (nH === sH && ((nM - sM) <= 1)) {
          return '刚刚'
        }
        return utils.formatDate(date, 'hh:mm')
      } else if (nMonth === sMonth && ((nDay - sDay) === 1)) {
        return '昨天'
      } else if (nMonth === sMonth && ((nDay - sDay) === 2)) {
        return '前天'
      } else {
        return utils.formatDate(date, 'MM-dd')
      }
    }
    return r
  },
  /**
   * 字符串转日期
   *
   * @param dataStr
   *            格式化日期字符串，支持格式yyyy-MM-dd hh:mm:ss, yyyy/MM/dd hh:mm:ss
   */
  strToDate(dataStr) {
    if (dataStr) {
      var d = new Date(Date.parse(dataStr.replace(/-/g, '/')))
      return d
    }
    return null
  },
  /**
   * // 日期格式化
   *
   * @param date
   *            日期对象
   *
   * @param fmt
   *            格式化格式
   */
  formatDate(date, fmt) {
    if (date) {
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '')
          .substr(4 - RegExp.$1.length))
      }
      var o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
      }
      for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
          var str = o[k] + ''
          fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str
            : ('00' + str).substr(str.length))
        }
      }
      return fmt
    }
    return date
  },
  /**
   * 日期格式化
   *
   * @param dataStr
   *            格式化日期字符串，支持格式yyyy-MM-dd hh:mm:ss, yyyy/MM/dd hh:mm:ss
   * @param fmt
   *            格式化格式
   */
  strFormatDate(dataStr, fmt) {
    var date = utils.strToDate(dataStr)
    return utils.formatDate(date, fmt)
  },
  getFileType(name) {
    if (name) {
      let fileType = name.substring(name.lastIndexOf('.') + 1, name.length).toLowerCase() || ''
      return fileType
    } else {
      return ''
    }
  },
  /**
   * 字节数自动转换为一个可阅读的值和单位
   * @param bytes
   * @returns {string}
   */
  bytesToSize(bytes) {
    if (bytes === 0 || !bytes) {
      return '0字节'
    }
    let k = 1024
    let sizes = ['字节', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    let i = Math.floor(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toPrecision(3) + sizes[i]
  },
  getPhotoByFileType(fileType) {
    let fileTypeRel = {
      zip: '/assets/images/attachment_icon_compressed_m_default.png',
      tar: '/assets/images/attachment_icon_compressed_m_default.png',
      tgz: '/assets/images/attachment_icon_compressed_m_default.png',
      rar: '/assets/images/attachment_icon_compressed_m_default.png',
      '7z': '/assets/images/attachment_icon_compressed_m_default.png',
      gz: '/assets/images/attachment_icon_compressed_m_default.png',
      doc: '/assets/images/attachment_icon_word_m_default.png',
      docx: '/assets/images/attachment_icon_word_m_default.png',
      pdf: '/assets/images/attachment_icon_pdf_m_default.png',
      ppt: '/assets/images/attachment_icon_ppt_m_default.png',
      pptx: '/assets/images/attachment_icon_ppt_m_default.png',
      xls: '/assets/images/attachment_icon_excel_m_default.png',
      xlsx: '/assets/images/attachment_icon_excel_m_default.png',
      txt: '/assets/images/attachment_icon_txt_m_default.png',
      jpg: '/assets/images/attachment_icon_img_m_default.png',
      jpeg: '/assets/images/attachment_icon_img_m_default.png',
      png: '/assets/images/attachment_icon_img_m_default.png',
      gif: '/assets/images/attachment_icon_img_m_default.png',
      eml: '/assets/images/attachment_icon_eml_m_default.png',
      jar: '/assets/images/attachment_icon_jar_m_default.png',
      mp3: '/assets/images/attachment_icon_audio_m_default.png',
      ape: '/assets/images/attachment_icon_audio_m_default.png',
      flac: '/assets/images/attachment_icon_audio_m_default.png',
      wv: '/assets/images/attachment_icon_audio_m_default.png',
      wma: '/assets/images/attachment_icon_audio_m_default.png',
      mp4: '/assets/images/attachment_icon_video_m_default.png',
      avi: '/assets/images/attachment_icon_video_m_default.png',
      rmvb: '/assets/images/attachment_icon_video_m_default.png',
      rm: '/assets/images/attachment_icon_video_m_default.png',
      asf: '/assets/images/attachment_icon_video_m_default.png',
      divx: '/assets/images/attachment_icon_video_m_default.png',
      mpg: '/assets/images/attachment_icon_video_m_default.png',
      flv: '/assets/images/attachment_icon_video_m_default.png',
      mpeg: '/assets/images/attachment_icon_video_m_default.png',
      mpe: '/assets/images/attachment_icon_video_m_default.png',
      wmv: '/assets/images/attachment_icon_video_m_default.png',
      mkv: '/assets/images/attachment_icon_video_m_default.png',
      vob: '/assets/images/attachment_icon_video_m_default.png'
    }
    return fileTypeRel[fileType] || '/assets/images/attachment_icon_other_m_default.png'
  },
  downloadFile(obj) {
    let self = utils
    if (!obj) {
      if (self.isFunction(obj.fail)) {
        obj.fail()
      }
      if (self.isFunction(obj.complete)) {
        obj.complete()
      }
      return
    }
    if (!obj.filePath) {
      console.error('请传入下载路径!!!')
      if (self.isFunction(obj.fail)) {
        obj.fail()
      }
      if (self.isFunction(obj.complete)) {
        obj.complete()
      }
      return
    }
    if (!obj.name) {
      console.error('请传入文件名称!!!')
      if (self.isFunction(obj.fail)) {
        obj.fail()
      }
      if (self.isFunction(obj.complete)) {
        obj.complete()
      }
      return
    }
    wepy.showToast({title: '后台下载文件中,请不要关闭小程序', icon: 'none'})
    wepy.downloadFile({
      url: obj.filePath,
      filePath: `${wx.env.USER_DATA_PATH}/${obj.name}`,
      success: function (res) {
        wx.getFileInfo({
          filePath: res.filePath,
          digestAlgorithm: 'sha1',
          success(info) {
            let downFile = wx.getStorageSync('downFile')
            downFile = downFile || {}
            let fileData = {
              id: info.digest,
              name: obj.name,
              path: res.filePath,
              size: info.size,
              fileType: self.getFileType(obj.name),
              date: new Date(),
              formatSize: self.bytesToSize(info.size || 0),
              formatDate: self.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')
            }
            fileData.icon = self.getPhotoByFileType(fileData.fileType)
            downFile[info.digest] = fileData
            wx.setStorageSync('downFile', downFile)
            wepy.showToast({title: `下载成功,请到"我>我的下载"查看文件`, icon: 'none'})
          }
        })
        if (self.isFunction(obj.success)) {
          obj.success()
        }
      },
      fail(e) {
        wepy.showToast({title: '文件下载失败,请稍后重试', icon: 'none'})
        if (self.isFunction(obj.fail)) {
          obj.fail(e)
        }
      },
      complete() {
        if (self.isFunction(obj.complete)) {
          obj.complete()
        }
      }
    })
  },
  isFunction(fn) {
    let r = false
    if (fn && fn instanceof Function) {
      r = true
    }
    return r
  }
}
module.exports = utils
