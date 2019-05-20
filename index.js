let express = require('express')
const database = require('./database.js')
const cors =  require('cors')

database.initialize()

var app = express()
let port = 3100

app.use(cors)

app.get('/clans', async (req, res, next) => {
  let clans = await database.getClans()
  res.send(clans)
})

app.get('/players', async (req, res, next) => {
  let players = await database.getPlayers()
  res.send(players)
})

app.get('/weapons', async (req, res, next) => {
  let weapons = await database.getWeapons()
  res.send(weapons)
})

app.listen(process.env.PORT || port, () => {
  console.log('Server listening on port ', process.env.PORT || port)
})