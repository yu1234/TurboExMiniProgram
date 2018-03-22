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
            let error = new Error(errMsg.errMsg)
            reject(error)
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
    let src = `${service.host}/getfile?file=${g}&_isattach=${isAttach || false}&_binindex=${_binindex}&ts=${twCurrentMills()}&wid=${getWid()}&_sessionid=${getSessionId()}`
    return src
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

module.exports = twmodule
