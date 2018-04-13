import wepy from 'wepy'
import BaseMixin from './base'
import {checkHasPermit, twCallBeanPromise} from '../utils/twmodule'
import {md5} from '../utils/md5'
import {defaultErrors} from '../utils/utils'

export default class PermitMixin extends wepy.mixin {
  mixins = [BaseMixin]
  data = {}
  methods = {}

  checkPreMit(beanid, params, permitComponents) {
    return new Promise((resolve, reject) => {
      checkHasPermit(beanid, params).then((r) => {
        if (r.needPwd) {
          if (permitComponents && permitComponents.show) {
            permitComponents.show((password) => {
              password = md5(password)
              twCallBeanPromise('accessright.callbean.permit.password.check', {
                beanid: beanid,
                beansno: r.beansno,
                password: password
              }).then((ret) => {
                let check = ret.beanparam.data.check
                if (!check) {
                  wepy.showToast({
                    title: '密码错误',
                    icon: 'none'
                  })
                } else {
                  let result = {}
                  result.check = true
                  result.password = password
                  resolve(result)
                }
              }).catch(() => {
                reject(defaultErrors.customError('验证出错'))
              })
            })
          } else {
            console.error('缺少验证组件')
          }
        } else {
          let result = {}
          result.check = true
          result.password = ''
          resolve(result)
        }
      })
    })
  }
}
