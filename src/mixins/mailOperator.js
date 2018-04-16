import wepy from 'wepy'
import {twCallBeanPromise} from '../utils/twmodule'
import {defaultErrors} from '../utils/utils'
import BaseMixin from './base'

const markingItems = [{
  id: 'read',
  unsetFlag: ['0'],
  setFlag: ['1'],
  name: '已读',
  icon: 'icon-marking_icon_read'
}, {
  id: 'unread',
  unsetFlag: ['1'],
  setFlag: ['0'],
  name: '未读',
  icon: 'icon-marking_icon_unread'
}, {
  id: 'star',
  unsetFlag: [],
  setFlag: ['9'],
  name: '星标',
  icon: 'icon-marking_icon_star'
}, {
  id: 'cancelStar',
  unsetFlag: ['9'],
  setFlag: [],
  name: '取消星标',
  icon: 'icon-marking_icon_cancel_2'
}, {
  id: 'backlog',
  unsetFlag: [],
  setFlag: ['11'],
  name: '待办',
  icon: 'icon-marking_icon_backlog'
}, {
  id: 'cancelBacklog',
  unsetFlag: ['11'],
  setFlag: [],
  name: '取消待办',
  icon: 'icon-marking_icon_cancel_'
}, {
  id: 'sticky',
  unsetFlag: [],
  setFlag: ['10'],
  name: '置顶',
  icon: 'icon-marking_icon_sticky'
}, {
  id: 'cancelSticky',
  unsetFlag: ['10'],
  setFlag: [],
  name: '取消置顶',
  icon: 'icon-marking_icon_cancel_3'
}, {
  id: 'importance',
  unsetFlag: [],
  setFlag: ['14'],
  name: '重要邮件',
  icon: 'icon-marking_icon_importa'
}, {
  id: 'cancelImportance',
  unsetFlag: ['14'],
  setFlag: [],
  name: '取消重要邮件',
  icon: 'icon-marking_icon_cancel_1'
}]
export default class MailOperatorMixin extends wepy.mixin {
  mixins = [BaseMixin]
  data = {
    movePopupFolder: {
      currentFolderId: 'root',
      currentFolders: []
    },
    swipePanelFolder: {
      currentFolderId: 'root',
      currentFolders: []
    },
    folders: {},
    markingItems: markingItems
  }
  methods = {
    backFolder(type) {
      this.goToFolder(type, null, true)
    },
    intoFolder(type, id) {
      this.goToFolder(type, id, false)
    },
    readMail(mail, index) {
      if (mail && mail.id) {
        let mailPermit = this.$wxpage.selectComponent('#mailPermit')
        this.checkPreMit('mail.client.get', {mailid: mail.id}, mailPermit).then((r) => {
          if (mail.unRead) {
            this.markingMailByFlags([mail.id], ['1'], ['0']).then(() => {
              if (this.isArrayNotNull(this.mails) && index > -1 && this.mails.length > index) {
                if (this.mails[index] && this.mails[index].id === mail.id) {
                  this.mails[index].unRead = false
                  this.$apply()
                }
              }
            })
          }
          let password = r.password
          this.loadPage(`/pages/mail/read/read?id=${mail.id}&password=${password}`)
        }).catch((e) => {
          wepy.showToast({
            title: e.message,
            icon: 'none'
          })
        })
      }
    }
  }

  intoFolder(type, id) {
    this.goToFolder(type, id, false)
  }

  goToFolder(type, id, isBack) {
    if (this[type]) {
      if (isBack) {
        console.log(this[type].currentFolderId)
        let parentId = this.folders[this[type].currentFolderId].parentId
        if (parentId) {
          this[type].currentFolders = this.folders[parentId].children
          this[type].currentFolderId = parentId
          this.$apply()
        }
      } else {
        if (this.folders[id] && this.folders[id].hasChildNodes && this.folders[id].children) {
          this[type].currentFolderId = id
          this[type].currentFolders = this.folders[id].children
          this.$apply()
        } else {
          this.getCustomFolders(type, id).then(() => {
            if (this.folders[id]) {
              this[type].currentFolderId = id
              this[type].currentFolders = this.folders[id].children
              this.$apply()
            }
          })
        }
      }
    }
  }

