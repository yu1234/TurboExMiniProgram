import {service, getSessionId, getWid} from '../config'
import {defaultErrors} from './utils'
import wepy from 'wepy'

let twFormatCallBeanID = function (cmd, param, filetype) {
  let g = ''
  if (!filetype || filetype === '') {
    g = encodeURIComponent(['$$callbean$', cmd, '$',
      JSON.stringify(param), '$$'].join(''))
  } else {
    g = encodeURIComponent(['$$callbean$', cmd, '$',
      JSON.stringify(param), '$', filetype, '$$'].join(''))
  }
  return g
}

// 获取当前时间戳
function twCurrentMills() {
  let preTs = 0
  var ts = parseInt((new Date()).valueOf())
  var ret = 0
  if (preTs === ts) {
    ret = ts + 1
  } else {
    ret = ts
  }
  return ret
}

let twmodule = {
  twCallBeanPromise(cmd, params, paramattr, complete) {
    let reqparams = {}
    let requestObj = {}
    let sessionId = getSessionId()
    let wid = getWid()
    reqparams.sessionid = sessionId
    reqparams.param = params || {}

    let action = paramattr && typeof paramattr === 'string' ? paramattr : (paramattr && paramattr.action ? paramattr.action : '')
    let password = paramattr && paramattr.password ? paramattr.password : ''

    let jsonStr = JSON.stringify(reqparams)
    requestObj.jsonstr = jsonStr
    let reqUrl = `${service.host}/opt.action?cmd=${cmd}`
    if (action) {
      reqUrl += '&action=' + action
    }
    if (password) {
      reqUrl += '&password=' + password
    }
    let cookie = ''
    if (sessionId) {
      cookie = `JSESSIONID=${sessionId};`
      reqparams.param['_sessionid'] = sessionId
      reqUrl += '&_sessionid=' + sessionId
    }
    if (wid) {
      cookie += `tw${wid}=${sessionId};`
      reqUrl += '&wid=' + wid
    }

    return new Promise(function (resolve, reject) {
      wepy.request({
        url: reqUrl,
        data: requestObj,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Cookie': cookie
        },
        success: function (data) {
          let ret = {}
          if (data) {
            if (data.statusCode === 200) {
              ret.beanparam = data.data || {}
              ret.beanparam.data = ret.beanparam.data || {}
              ret.statusCode = data.statusCode
              ret.header = data.heade
              if (ret.beanparam.data.contents && ret.beanparam.data.contents.length > 0) {
                ret.beanparam.data.contents = filterContents(cmd, params, ret.beanparam.data.contents)
              }
              resolve(ret)
            } else {
              reject(defaultErrors.serverError)
            }
          } else {
            reject(defaultErrors.serverError)
          }
        },
        fail: function (errMsg) {
          if (errMsg) {
            if (errMsg.errMsg !== 'request:fail timeout') {
              let error = new Error(errMsg.errMsg)
              reject(error)
            }
          } else {
            reject(defaultErrors.networkError)
          }
        },
        complete: function () {
          if (complete && complete instanceof Function) {
            complete()
          }
        }
      })
    })
  },
  twFormatGetFileCallBeanUri(cmd, param, filetype, isAttach, binindex) {
    var g = twFormatCallBeanID(cmd, param, filetype)
    var _binindex = -1
    if (binindex) {
      _binindex = binindex
    }
    let src = `${service.host}/getfile?file=${g}&_isattach=${isAttach || false}&_binindex=${_binindex}&ts=${twCurrentMills()}&wid=${getWid()}&_sessionid=${getSessionId()}&a=f.${filetype}`
    return src
  },
  /**
   * 验证callbean 是否添加权限
   */
  checkHasPermit(beanid, params, okText, cancelText) {
    return new Promise(function (resolve, reject) {
      let beansno = ''
      twmodule.twCallBeanPromise(beanid, params, 'getbeansno').then((ret) => {
        beansno = ret.beanparam.data.sno
        return twmodule.twCallBeanPromise('accessright.callbean.permit.password.isexist', {
          beanid: beanid,
          beansno: beansno
        })
      }).then((ret) => {
        let isexist = ret.beanparam.data.isexist;
        if (isexist) {
          resolve(true)
        } else {
          resolve(false)
        }
      })
    })
  },
  /**
   * 邮件发送
   * @param sendMail
   * @param params
   */
  sendMail(sendMail, params) {
    return new Promise(function (resolve, reject) {
      if (sendMail) {
        params = params || {}
        // 配额查询确认
        let sendAndSave = params.sendAndSave || true
        let maxRcpts = params.maxRcpts || -1
        let sendMailMaxSize = params.sendMailMaxSize || -1

        sendMail.mailid ? sendMail.mailid = sendMail.mailid : void(0);
        sendMail.foldercode = 'send';// 保存在已发送
        if (!sendMail.tos || sendMail.tos.length <= 0) {
          reject(defaultErrors.customError('请填写收件人后再发送'));
          return
        }
        // check 'max_rcpts'
        if (maxRcpts > 0) {
          let sum = 0
          sum += sendMail.tos ? sendMail.tos.length : 0
          sum += sendMail.ccs ? sendMail.ccs.length : 0
          sum += sendMail.bccs ? sendMail.bccs.length : 0
          if (sum > maxRcpts) {
            reject(defaultErrors.customError('收件人数量限制'))
            return
          }
        }
        // check 'sendmail_max_size'
        if (sendMail.attachs && sendMail.attachs.length > 0 && sendMailMaxSize > 0) {
          var sum = 0
          for (let i = 0, len = sendMail.attachs.length; i < len; i++) {
            let at = sendMail.attachs[i];
            if (at.file.indexOf('$$temp$') !== 0) continue
            sum += parseInt(at.filesize)
          }
          let sumM = Math.floor(sum / 1024 / 1024)
          if (sendMailMaxSize <= sumM) {
            reject(defaultErrors.customError('发送邮件大小限制：' + sendMailMaxSize + 'M'))
            return
          }
        }
        // 其他属性处理
        // 时间点 定时发送，如果有，则用指定时间点进行发送
        // 其他属性处理
        // 时间点 定时发送，如果有，则用指定时间点进行发送
        sendMail.sendtime = sendMail.sendtime ? sendMail.sendtime : void(0)
        // false/true 是否需要回执
        sendMail.neednotification = sendMail.neednotification ? sendMail.neednotification : void(0)
        // false/true  是否用群发单显
        sendMail.sendsingle = sendMail.sendsingle ? sendMail.sendsingle : void(0)
        // 信纸编号
        sendMail.stationery = sendMail.stationery ? sendMail.stationery : void(0)
        // 优先级(紧急为 1) 可以不填，不填表示不设定
        sendMail.priority = sendMail.priority ? sendMail.priority : void(0)
        // high 重要度（high为重要）可以不填
        sendMail.importance = sendMail.importance ? sendMail.importance : void(0)
        // 安全邮件
        sendMail.sec_class = sendMail.sec_class ? sendMail.sec_class : void(0)

        let callbean = sendAndSave ? 'mail.client.sendandsave' : 'mail.client.send'
        if (!sendMail.subject) {
          wx.showModal({
            title: '提示',
            content: '您的邮件没有填写主题,您确定继续发送?',
            success(res) {
              if (res.confirm) {
                twmodule.twCallBeanPromise(callbean, sendMail).then((ret) => {
                  if (ret) {
                    if (ret.beanparam.retcode === 0) {
                      var result = {}
                      ret.beanparam.data.mailid ? result.mailid = ret.beanparam.data.mailid : void(0)
                      ret.beanparam.data.prid ? result.prid = ret.beanparam.data.prid : void(0)
                      resolve(result)
                    } else {
                      reject(defaultErrors.customError(ret.beanparam.retdesc))
                    }
                  } else {
                    reject(defaultErrors.customError('连接不到服务器'))
                  }
                })['catch'](function (e) {
                  reject(defaultErrors.customError('邮件发送失败'))
                })
              } else if (res.cancel) {
              }
            }
          })
        } else {
          twmodule.twCallBeanPromise(callbean, sendMail).then((ret) => {
            if (ret) {
              if (ret.beanparam.retcode === 0) {
                var result = {}
                ret.beanparam.data.mailid ? result.mailid = ret.beanparam.data.mailid : void(0)
                ret.beanparam.data.prid ? result.prid = ret.beanparam.data.prid : void(0)
                resolve(result)
              } else {
                reject(ret.beanparam.retdesc)
              }
            } else {
              reject(defaultErrors.customError('连接不到服务器'))
            }
          })['catch'](function (e) {
            reject(defaultErrors.customError('邮件发送失败'))
          })
        }
      } else {
        reject(defaultErrors.networkError)
      }
    })
  },
  /**
   * 文件上传
   */
  uploadFile(filePath, formData) {
    if (filePath) {
      formData = formData || {}
      formData.wid = getWid()
      let name = filePath.substring(filePath.lastIndexOf('/') + 1, filePath.length).toLowerCase() || ''
      formData.name = name
      formData.id = twCurrentMills()
      let url = service.uploadUrl + '?'
      Object.keys(formData).map(key => {
        url += encodeURIComponent(key) + '=' + encodeURIComponent(formData[key]) + '&'
      })
      let params = {
        filePath: filePath,
        name: 'file',
        url: url,
        header: {'content-type': 'application/octet-stream'},
        success(res) {
          console.log('uploadFile.success', res)
        },
        fail(res) {
          console.log('uploadFile.fail', res)
        },
        complete() {
        }

      }
      wepy.uploadFile(params)
    }
  }
}

