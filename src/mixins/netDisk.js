import wepy from 'wepy'
import BaseMixin from './base'
import {twCallBeanPromise} from '../utils/twmodule'

export default class NetDiskMixin extends wepy.mixin {
  mixins = [BaseMixin]
  data = {
    tabs: []
  }
  methods = {
    tabChange(e) {
      let index = e.detail.key || 0
      if (this.tabs[index]) {
        let tab = this.tabs[index]
        this.getNetDiskDir(tab.dirCallBean, tab.dirId, {}, tab).then((dirs) => {
        })
      }
    }
  }

  onShow() {
  }

  onLoad() {
  }

  /**
   * 获取网络硬盘文件夹
   * @param cmd
   * @param pid
   * @param params
   * @param tab
   * @return {Promise<any>}
   */
  getNetDiskDir(cmd, pid, params, tab) {
    return new Promise((resolve) => {
      if (tab && tab.id && tab.dirCallBean) {
        let flag = true
        if (tab.id === 'workgroup' && pid !== '0') {
          flag = false
        }
        var callBean = tab.dirCallBean
        if (!params) {
          params = {}
        }
        if (callBean && flag) {
          if (pid) {
            params[tab.config.dirPidKey || 'id'] = pid
          }
          debugger
          twCallBeanPromise(callBean, params).then((ret) => {
            console.log(ret)
            let r = formatNetDiskDir(tab)
            resolve(r)
          })
        } else {
          resolve([])
        }
      }
    })
  }

  /**
   * 格式话网络硬盘对象结构
   * @param srcDir
   */
  formatNetDiskDir(srcDir, tab) {
    if (this.isArrayNotNull(srcDir)) {
      let distDir = []
      this.each(srcDir, (dir, i) => {
        if (dir[tab.config.dirIdKey || 'id']) {
          let temp = {
            id: dir[tab.config.dirIdKey || 'id'],
            icon: tab.config.dirPhoto,
            name: dir[tab.config.dirNameKey || 'name'] || '无名称'
          }
          distDir.push(temp)
        }
      })
      return distDir
    } else {
      return []
    }
  }
}