  onLoad() {
    this.getSysDefaultFolders()
  }

  /**
   * //获取系统默认菜单列表
   */
  getSysDefaultFolders() {
    let self = this

    let customDefaultFolder = {
      parentId: 'root',
      id: 'custom',
      type: 'custom',
      folderCode: '',
      name: '自定义文件夹',
      icon: 'icon-sys-folder-custom',
      hasChildNodes: false
    }
    twCallBeanPromise('config.folder.getdefault', {}).then(function (rets) {
      let pFolderCodes = []
      let folders = []
      if (rets.beanparam.data.folders && rets.beanparam.data.folders.length > 0) {
        let sysDefaultFolders = rets.beanparam.data.folders
        for (let i = 0, len = sysDefaultFolders.length; i < len; i++) {
          let tempFolder = {
            parentId: 'root',
            id: sysDefaultFolders[i].foldercode,
            type: 'default',
            folderCode: sysDefaultFolders[i].foldercode,
            name: sysDefaultFolders[i].foldername,
            icon: `icon-sys-folder-${sysDefaultFolders[i].foldercode}`
          }
          folders.push(tempFolder)
          pFolderCodes.push(sysDefaultFolders[i].foldercode)
        }
        folders.push(customDefaultFolder)
        pFolderCodes.push(customDefaultFolder.folderCode)
      }
      self.getSubFolders(pFolderCodes).then(function (children) {
        for (var i = 0, len = folders.length; i < len; i++) {
          if (children && children[folders[i].folderCode] && children[folders[i].folderCode].length > 0) {
            folders[i].hasChildNodes = true
            self.folders[folders[i].id] = {
              children: children[folders[i].folderCode],
              hasChildNodes: true,
              parentId: 'root'
            }
          } else {
            self.folders[folders[i].id] = {children: [], hasChildNodes: false, parentId: 'root'}
          }
        }
        self.folders['root'] = {children: folders, hasChildNodes: true, parentId: null}
        self.movePopupFolder.currentFolders = folders
        self.swipePanelFolder.currentFolders = folders
        self.$apply()
      })
    })
  }

  /**
   * 获取自定义文件夹
   * @param id
   */
  getCustomFolders(type, id) {
    return new Promise((resolve) => {
      this.getSubFolders([id]).then((folders) => {
        if (folders && folders[id] && folders[id].length > 0) {
          this.folders[id] = {children: folders[id], hasChildNodes: true, parentId: this[type].currentFolderId}
          resolve(folders)
        } else {
          resolve([])
        }
      })
    })
  }

  /**
   * 获取系统某个文件夹的子文件夹
   * @param pFolderCodes 父节点id(数组)
   * @param callback 回调函数 return {父节点id:[子文件夹]}
   */
  getSubFolders(pFolderCodes) {
    return new Promise(function (resolve) {
      var calls = []
      var r = {}
      if (pFolderCodes && pFolderCodes.length > 0) {
        for (let i = 0, len = pFolderCodes.length; i < len; i++) {
          calls.push(twCallBeanPromise('config.folder.user.getsublist', {pfoldercode: pFolderCodes[i]}))
        }
      }
      Promise.all(calls).then(function (rets) {
        if (rets && rets.length > 0) {
          for (let i = 0, len = rets.length; i < len; i++) {
            let ret = rets[i]
            if (ret.beanparam.data.folders && ret.beanparam.data.folders.length > 0) {
              let folders = ret.beanparam.data.folders
              let childrenFolder = []
              for (let j = 0, len1 = folders.length; j < len1; j++) {
                let tempFolder = {
                  parentId: folders[j].pfoldercode || 'custom',
                  id: folders[j].foldercode,
                  type: 'child',
                  folderCode: folders[j].foldercode,
                  name: folders[j].foldername,
                  icon: 'icon-move_mail_icon_folde',
                  hasChildNodes: folders[j].hassub
                }
                childrenFolder.push(tempFolder)
              }
              r[pFolderCodes[i]] = childrenFolder
            }
          }
        }
        resolve(r)
      })
    })
  }

