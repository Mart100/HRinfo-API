module.exports = {
  randomToken() {
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split("")
    let token = ''
    let length = 32
    for(let i=0;i<length;i++) {
      token += chars[Math.floor(Math.random()*chars.length)]
    }
    return token
  },
  sleep(ms) { return new Promise((resolve, reject) => { setTimeout(() => { resolve() }, ms) }) }
}