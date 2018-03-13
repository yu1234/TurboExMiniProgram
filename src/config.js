/**
 * 小程序配置文件
 */
let host = 'http://192.168.191.1:8080/TurboWebApp'
let sessionId = null
let wid = null
const miniProgram = {
  appId: 'wxbc0cb5d8883f46fd',
  appSecret: 'a68bc10f609683a5d1adf61b67d90139'
}
const storageKeys = {
  password: 'password',
  user: 'user'
}
let config = {
  debug: true,
  sessionId,
  wid,
  storageKeys,
  miniProgram,
  // 下面的地址配合云端 Demo 工作
  service: {
    host,

    // 登录地址，用于建立会话
    loginUrl: `${host}/weapp/login`,

    // 测试的请求地址，用于测试会话
    requestUrl: `${host}/weapp/user`,
    // 上传图片接口
    uploadUrl: `${host}/weapp/upload`,
    // 获取openId地址
    openIdUrl: `https://api.weixin.qq.com/sns/jscode2session`,
    accessTokenUrl: `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${miniProgram.appId}&secret=${miniProgram.appSecret}`,
    sendMsgUrl: `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send`
  },
  setSessionId(_sessionid) {
    sessionId = _sessionid
  },
  getSessionId() {
    return sessionId
  },
  setWid(_wid) {
    wid = _wid
  },
  getWid() {
    return wid
  }
}
module.exports = config
