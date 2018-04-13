import wepy from 'wepy'
import {twCallBeanPromise, twFormatGetFileCallBeanUri} from '../utils/twmodule'
import {bytesToSize, strFormatDate, getPhotoByFileType} from '../utils/utils'

export default class NetDiskMixin extends wepy.mixin {
  data = {
    netDiskMixin: {
      backIcon: '/assets/images/file_icon_back_m_default.png'
    },
    currentTabIndex: 0,
    tabs: []
  }
  methods = {
    tabChange(e) {
      let index = e.detail.key || 0
      if (this.tabs[index]) {
        this.currentTabIndex = index
        wepy.showLoading({title: '加载中...'})
        this.refresh().then(() => {
          wepy.hideLoading()
        })
      }
    },
    enterNetDiskFolderTap(id) {
      this.enterNetDiskFolder(id)
    },
    backNetDiskFolderTap() {
      this.backNetDiskFolder()
    }
  }

  onShow() {
  }

  onLoad() {
  }

  /**
   * 刷新
   */
  refresh() {
    return new Promise(resolve => {
      if (this.tabs[this.currentTabIndex]) {
        this.tabs[this.currentTabIndex].fromIndex = 0
        let tab = this.tabs[this.currentTabIndex]
        this.getNetDiskDir(tab.dirCallBean, tab.dirId, {}, tab).then((dirs) => {
          this.tabs[this.currentTabIndex].content.dirs[tab.dirId] = dirs
          this.$apply()
          this.getNetDiskFile(tab, {}).then((files) => {
            this.tabs[this.currentTabIndex].content.files = files
            this.refreshComplete(files.length)
            resolve()
          })
        })
      }
    })
  }

  refreshComplete(len) {
    let self = this
    if (len < self.pageSize) {
      self._loadMoreComplete(true)
    } else {
      self._loadMoreComplete(false)
    }
    self._refreshComplete()
    self.$apply()
  }

  /**
   * 加载更多
   */

  loadMore() {
    if (this.tabs[this.currentTabIndex]) {
      this.tabs[this.currentTabIndex].fromIndex = this.tabs[this.currentTabIndex].fromIndex + this.pageSize
      let tab = this.tabs[this.currentTabIndex]
      this.getNetDiskFile(tab, {}).then((files) => {
        this.loadMoreComplete(files)
      })
    }
  }