  /**
   * 逻辑删除邮件（移动回收站）
   * @param ids 邮件id数组
   */
  logicDeleteMail(ids) {
    let self = this
    return new Promise((resolve, reject) => {
      let tip = ''
      if (self.isArrayNotNull(ids)) {
        tip = '确定要删除选中的' + ids.length + '封邮件?'
        wepy.showModal({
          title: '提示',
          content: tip,
          success(res) {
            if (res.confirm) {
              wepy.showLoading({title: '删除中...'})
              let folderCode = 'del'
              self.moveMail(ids, folderCode).then(() => {
                wepy.hideLoading()
                wepy.showToast({title: '删除成功', icon: 'success'})
                resolve()
              }).catch((e) => {
                wepy.hideLoading()
                wepy.showToast({title: e.message, icon: 'none'})
              })
            }
          }
        })
      } else {
        tip = '请选择需删除的邮件'
        wepy.showToast({title: tip, icon: 'none'})
      }
    })
  }

  /**
   * 移动邮件
   * @param ids
   * @param item
   */
  moveMailTap(ids, item) {
    let self = this
    return new Promise((resolve, reject) => {
      var tip = ''
      if (self.isArrayNotNull(ids)) {
        tip = `确定要移动选中的${ids.length}封邮件到：${item.name}`
        wepy.showModal({
          title: '提示',
          content: tip,
          success(res) {
            if (res.confirm) {
              wepy.showLoading({title: '移动中...'})
              let folderCode = item.folderCode
              self.moveMail(ids, folderCode).then(() => {
                wepy.hideLoading()
                wepy.showToast({title: '移动成功', icon: 'success'})
                resolve()
              }).catch((e) => {
                wepy.hideLoading()
                wepy.showToast({title: e.message, icon: 'none'})
              })
            }
          }
        })
      } else {
        tip = '请选择需移动的邮件'
        wepy.showToast({title: tip, icon: 'none'})
      }
    })
  }

  /**
   * 移动邮件
   * @param mailIds 邮件id数组
   * @param folderCodea 移动到的文件夹code
   */
  moveMail(mailIds, folderCode) {
    return new Promise((resolve, reject) => {
      mailIds = mailIds || []
      folderCode = folderCode || ''
      twCallBeanPromise('mail.client.move', {
        'mailids': mailIds,
        'foldercode': folderCode
      }).then(function (ret) {
        if (ret.beanparam.retcode === 0) {
          resolve()
        } else {
          reject(defaultErrors.customError)
        }
      }).catch((e) => {
        reject(defaultErrors.networkError)
      })
    })
  }

  /**
   * 邮件标记
   * @param ids 邮件id {Array}
   * @param typeId 类型id
   */
  markingMail(ids, item) {
    let self = this
    return new Promise(resolve => {
      let tip = ''
      if (this.isArrayNotNull(ids)) {
        if (item.id) {
          wepy.showLoading({title: '标记中...'})
          if (item.id === 'backlog') { // 待办事件特殊处理
            // TODO
            wepy.hideLoading()
            resolve()
          } else if (item.id === 'cancelBacklog') { // 取消待办事件
            self.cancelTodoMail(ids).then(function (r) {
              self.markingMailByFlags(ids, item.setFlag, item.unsetFlag).then((beanParam) => {
                wepy.hideLoading()
                wepy.showToast({title: '标记成功', icon: 'success'})
                resolve()
              }).catch(e => {
                wepy.showToast({title: e.message, icon: 'none'})
                wepy.hideLoading()
              })
            }).catch(error => {
              wepy.hideLoading()
              wepy.showToast({title: error.message, icon: 'none'})
            })
          } else {
            self.markingMailByFlags(ids, item.setFlag, item.unsetFlag).then((beanParam) => {
              wepy.hideLoading()
              wepy.showToast({title: '标记成功', icon: 'success'})
              resolve()
            }).catch(e => {
              wepy.hideLoading()
              wepy.showToast({title: e.message, icon: 'none'})
            })
          }
        } else {
          wepy.showToast({title: '网络错误,请刷新重试', icon: 'none'})
        }
      } else {
        tip = '请选择需标记的邮件'
        wepy.showToast({title: tip, icon: 'none'})
      }
    })
  }

