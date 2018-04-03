import wepy from 'wepy'
import {twCallBeanPromise} from '../utils/twmodule'
import {bytesToSize, strFormatDate} from '../utils/utils'

export default class AddressMixin extends wepy.mixin {
  data = {
    addressMixin: {
      backIcon: '/assets/images/file_icon_back_m_default.png'
    },
    tabs: [],
    currentTabIndex: 0
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
    enterAddressFolderTap(id) {
      this.enterAddressFolder(id)
    },
    backAddressFolderTap() {
      this.backAddressFolder()
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
        this.getAddressDir(tab.dirCallBean, tab.dirId, {}, tab).then((dirs) => {
          this.tabs[this.currentTabIndex].content.dirs[tab.dirId] = dirs
          this.$apply()
          this.getAddress(tab, {}).then((files) => {
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
      this.getAddress(tab, {}).then((files) => {
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
   * 获取文件夹
   * @param cmd
   * @param pid
   * @param params
   * @param tab
   * @return {Promise<any>}
   */
  getAddressDir(cmd, pid, params, tab) {
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
          twCallBeanPromise(callBean, params).then((ret) => {
            let dirs = ret.beanparam.data[tab.config.dirObjKey || 'dirs'] || []
            let r = this.formatAddressDir(dirs, tab)
            resolve(r)
          })
        } else {
          resolve([])
        }
      } else {
        resolve([])
      }
    })
  }

  /**
   * 格式对象结构
   * @param srcDir
   */
  formatAddressDir(srcDir, tab) {
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
          distDir.push(temp)
        }
      })
      return distDir
    } else {
      return []
    }
  }

  /**
   *获取地址
   * @param cmd
   * @param params
   * @param fromindex
   * @return {Promise<any>}
   */
  getAddress(tab, params) {
    return new Promise((resolve) => {
      if (tab && tab.id && tab.fileCallBean) {
        if (!params) {
          params = {}
        }
        params.fromindex = tab.fromIndex || 0
        params.pagesize = this.pageSize
        if (tab.id === 'sys' || tab.id === 'personal') {
          params.anid = tab.dirId
        } else if (tab.id === 'workgroup') {
          params.ids = [tab.dirId]
        } else if (tab.id === 'org') {
          params.org = tab.dirId === '0' ? 'org' : tab.dirId
        }
        twCallBeanPromise(tab.fileCallBean, params, {password: params.password}).then((ret) => {
          let files = ret.beanparam.data[tab.config.fileObjKey || 'files'] || []
          this.formatAddress(files, tab).then(r => {
            resolve(r)
          })
        })
      } else {
        resolve([])
      }
    })
  }

