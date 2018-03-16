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
  }
}
module.exports = utils