  /**
   * 取消待办邮件
   */
  cancelTodoMail(ids) {
    let self = this
    return new Promise(function (resolve, reject) {
      if (self.isArrayNotNull(ids)) {
        let rejectId = []
        let calls = []
        for (let i = 0, len = ids.length; i < len; i++) {
          let mailid = ids[i]
          calls.push(twCallBeanPromise('data.rels.get', {id: mailid}))
        }
        calls.length !== 0 ? Promise.all(calls).then(function (rets) {
          for (let i = 0, len = rets.length; i < len; i++) {
            let ret = rets[i];
            (function () {
              let retInner = ret
              let id = retInner.beanparam.data.id
              // 该邮件没有设置过待办
              if (!id) {
                rejectId.push('reject')
                if (rejectId.length === ids.length) {
                  reject(defaultErrors.customError('所选邮件没有设置过待办'))
                }
                return
              }
              if (!retInner.beanparam.data.relids || retInner.beanparam.data.relids.length <= 0) {
                rejectId.push('reject')
                if (rejectId.length === ids.length) {
                  reject(defaultErrors.customError('所选邮件没有设置过待办'))
                }
                return
              }
              var scid = retInner.beanparam.data.relids[0]
              twCallBeanPromise('data.rels.del', {id: id}).then(function () {
                return twCallBeanPromise('schedule.del', {scids: [scid]})
              }).then(function () {
                resolve(true)
              })['catch'](function () {
                reject(defaultErrors.customError('取消待办失败'))
              })
            }())
          }
        }).catch(function () {
          reject(defaultErrors.networkError)
        }) : reject(defaultErrors.customError('取消待办失败'))
      } else {
        reject(defaultErrors.customError('请选择取消待办邮件'))
      }
    })
  }

  /**
   * 设置标记邮件
   * @param mailIds 邮件id Array
   * @param setflags 设置的标记 Array
   * @param unsetFlags 取消的标记 Array
   * @param callback 回调函数
   */
  markingMailByFlags(mailIds, setflags, unsetFlags) {
    return new Promise((resolve, reject) => {
      twCallBeanPromise('mail.client.setflag', {
        'mailids': mailIds || [],
        'setflags': setflags || [],
        'unsetflags': unsetFlags || []
      }).then(function (ret) {
        if (ret.beanparam.retcode === 0) {
          resolve()
        } else {
          reject(defaultErrors.customError('标记失败'))
        }
      }).catch(() => {
        reject(defaultErrors.networkError)
      })
    })
  }

  /**
   * 邮件转发
   * @param id
   * @param permitObj
   */
  mailForward(id) {
    if (!id) {
      let tip = '请选择需转发的邮件'
      wepy.showToast({title: tip, icon: 'none'})
      return
    }
    let mailPermit = this.$wxpage.selectComponent('#mailPermit')
    this.checkPreMit('mail.client.get', {mailid: id}, mailPermit).then((r) => {
      let password = r.password
      let data = {
        id: id,
        password: password
      }
      this.loadPage(`/pages/mail/write/write?type=mailForward&data=${JSON.stringify(data)}`)
    }).catch((e) => {
      wepy.showToast({
        title: e.message,
        icon: 'none'
      })
    })
  }
}
