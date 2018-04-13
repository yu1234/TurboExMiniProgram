import wepy from 'wepy'
import {twCallBeanPromise} from './twmodule'
import {getSessionId} from '../config'

export default class Twrajax {
  constructor() {
    this.intervalObj = null
    this.intervalDuration = 5000
  }

  /**
   * 开始轮询
   *
   * @param d:
   *            指定轮询间隔时间（默认twrajax_option.interval_duration）
   */
  startPolling() {
    this.intervalObj = setInterval(() => {
      this.poll()
    }, this.intervalDuration)
  }

  cancelPolling() {
    if (this.intervalObj) {
      clearInterval(this.intervalObj)
    }
  }

  /**
   * 轮询一次服务器
   */
  poll() {
    if (getSessionId()) {
      twCallBeanPromise('web.update', {sessionid: getSessionId()}).then((ret) => {
        if (ret.beanparam.retcode !== 0) {
          wepy.showToast({
            title: '会话超时,请重新登陆',
            icon: 'none',
            complete() {
              setTimeout(() => {
                wx.redirectTo({
                  url: '/pages/logout/logout'
                })
              }, 1000)
            }
          })
        }
      }).catch(() => {
        wepy.showToast({
          title: '与服务器断开连接',
          icon: 'none',
          complete() {
            setTimeout(() => {
              wx.redirectTo({
                url: '/pages/logout/logout'
              })
            }, 1000)
          }
        })
      })
    }
  }
}
