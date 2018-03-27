import wepy from 'wepy'
import {twCallBeanPromise, twFormatGetFileCallBeanUri} from '../utils/twmodule'
import {localTempFileCache} from '../cache'
import {defaultErrors, strFormatDate} from '../utils/utils'
import BaseMixin from './base'

export default class CommonMixin extends wepy.mixin {
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
    gif: 'img'
    /* mp4: 'video',
     avi: 'video',
     rmvb: 'video',
     rm: 'video',
     asf: 'video',
     divx: 'video',
     mpg: 'video',
     flv: 'video',
     mpeg: 'video',
     mpe: 'video',
     wmv: 'video',
     mkv: 'video' */
  }
  mixins = [BaseMixin]
  data = {
    fileSystemManager: null
  }
  methods = {}

  onLoad() {
    this.fileSystemManager = wepy.getFileSystemManager()
  }

  /**
   * 获取邮件by id
   * @param id 邮件id
   * @param password 密码
   * @returns {Promise<any>}
   */
  getMailById(id, password) {
    return new Promise((resolve, reject) => {
      if (id) {
        twCallBeanPromise('mail.client.get', {mailid: id}, {'password': password}).then((ret) => {
          if (ret.beanparam.data && ret.beanparam.data.mailid) {
            let data = ret.beanparam.data
            console.log(data)
            this.formatMailObj(data).then((mail) => {
              resolve(mail)
            })
          } else if (ret.beanparam.retcode === 121) {
            reject(defaultErrors.customError('密码错误'))
          } else {
            reject(defaultErrors.customError('获取邮件失败,请重新打开邮件'))
          }
        }).catch(function (r) {
          reject(defaultErrors.networkError)
        })
      } else {
        reject(defaultErrors.customError('获取邮件失败,请重新打开邮件'))
      }
    })
  }

  formatMailObj(mailObj) {
    return new Promise(resolve => {
      if (mailObj) {
        let from = mailObj.from || {}
        let oTos = mailObj.tos || []
        let oCcs = mailObj.ccs || []
        let oBccs = mailObj.bccs || []
        let rcpts = mailObj.rcpts || []
        let rcpttos = mailObj.rcpttos || []
        let rcptMap = {}
        let contents = mailObj.contents || []
        let content = this.getMailContent(mailObj.mailid, contents) || ''
        let fullTitle = ''
        let headerPhoto = 'null'
        if (from.name) {
          fullTitle = `${from.name}<${from.account}>`
        } else {
          fullTitle = from.account
        }
        if (mailObj.fromid) {
          headerPhoto = twFormatGetFileCallBeanUri('config.user.head.get', {
            'isattach': false,
            id: mailObj.fromid
          })
        } else {
          headerPhoto = `/assets/av1.png`
        }
        this.each(rcpttos, (v, i) => {
          rcptMap[v] = rcpts[i]
        })
        let mail = {
          id: mailObj.mailid,
          address: from.account || '',
          title: `${from.name || (from.account || '暂无')}`,
          subject: mailObj.subject,
          fromId: mailObj.fromid,
          fullTitle: fullTitle,
          headerPhoto: headerPhoto,
          time: mailObj.rcpttime,
          formatTime: strFormatDate(mailObj.rcpttime, 'yyyy/MM/dd hh:mm'),
          contents: contents,
          content: content,
          attaches: this.attachesFormat(mailObj.attachs, mailObj.mailid)
        }
        let calls = [this.formatMailPeople(oTos, rcptMap), this.formatMailPeople(oCcs, rcptMap), this.formatMailPeople(oBccs, rcptMap)]
        Promise.all(calls).then((rets) => {
          mail.tos = rets[0] ? rets[0].data : []
          mail.tosFormatName = rets[0] ? rets[0].formatName : ''
          mail.ccs = rets[1] ? rets[1].data : []
          mail.bccs = rets[2] ? rets[2].data : []
          resolve(mail)
        })
      } else {
        resolve({})
      }
    })
  }

  formatMailPeople(oTos, rcptMap) {
    return new Promise((resolve) => {
      let ids = []
      let nTos = []
      let formatName = ''
      this.each(oTos, (v, i) => {
        if (v.account) {
          if (v.account.indexOf('@') === -1) {
            ids.push(v.account)
          } else {
            let temp = {
              id: rcptMap[v.account],
              address: v.account,
              type: 'ur'
            }
            if (temp.id) {
              if (temp.id.indexOf('@') === -1) {
                if (v.name) {
                  temp.name = v.name.replace(/"/g, '')
                } else {
                  temp.name = v.account
                }
                temp.headerPhoto = twFormatGetFileCallBeanUri('config.user.head.get', {
                  'isattach': false,
                  id: temp.id
                })
              } else {
                temp.headerPhoto = `/assets/av1.png`
              }
            } else {
              temp.headerPhoto = `/assets/av1.png`
            }
            formatName += `${temp.name || temp.address};`
            nTos.push(temp)
          }
        }
      })
      if (this.isArrayNotNull(ids)) {
        this.getNamesBySysId(ids).then((map) => {
          this.each(map, (v, k) => {
            let type = this.getSysIdType(k)
            let temp = {
              id: k,
              type: type,
              name: v
            }
            if (type === 'wg') {
              temp.headerPhoto = '/assets/images/group.png'
            } else if (type === 'og') {
              temp.headerPhoto = `/assets/images/org.png`
            } else {
              temp.headerPhoto = `/assets/av1.png`
            }
            formatName += `${temp.name};`
            nTos.push(temp)
          })
          resolve({data: nTos, formatName: formatName})
        })
      } else {
        resolve({data: nTos, formatName: formatName})
      }
    })
  }

  /**
   * 获取全路径（如果id是组织部门id）或名字
   * @param ids
   * @returns
   */
  getNamesBySysId(ids) {
    return new Promise((resolve, reject) => {
      let ogs = []
      let others = []
      let calls = []
      this.each(ids, (id, i) => {
        id.indexOf('og') === 0 ? ogs.push(id) : others.push(id)
      })
      calls.push(twCallBeanPromise('du.util.getname', {
        ids: others
      }))
      calls.push(twCallBeanPromise('du.util.getdeptfullpath', {
        ids: ogs
      }))
      Promise.all(calls).then((rets) => {
        var ret = {}
        var mapName = rets[0].beanparam.data.map
        var mapDeptFullPath = rets[1].beanparam.data.map

        this.each(mapName, (v, k) => {
          if (v) {
            ret[k] = v
          }
        })
        this.each(mapDeptFullPath, (v, k) => {
          if (v) {
            ret[k] = v
          }
        })
        resolve(ret)
      }).catch(() => {
        resolve({})
      })
    })
  }

  /**
   * 获取idtype、datatype
   *
   * @param id
   * @returns
   */
  getSysIdType(id) {
    let typename = id.indexOf('ur') === 0 ? 'ur'
      : id.indexOf('og') === 0 ? 'og' : id.indexOf('wg') === 0 ? 'wg'
        : id.indexOf('ta') === 0 ? 'ta'
          : id.indexOf('rg') === 0 ? 'rg'
            : id.indexOf('pt') === 0 ? 'pt' : id
              .indexOf('_nf_') !== -1 ? 'nf' : ''
    return typename
  }

  /**
   * 获取邮件正文对象
   * @param contents
   * @return {*}
   */
  getMailContent(mailId, contents) {
    if (!this.isArrayNotNull(contents)) {
      return null
    }
    let content = null
    for (let i = 0, len = contents.length; i < len; i++) {
      let ctn = contents[i]
      if (ctn['content-type'] === 'text/html') {
        content = ctn.content
        content = this.mailContentFilter(mailId, content)
        break
      }
    }
    if (!content) {
      if (contents[0].content) {
        content = this.formatPlainCtn(contents[0].content)
      }
    }
    return content
  }

  /**
   * 邮件内容过滤
   * @param mailId
   * @param htmlContent
   * @returns {*}
   */
  mailContentFilter(mailId, htmlContent) {
    if (htmlContent) {
      // 过滤class
      htmlContent = htmlContent.replace(/(<.*?)class\s*=.*?(\w+\s*=|\s*>)/gi, '$1 $2')
      // 将img标签路径转换成有效路径
      htmlContent = this.transferCID2IMGInMail(mailId, htmlContent)
      // 将img标签宽度设置为100%
      htmlContent = htmlContent.replace(/(<img.*?)(\w+\s*=|\s*)(\/>)/gi, "$1 $2 width='100%' $3")
      // 清除无效节点
      htmlContent = this.clearHtmlContent(htmlContent)
      return htmlContent
    } else {
      return '<div></div>'
    }
  }

  /**
   * 整理text/plain内容
   *
   * @param ctn_plain
   * @returns
   */
  formatPlainCtn(ctnPlain) {
    if (ctnPlain) {
      ctnPlain = ctnPlain.replace(/((\r\n){1})/g, '<br/>')
      ctnPlain = ctnPlain.replace(/(\r{1}|\n{1})/g, '<br/>')
      ctnPlain = ctnPlain.replace(/(\t{1})/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
      ctnPlain = ctnPlain.replace(/(\s{1})/g, '&nbsp;')
      ctnPlain = ctnPlain.replace(/(href="((?:http|ftp|https):\/\/[\w\-_]+(?:\.[\w\-_]+)+(?:[\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?)")/g, 'href="$2" style="color: #2799ec;font-weight: bold;" target="_blank"')
      ctnPlain = ctnPlain.replace(/\S*?((?:http|ftp|https):\/\/[\w\-_]+(?:\.[\w\-_]+)+(?:[\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?)/g,
        function (m, c) {
          if (m.indexOf('href=') !== -1 || m.indexOf('src=') !== -1) {
            return m
          }
          let ret = m.replace(c, '<a href="' + c + '" style="color: #2799ec;font-weight: bold;" target="_blank">' + c + '</a>')
          return ret
        })
      return ctnPlain
    } else {
      return '<div></div>'
    }
  }

  /**
   * 将img标签路径转换成有效路径
   * @param content
   */
  transferCID2IMGInMail(mailid, content) {
    let patt = new RegExp('(?:src=")(cid:[^"]*?)"', 'g')
    let ret
    while (ret = patt.exec(content)) {
      let cid = ret[1].substring(ret[1].indexOf(':') + 1, ret[1].length)
      let p = {mailid: mailid, content_id: cid}
      let src = twFormatGetFileCallBeanUri('mail.client.getattach', p, 'jpg', false)
      let patStr = ret[1].replace(/\\$/g, '\\\\$')
      let pat = new RegExp(patStr, 'g')
      content = content.replace(pat, src)
    }
    return content
  }

  /**
   * 清理html字符串。（比如style标签需要清理，否则会影响全局样式；a标签上的href属性需要替换成javascript:;，页面的跳转我们需要做统一处理）
   *
   * @param ctn_html
   *            页面，html字符串
   */
  clearHtmlContent(ctnHtml) {
    if (ctnHtml) {
      ctnHtml = ctnHtml.replace(/<(?:STYLE)[^>]*?>[^<]*?<\/STYLE>/g, '')
      ctnHtml = ctnHtml.replace(/<style[^>]*?>[^<]*?<\/style>/g, '')
      ctnHtml = ctnHtml.replace(/<script[^>]*?>[^<]*?<\/script>/g, '')
      ctnHtml = ctnHtml.replace(/<SCRIPT[^>]*?>[^<]*?<\/SCRIPT>/g, '')
      ctnHtml = ctnHtml.replace(/<meta[^>]*?>/g, '')
      ctnHtml = ctnHtml.replace(/<META[^>]*?>/g, '')
      ctnHtml = ctnHtml.replace(/target=_blank/g, '')
      let frontIndex = ctnHtml.indexOf('<BODY') !== -1 ? ctnHtml
        .indexOf('<BODY') : ctnHtml.indexOf('<body')
      let rearIndex = ctnHtml.indexOf('</BODY') !== -1 ? ctnHtml
        .indexOf('</BODY') : ctnHtml.indexOf('</body')
      let ret = ctnHtml.substring(frontIndex, rearIndex).replace(/<BODY[^>]*?>[\\s\\S]*/g, '') || ctnHtml
      return ret
    } else {
      return null
    }
  }

  attachesFormat(attaches, mailId) {
    if (this.isArrayNotNull(attaches)) {
      let newAttaches = []
      this.each(attaches, (attach, i) => {
        if (attach.atid) {
          let temp = {
            id: attach.atid,
            name: attach.filename || '暂无',
            size: attach.len || 0,
            formatSize: this.bytesToSize(attach.len || 0)
          }
          let fileType = this.getFileType(temp.name)
          let p = {mailid: mailId, atid: attach.atid, filename: temp.name}
          let src = twFormatGetFileCallBeanUri('mail.client.getattach', p, fileType, true)
          temp.downloadUrl = src
          temp.icon = this.getPhotoByFileType(fileType)
          newAttaches.push(temp)
        }
      })
      return newAttaches
    } else {
      return []
    }
  }

  getFileType(name) {
    if (name) {
      let fileType = name.substring(name.lastIndexOf('.') + 1, name.length).toLowerCase() || ''
      return fileType
    } else {
      return ''
    }
  }

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
  }

  /**
   * 附件预览
   * @param obj
   */
  attachPreview(obj) {
    return new Promise(resolve => {
      if (obj) {
        if (obj.name) {
          let fileType = this.getFileType(obj.name)
          let can = this.checkCanPreview(fileType)
          if (can === 'word') {
            this.previewWordFile({
              id: obj.id,
              filePath: obj.src,
              fileType: fileType,
              success(tempPath) {
                resolve(true)
              },
              fail() {
                resolve(false)
              }
            })
          } else if (can === 'img') {
            this.previewImgFile({
              id: obj.id,
              filePath: obj.src,
              fileType: fileType,
              success(tempPath) {
                resolve(true)
              },
              fail() {
                resolve(false)
              }
            })
          } else if (can === 'video') {
            this.previewVideoFile({
              id: obj.id,
              name: obj.name,
              filePath: obj.src,
              fileType: fileType,
              mailId: obj.mailId,
              success(tempPath) {
                resolve(true)
              },
              fail() {
                resolve(false)
              }
            })
          } else {
            this.previewOtherFile({
              id: obj.id,
              filePath: obj.src,
              fileType: fileType,
              success(tempPath) {
                resolve(true)
              },
              fail() {
                resolve(false)
              }
            })
          }
        } else {
          resolve(false)
        }
      } else {
        resolve(false)
      }
    })
  }

  /**
   * 检测是否可以预览
   * @param fileType
   * @return 预览类型
   */
  checkCanPreview(fileType) {
    if (this.canPreviewObj[fileType]) {
      return this.canPreviewObj[fileType]
    } else {
      return false
    }
  }

  /**
   * 文本预览
   */
  previewWordFile(OBJECT) {
    let self = this
    if (!OBJECT) {
      if (self.isFunction(OBJECT.fail)) {
        OBJECT.fail()
      }
      if (self.isFunction(OBJECT.complete)) {
        OBJECT.complete()
      }
      return
    }
    wepy.showLoading({title: '加载文件中...'})
    if (!localTempFileCache[OBJECT.id]) {
      wepy.downloadFile({
        url: OBJECT.filePath,
        success: function (res) {
          var filePath = res.tempFilePath
          console.log(filePath)
          wepy.openDocument({
            filePath: filePath,
            fileType: OBJECT.fileType,
            success() {
              wepy.hideLoading()
              if (OBJECT.id) {
                localTempFileCache[OBJECT.id] = filePath
              }
              if (self.isFunction(OBJECT.success)) {
                OBJECT.success()
              }
            },
            fail(e) {
              wepy.hideLoading()
              wepy.showToast({title: '预览失败,请检测文件是否损坏', icon: 'none'})
              if (self.isFunction(OBJECT.fail)) {
                OBJECT.fail(e)
              }
            },
            complete() {
              wepy.hideLoading()
              if (self.isFunction(OBJECT.complete)) {
                OBJECT.complete()
              }
            }
          })
        },
        fail(e) {
          wepy.hideLoading()
          wepy.showToast({title: '预览失败,请检测文件是否损坏', icon: 'none'})
          if (self.isFunction(OBJECT.fail)) {
            OBJECT.fail(e)
          }
        },
        complete() {
          wepy.hideLoading()
          if (self.isFunction(OBJECT.complete)) {
            OBJECT.complete()
          }
        }
      })
    } else {
      wepy.openDocument({
        filePath: localTempFileCache[OBJECT.id],
        fileType: OBJECT.fileType,
        success() {
          wepy.hideLoading()
          if (self.isFunction(OBJECT.success)) {
            OBJECT.success()
          }
        },
        fail(e) {
          wepy.hideLoading()
          wepy.showToast({title: '预览失败,请检测文件是否损坏', icon: 'none'})
          if (self.isFunction(OBJECT.fail)) {
            OBJECT.fail(e)
          }
        },
        complete() {
          wepy.hideLoading()
          if (self.isFunction(OBJECT.complete)) {
            OBJECT.complete()
          }
        }
      })
    }
  }

  /**
   * 图片预览
   * @param obj
   */
  previewImgFile(obj) {
    let self = this
    if (!obj) {
      if (self.isFunction(obj.fail)) {
        obj.fail()
      }
      if (self.isFunction(obj.complete)) {
        obj.complete()
      }
      return
    }
    wepy.showLoading({title: '加载图片中...'})
    wepy.previewImage({
      urls: [obj.filePath], // 需要预览的图片http链接列表
      success: function (res) {
        wepy.hideLoading()
        if (self.isFunction(obj.success)) {
          obj.success()
        }
      },
      fail(e) {
        wepy.hideLoading()
        wepy.showToast({title: '预览失败,请检测文件是否损坏', icon: 'none'})
        if (self.isFunction(obj.fail)) {
          obj.fail(e)
        }
      },
      complete() {
        wepy.hideLoading()
        if (self.isFunction(obj.complete)) {
          obj.complete()
        }
      }

    })
  }

  /**
   * 视频预览
   */
  previewVideoFile(obj) {
    let self = this
    if (!obj) {
      if (self.isFunction(obj.fail)) {
        obj.fail()
      }
      if (self.isFunction(obj.complete)) {
        obj.complete()
      }
      return
    }
    if (obj.filePath) {
      let p = {
        id: obj.id,
        name: obj.name,
        fileType: obj.fileType,
        type: 'attach',
        mailId: obj.mailId

      }
      let params = JSON.stringify(p)
      self.loadPage(`/pages/video/video?params=${params}`)
    } else {
      wepy.showToast({title: '播放失败,请检测文件是否损坏', icon: 'none'})
      obj.fail()
    }
  }

  /**
   * 其他文件预览处理
   */
  previewOtherFile(obj) {
    wepy.showToast({title: '对不起,该附件不支持预览', icon: 'none'})
  }

  downloadFile(obj) {
    let self = this
    if (!obj) {
      if (self.isFunction(obj.fail)) {
        obj.fail()
      }
      if (self.isFunction(obj.complete)) {
        obj.complete()
      }
      return
    }
    wepy.showLoading({title: '下载中...'})
    wepy.downloadFile({
      url: obj.filePath,
      success: function (res) {
        debugger
        console.log(`${wx.env.USER_DATA_PATH}`)
        wepy.hideLoading()
        self.fileSystemManager.access({
          path: res.tempFilePath,
          success() {
            console.log('.fileSystemManager.acess success')
          },
          fail(e) {
            console.log('.fileSystemManager.acess', e)
          }
        })
        if (self.isFunction(obj.success)) {
          obj.success()
        }
      },
      fail(e) {
        wepy.hideLoading()
        wepy.showToast({title: '文件下载失败,请稍后重试', icon: 'none'})
        if (self.isFunction(obj.fail)) {
          obj.fail(e)
        }
      },
      complete() {
        wepy.hideLoading()
        if (self.isFunction(obj.complete)) {
          obj.complete()
        }
      }
    })
  }

  /**
   * 获取文件类型图片
   *
   * @param filetype
   *            文件类型
   * @returns
   */
  getPhotoByFileType(fileType) {
    let fileTypeRel = {
      zip: '/assets/images/attachment_icon_compressed_m_default.png',
      tar: '/assets/images/attachment_icon_compressed_m_default.png',
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
  }
}
