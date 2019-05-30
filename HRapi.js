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
}