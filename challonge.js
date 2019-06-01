let apiKEY = 'HHxb5sEy8p13dX0jzjJujYLHQfi6QG1QJEA3YnKJ'
const { URL, URLSearchParams } = require('url')

module.exports = {
  createTournament(name) {
    return new Promise((resolve, reject) => {
      let url = new URL('https://api.challonge.com/v1/tournaments')
      let params = {
        "api_key": apiKEY,
        "tournament[name]": name,
        "tournament[url]": name
      }
      url.search = new URLSearchParams(params)
      fetch(url, {method:'POST'}).then(res => res.json()).then(json => resolve(json))
    })
  }
}