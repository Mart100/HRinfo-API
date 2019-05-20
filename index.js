let express = require('express')
const database = require('./database.js')
const cors =  require('cors')
let token = 'aB9gHcoyQkVdCAPnr7xCtl52JXY5rpPY'

database.initialize()

var app = express()
let port = 3100

app.use(cors())

/*=====================*/
/*========CLANS========*/
/*=====================*/

app.get('/clans', async (req, res, next) => {
  let clans = await database.getClans()
  res.send(clans)
})

app.get('/updateclan', async (req, res, next) => {
  if(req.query.token != token) return res.send('ACCESS DENIED: INVALID TOKEN')

  let clan = req.query.clan
  let what = req.query.what
  let to = req.query.to

  let databaseRes = database.updateClan(clan, what, to)

  res.send(databaseRes)
})

app.get('/newclan', async (req, res, next) => {
  if(req.query.token != token) return res.send('ACCESS DENIED: INVALID TOKEN')

  let id = req.query.id

  let databaseRes = database.newClan(id)

  res.send(databaseRes)
})

app.get('/removeclan', async (req, res, next) => {
  if(req.query.token != token) return res.send('ACCESS DENIED: INVALID TOKEN')
  let databaseRes = database.removeClan(id)
  res.send(databaseRes)
})

/*====================*/
/*=======PLAYER=======*/
/*====================*/

app.get('/players', async (req, res, next) => {
  let players = await database.getPlayers()
  res.send(players)
})

app.get('/updateplayer', async (req, res, next) => {
  if(req.query.token != token) return res.send('ACCESS DENIED: INVALID TOKEN')

  let player = req.query.player
  let what = req.query.what
  let to = req.query.to

  let databaseRes = database.updatePlayer(player, what, to)
  
  res.send(databaseRes)
})

app.get('/newplayer', async (req, res, next) => {
  if(req.query.token != token) return res.send('ACCESS DENIED: INVALID TOKEN')

  let id = req.query.id
  let username = req.query.username

  let databaseRes = database.newPlayer(id, username)
  
  res.send(databaseRes)
})


/*=====================*/
/*=======WEAPONS=======*/
/*=====================*/

app.get('/weapons', async (req, res, next) => {
  let weapons = await database.getWeapons()
  res.send(weapons)
})

app.listen(process.env.PORT || port, () => {
  console.log('Server listening on port ', process.env.PORT || port)
})