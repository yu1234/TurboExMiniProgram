import wepy from 'wepy'
import {twCallBeanPromise} from '../utils/twmodule'

export default class MailFolderMixin extends wepy.mixin {
  data = {
    sysDefaultFolders: []
  }
  methods = {}

  onLoad() {
    this.getSysDefaultFolders()
  }

  /**
   * //获取系统默认菜单列表
   */
  getSysDefaultFolders() {
    let self = this

    let customDefaultFolder = {
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
          }
        }
        self.sysDefaultFolders = folders
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
        for (var i = 0, len = pFolderCodes.length; i < len; i++) {
          calls.push(twCallBeanPromise('config.folder.user.getsublist', {pfoldercode: pFolderCodes[i]}))
        }
      }
      Promise.all(calls).then(function (rets) {
        if (rets && rets.length > 0) {
          for (var i = 0, len = rets.length; i < len; i++) {
            var ret = rets[i]
            if (ret.beanparam.data.folders && ret.beanparam.data.folders.length > 0) {
              var folders = ret.beanparam.data.folders
              for (var j = 0, len1 = folders.length; j < len1; j++) {
                folders[j].icon = 'icon-folders'
              }
              r[pFolderCodes[i]] = folders
            }
          }
        }
        resolve(r)
      })
    })
  }
}