  loadMoreComplete(files) {
    let self = this
    self.tabs[this.currentTabIndex].content.files = self.concat(this.tabs[this.currentTabIndex].content.files || [], files)
    let noMoreDate = false
    if (self.tabs[this.currentTabIndex].content.files.length < self.tabs[this.currentTabIndex].fromIndex) {
      noMoreDate = true
    }
    self._loadMoreComplete(noMoreDate)
    self.$apply()
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
        if (tab.id === 'shareToMe' && pid === '0') {
          params.getbeanid = 'netdisk.personal.file.share.get'
        }
        if (callBean && flag) {
          if (pid) {
            params[tab.config.dirPidKey || 'id'] = pid
          }
          if (tab.id === 'shareToMe' && pid === '0') {
            let calls = []
            calls.push(twCallBeanPromise(callBean, {getbeanid: 'netdisk.personal.file.share.get'}))
            calls.push(twCallBeanPromise(callBean, {getbeanid: 'netdisk.personal.dir.share.get'}))
            Promise.all(calls).then((rets) => {
              let owners = []
              if (rets && rets.length > 0) {
                for (let i = 0, leni = rets.length; i < leni; i++) {
                  if (rets[i].beanparam.data.owners) {
                    var tOwners = rets[i].beanparam.data.owners
                    if (this.isArrayNotNull(tOwners)) {
                      owners = this.concat(owners, tOwners)
                    }
                  }
                }
              }
              let r = this.formatNetDiskDir(owners, tab)
              resolve(r)
            })
          } else {
            twCallBeanPromise(callBean, params).then((ret) => {
              let dirs = ret.beanparam.data[tab.config.dirObjKey || 'dirs'] || []
              let r = this.formatNetDiskDir(dirs, tab)
              resolve(r)
            })
          }
        } else {
          resolve([])
        }
      } else {
        resolve([])
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
            type: 'dir',
            id: dir[tab.config.dirIdKey || 'id'],
            icon: tab.config.dirPhoto,
            name: dir[tab.config.dirNameKey || 'name'] || '无名称'
          }
          if (tab.id === 'shareToMe') {
            temp.icon = twFormatGetFileCallBeanUri('config.user.head.get', {
              'isattach': false,
              id: temp.id
            })
          }
          distDir.push(temp)
        }
      })
      return distDir
    } else {
      return []
    }
  }

  /**
   *
   * @param cmd
   * @param params
   * @param fromindex
   * @return {Promise<any>}
   */
  getNetDiskFile(tab, params) {
    return new Promise((resolve) => {
      if (tab && tab.id && tab.fileCallBean) {
        if (!params) {
          params = {}
        }
        params.fromindex = tab.fromIndex || 0
        params.pagesize = this.pageSize
        if (tab.id === 'sys' || tab.id === 'personal') {
          params.ndid = tab.dirId
        } else if (tab.id === 'workgroup') {
          params.ownerid = tab.dirId
        } else if (tab.id === 'shareToMe') {
          params.id = tab.dirId
        }
        if (tab.fileCallBean) {
          if (tab.id === 'shareToMe') {
            let calls = []
            calls.push(twCallBeanPromise(tab.fileCallBean, {
              getbeanid: 'netdisk.personal.file.share.get',
              ownerid: params.id
            }))
            calls.push(twCallBeanPromise(tab.fileCallBean, {
              getbeanid: 'netdisk.personal.dir.share.get',
              ownerid: params.id
            }))
            Promise.all(calls).then((rets) => {
              let data = []
              if (rets && rets.length > 0) {
                for (var i = 0, leni = rets.length; i < leni; i++) {
                  var tList = rets[i].beanparam.data[tab.config.fileObjKey] || []
                  if (this.isArrayNotNull(tList)) {
                    data = this.concat(data, tList)
                  }
                }
              }
              var r = this.formatNetDiskFile(data, tab)
              resolve(r)
            })
          } else {
            twCallBeanPromise(tab.fileCallBean, params, {password: params.password}).then((ret) => {
              let files = ret.beanparam.data[tab.config.fileObjKey || 'files'] || []
              var r = this.formatNetDiskFile(files, tab)
              resolve(r)
            })
          }
        } else {
          resolve([])
        }
      } else {
        resolve([])
      }
    })
  }

  /**
   * 网盘文件对象格式化
   * @param files
   * @param tab
   */
  formatNetDiskFile(srcFiles, tab) {
    if (this.isArrayNotNull(srcFiles)) {
      let distFiles = []
      this.each(srcFiles, (file, i) => {
        if (tab.id === 'attachlist') {
          if (file.attach && file.attach[tab.config.fileIdKey]) {
            let temp = {
              type: 'file',
              size: file.attach.len || 0,
              formatSize: bytesToSize(file.attach.len || 0),
              id: file.attach[tab.config.fileIdKey],
              name: file.attach.filename || '无名字',
              mailId: file.mailid
            }
            if (temp.name) {
              let fileType = this.getFileType(temp.name)
              temp.icon = getPhotoByFileType(fileType)
            }
            if (file.modifytime) {
              temp.date = strFormatDate(file.modifytime, 'yyyy-MM-dd hh:mm')
            }
            distFiles.push(temp)
          }
        } else if (tab.id === 'myShare') {
          if (file.sharemj && file.sharemj[tab.config.fileIdKey]) {
            let temp = {
              type: 'file',
              size: file.sharemj.filesize || 0,
              formatSize: bytesToSize(file.sharemj.filesize || 0),
              id: file.sharemj[tab.config.fileIdKey],
              name: file.sharemj.name || '无名字'
            }
            if (temp.name) {
              let fileType = this.getFileType(temp.name)
              temp.icon = getPhotoByFileType(fileType)
            }
            if (file.modifytime) {
              temp.date = strFormatDate(file.modifytime, 'yyyy-MM-dd hh:mm')
            }
            distFiles.push(temp)
          }
        } else if (tab.id === 'shareToMe') {
          if (file.share && file.share[tab.config.fileIdKey]) {
            let temp = {
              type: 'file',
              size: file.filesize || 0,
              formatSize: bytesToSize(file.filesize || 0),
              id: file.share[tab.config.fileIdKey],
              name: file.name || '无名字',
              getbeanid: file.getbeanid,
              share: file.share
            }
            if (temp.name) {
              let fileType = this.getFileType(temp.name)
              temp.icon = getPhotoByFileType(fileType)
            }
            if (file.modifytime) {
              temp.date = strFormatDate(file.modifytime, 'yyyy-MM-dd hh:mm')
            }
            if (file.getbeanid === 'netdisk.personal.file.share.get') {
              distFiles.push(temp)
            } else if (file.getbeanid === 'netdisk.personal.dir.share.get') {
              // TODO
            }
          }
        } else {
          if (file[tab.config.fileIdKey]) {
            let temp = {
              type: 'file',
              size: file.filesize || 0,
              formatSize: bytesToSize(file.filesize || 0),
              id: file[tab.config.fileIdKey],
              name: file.name || '无名字'
            }
            if (temp.name) {
              let fileType = this.getFileType(temp.name)
              temp.icon = getPhotoByFileType(fileType)
            }
            if (file.modifytime) {
              temp.date = strFormatDate(file.modifytime, 'yyyy-MM-dd hh:mm')
            }
            if (file.ownerid) {
              temp.ownerid = file.ownerid
            }
            distFiles.push(temp)
          }
        }
      })
      return distFiles
    } else {
      return []
    }
  }

  enterNetDiskFolder(id) {
    wepy.showLoading({title: '加载中...'})
    if (this.tabs[this.currentTabIndex]) {
      let tab = this.tabs[this.currentTabIndex]
      if (tab.content.dirs && tab.content.dirs[id]) {
        this.tabs[this.currentTabIndex].dirId = id
        this.tabs[this.currentTabIndex].dirsHistory.push(id)
        this.tabs[this.currentTabIndex].fromIndex = 0
        this.getNetDiskFile(this.tabs[this.currentTabIndex], {}).then((files) => {
          this.tabs[this.currentTabIndex].content.files = files
          this.$apply()
          wepy.hideLoading()
        })
      } else {
        this.getNetDiskDir(tab.dirCallBean, id, {}, tab).then((dirs) => {
          this.tabs[this.currentTabIndex].content.dirs[id] = dirs
          this.tabs[this.currentTabIndex].dirId = id
          this.tabs[this.currentTabIndex].dirsHistory.push(id)
          this.tabs[this.currentTabIndex].fromIndex = 0
          this.$apply()
          this.getNetDiskFile(this.tabs[this.currentTabIndex], {}).then((files) => {
            this.tabs[this.currentTabIndex].content.files = files
            this.$apply()
            wepy.hideLoading()
          })
        })
      }
    }
  }

  backNetDiskFolder() {
    if (this.tabs[this.currentTabIndex] && this.isArrayNotNull(this.tabs[this.currentTabIndex].dirsHistory)) {
      this.tabs[this.currentTabIndex].dirsHistory.pop()
      if (this.tabs[this.currentTabIndex].dirsHistory.length > 0) {
        this.tabs[this.currentTabIndex].dirId = this.tabs[this.currentTabIndex].dirsHistory[this.tabs[this.currentTabIndex].dirsHistory.length - 1]
      } else {
        this.tabs[this.currentTabIndex].dirId = '0'
      }
      this.$apply()
      this.tabs[this.currentTabIndex].fromIndex = 0
      this.getNetDiskFile(this.tabs[this.currentTabIndex], {}).then((files) => {
        this.tabs[this.currentTabIndex].content.files = files
        this.$apply()
      })
    }
  }
}
