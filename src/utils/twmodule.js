import {service, getSessionId, getWid} from '../config.js'
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
              ret.statusCode = data.statusCode
              ret.header = data.heade
              resolve(ret)
            } else {
              let error = new Error('请求数据失败')
              reject(error)
            }
          } else {
            let error = new Error('请求数据失败')
            reject(error)
          }
        },
        fail: function (errMsg) {
          if (errMsg) {
            let error = new Error(errMsg.errMsg)
            reject(error)
          } else {
            let error = new Error('请求数据失败')
            reject(error)
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
    let src = `${service.host}/getfile?file=${g}&_isattach=${isAttach || false}&_binindex=${_binindex}&ts=${twCurrentMills()}&wid=${getWid()}`
    return src
  }
}
module.exports = twmodule