  /**
   * address对象格式化
   * @param files
   * @param tab
   */
  formatAddress(srcAddress, tab) {
    return new Promise(resolve => {
      if (this.isArrayNotNull(srcAddress)) {
        let distAddress = []
        let aMap = {
          accounts: []
        }
        let workGroupUr = []
        this.each(srcAddress, (file, i) => {
          if (file) {
            if (tab.id === 'org') {
              if (file[tab.config.fileIdKey]) {
                let temp = {
                  id: file[tab.config.fileIdKey],
                  name: file.name,
                  emails: [],
                  emailsFormat: '',
                  headerPhoto: this.defaultHeaderPhoto,
                  type: 'address'
                }
                let accountT = null
                if (this.isArrayNotNull(file.accounts)) {
                  let emails = []
                  let emailsFormat = ''
                  this.each(file.accounts, (account, j) => {
                    if (account && account.username && account.domain) {
                      let temp1 = {
                        type: account.accounttype,
                        address: `${account.username || ''}@${account.domain || ''}`,
                        date: account.modifytime
                      }
                      emails.push(temp1)
                      emailsFormat += `${temp1.address};`
                      if (!accountT) {
                        accountT = temp1.address
                      }
                    }
                  })
                  temp.emails = emails
                  temp.emailsFormat = emailsFormat
                }
                if (accountT) {
                  aMap.accounts.push(accountT)
                  temp.firstAddress = accountT
                }
                distAddress.push(temp)
              }
            } else if (tab.id === 'workgroup') {
              if (file[tab.config.fileIdKey]) {
                let temp = {
                  id: file[tab.config.fileIdKey],
                  name: file.name,
                  emails: [],
                  emailsFormat: '',
                  headerPhoto: this.defaultHeaderPhoto,
                  type: 'address'
                }
                workGroupUr.push(file[tab.config.fileIdKey])
                distAddress.push(temp)
              }
            } else {
              if (file[tab.config.fileIdKey]) {
                let temp = {
                  id: file[tab.config.fileIdKey],
                  name: file.name,
                  emails: [],
                  emailsFormat: '',
                  headerPhoto: this.defaultHeaderPhoto,
                  type: 'address'
                }
                let account = null
                if (this.isArrayNotNull(file.emails)) {
                  let emails = []
                  let emailsFormat = ''
                  this.each(file.emails, (email, j) => {
                    if (email && email.mailaddress) {
                      let temp1 = {
                        type: email.emailtype,
                        address: email.account,
                        date: email.createtime
                      }
                      emails.push(temp1)
                      emailsFormat += `${temp1.address};`
                      if (!account) {
                        account = temp1.address
                      }
                    }
                  })
                  temp.emails = emails
                  temp.emailsFormat = emailsFormat
                }
                if (account) {
                  aMap.accounts.push(account)
                  temp.firstAddress = account
                }
                distAddress.push(temp)
              }
            }
          }
        })
        if (tab.id === 'workgroup') {
          this.getSysUserInfoById(workGroupUr).then(map => {
            this.each(distAddress, (v, i) => {
              if (v && map[v.id]) {
                if (map[v.id].headerPhoto) {
                  distAddress[i].headerPhoto = map[v.id].headerPhoto
                }
                let accountT = null
                if (this.isArrayNotNull(map[v.id].accounts)) {
                  let emails = []
                  let emailsFormat = ''
                  this.each(map[v.id].accounts, (account, j) => {
                    if (account && account.username && account.domain) {
                      let temp1 = {
                        type: account.accounttype,
                        address: `${account.username || ''}@${account.domain || ''}`,
                        date: account.modifytime
                      }
                      emails.push(temp1)
                      emailsFormat += `${temp1.address};`
                      if (!accountT) {
                        accountT = temp1.address
                      }
                    }
                  })
                  distAddress[i].emails = emails
                  distAddress[i].emailsFormat = emailsFormat
                }
                if (accountT) {
                  distAddress[i].firstAddress = accountT
                }
              }
            })
            resolve(distAddress)
          })
        } else {
          this.getSysUserInfo(aMap.accounts).then(map => {
            this.each(distAddress, (a, i) => {
              if (a && a.firstAddress && map[a.firstAddress] && map[a.firstAddress].headerPhoto) {
                distAddress[i].headerPhoto = map[a.firstAddress].headerPhoto
              }
            })
            resolve(distAddress)
          })
        }
      } else {
        resolve([])
      }
    })
  }

  enterAddressFolder(id) {
    wepy.showLoading({title: '加载中...'})
    if (this.tabs[this.currentTabIndex]) {
      let tab = this.tabs[this.currentTabIndex]
      if (tab.content.dirs && tab.content.dirs[id]) {
        this.tabs[this.currentTabIndex].dirId = id
        this.tabs[this.currentTabIndex].dirsHistory.push(id)
        this.tabs[this.currentTabIndex].fromIndex = 0
        this.getAddress(this.tabs[this.currentTabIndex], {}).then((files) => {
          this.tabs[this.currentTabIndex].content.files = files
          this.$apply()
          wepy.hideLoading()
        })
      } else {
        this.getAddressDir(tab.dirCallBean, id, {}, tab).then((dirs) => {
          this.tabs[this.currentTabIndex].content.dirs[id] = dirs
          this.tabs[this.currentTabIndex].dirId = id
          this.tabs[this.currentTabIndex].dirsHistory.push(id)
          this.tabs[this.currentTabIndex].fromIndex = 0
          this.$apply()
          this.getAddress(this.tabs[this.currentTabIndex], {}).then((files) => {
            this.tabs[this.currentTabIndex].content.files = files
            this.$apply()
            wepy.hideLoading()
          })
        })
      }
    }
  }

  backAddressFolder() {
    if (this.tabs[this.currentTabIndex] && this.isArrayNotNull(this.tabs[this.currentTabIndex].dirsHistory)) {
      this.tabs[this.currentTabIndex].dirsHistory.pop()
      if (this.tabs[this.currentTabIndex].dirsHistory.length > 0) {
        this.tabs[this.currentTabIndex].dirId = this.tabs[this.currentTabIndex].dirsHistory[this.tabs[this.currentTabIndex].dirsHistory.length - 1]
      } else {
        this.tabs[this.currentTabIndex].dirId = '0'
      }
      this.$apply()
      this.tabs[this.currentTabIndex].fromIndex = 0
      this.getAddress(this.tabs[this.currentTabIndex], {}).then((files) => {
        this.tabs[this.currentTabIndex].content.files = files
        this.$apply()
      })
    }
  }
}
