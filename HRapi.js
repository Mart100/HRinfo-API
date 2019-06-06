const fetch = require('node-fetch')

module.exports = {
  getUserStats(userID) {
    return new Promise((resolve, reject) => {
      fetch(`https://api.helmetroyale.io/stats?userId=${userID}`, { method: 'GET', headers: {Origin: 'https://helmetroyale.io'} })
        .then(res => res.json()).then(resolve)
    })
  },
  getLeaderboard(time, what) {
    return new Promise((resolve, reject) => {
      fetch(`https://api.helmetroyale.io/lb/${time}/${what}`, { method: 'GET', headers: {Origin: 'https://helmetroyale.io'} })
        .then(res => res.json()).then(resolve)
    })
  },
  getPlayingCount() {
    return new Promise(async (resolve, reject) => {
      let playingCount = {}
      playingCount.eu = await this.getPlayingCountEU()
      playingCount.us = await this.getPlayingCountUS()
      playingCount.sa = await this.getPlayingCountSA()
      playingCount.asia = await this.getPlayingCountASIA()
      resolve(playingCount)
    })
  },
  getPlayingCountEU() {
    return new Promise((resolve, reject) => {
      fetch('https://eu-match.hrbackend.com:8100/count', { method: 'GET', headers: {Origin: 'https://helmetroyale.io'} })
        .then(res => res.json()).then(json => resolve(json.count))
    })
  },
  getPlayingCountUS() {
    return new Promise((resolve, reject) => {
      fetch('https://us-east-match.hrbackend.com:8100/count', { method: 'GET', headers: {Origin: 'https://helmetroyale.io'} })
        .then(res => res.json()).then(json => resolve(json.count))
    })
  },
  getPlayingCountSA() {
    return new Promise((resolve, reject) => {
      fetch('https://sa-east-match.hrbackend.com:8100/count', { method: 'GET', headers: {Origin: 'https://helmetroyale.io'} })
        .then(res => res.json()).then(json => resolve(json.count))
    })
  },
  getPlayingCountASIA() {
    return new Promise((resolve, reject) => {
      fetch('https://kor-match.hrbackend.com:8100/count', { method: 'GET', headers: {Origin: 'https://helmetroyale.io'} })
        .then(res => res.json()).then(json => resolve(json.count))
    })
  }
}