function filterContents(cmd, params, contents) {
  let retContents = []
  for (let i = 0, len = contents.length; i < len; i++) {
    let retO = {}
    let o = contents[i]
    let content = o['content']
    let contenttype = o['content-type']
    // 正则获取图片路径
    let patt = new RegExp('(?:src=.{1})(\\${2}(\\w+)\\${1}([a-zA-Z0-9._]+)\\${1}([a-zA-Z0-9._}{"\':]+)\\${0,1}(\\w*)\\${2})', 'g')
    // BEGIN WHILE：循环处理content中的符合正则要求（资源id的格式）的字符串
    let ret
    while (ret = patt.exec(content)) { // 存在$$[from]$[...]$[...]$$则拼接成callbean类型的资源ID，详见文档“TurboTech文件资源id说明文档”
      let src = ret[1]
      let from = ret[2]
      let isattach = false
      let wid = getWid()
      let newSrc = ''
      let g = ''// 获取必要信息
      // 处理self类型的资源ID
      if (from === 'self') {
        let binindex = ret[3]
        let filetype = ret[4]
        g = ret[0]
        // 开始拼接callbean类型id格式
        /* $$callbean$[beanid]$[params]$[filetype]$$ */
        src = src.replace(from, 'callbean')
        src = src.replace(binindex, cmd)
        src = src.replace(filetype, JSON.stringify(params))
        src = src.substring(0, src.length - 1) + filetype + '$$'
        src = encodeURIComponent(src)
        if (wid) {
          // 拼接成新的url，调用名为getfile的servlet
          newSrc = `${service.host}/getfile?file=${src}&wid=${wid}&ts=${twCurrentMills()}&_binindex=${binindex}&_isattach=${isattach}&_sessionid=${getSessionId()}`
        } else {
          return
        }
        // 处理callbean类型的资源ID
      } else if (from === 'callbean') {
        src = encodeURIComponent(src)
        g = ret[0]
        newSrc = `${service.host}/getfile?file=${src}&wid=${wid}&ts=${twCurrentMills()}&_binindex=0&_isattach=${isattach}&_sessionid=${getSessionId()}`
      }
      g = g.replace(ret[1], newSrc)
      while (content.indexOf(ret[1]) !== -1) {
        content = content.replace(ret[0], g)
      }
    }
    let ret2
    let patt2 = new RegExp('(?:src=.{1})(\\${2}tuid\\${1,2}([a-zA-Z0-9._]+)\\${2})', 'g')
    while (ret2 = patt2.exec(content)) {
      let tuid = ret2[2]
      let wid = getWid()
      let newSrc = ''
      let src2 = ''
      // 如果是getlist获取，不存在bin部分，则去对于的get通过tuid获取
      cmd = cmd.replace(/getlist/g, 'get')
      src2 = `$$callbean$${cmd}$${JSON.stringify({tuid: tuid})}$unknow$$`
      src2 = encodeURIComponent(src2)
      if (wid) {
        newSrc = `${service.host}/getfile?file=${src2}&wid=${wid}&ts=${twCurrentMills()}&_binindex=0&_isattach=false&_sessionid=${getSessionId()}`
      } else {
        return
      }
      while (content.indexOf(ret2[1]) !== -1) {
        content = content.replace(ret2[1], newSrc)
      }
    }
    retO['content'] = content
    retO['content-type'] = contenttype
    retContents.push(retO)
  }
  return retContents
}

function promiseNext(ret) {
  return new Promise(function (resolve, reject) {
    resolve(ret);
  });
}

module.exports = twmodule
