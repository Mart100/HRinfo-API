let express = require('express')
const database = require('./database.js')
const bodyParser = require('body-parser')
const cors =  require('cors')
let token = 'aB9gHcoyQkVdCAPnr7xCtl52JXY5rpPY'

database.initialize()

var app = express()
let port = 3100

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())

/*=====================*/
/*========CLANS========*/
/*=====================*/

app.get('/clans', async (req, res, next) => {
  let clans = await database.getClans()
  res.send(clans)
})

app.post('/updateclan', async (req, res, next) => {
  if(req.body.token != token) return res.send('ACCESS DENIED: INVALID TOKEN')
  let id = req.body.id
  let what = req.body.what
  let to = req.body.to
  database.updateClan(id, what, to)
  res.send('SUCCESS')
})

app.post('/newclan', async (req, res, next) => {
  if(req.body.token != token) return res.send('ACCESS DENIED: INVALID TOKEN')
  let id = req.body.id
  database.newClan(id)
  res.send('SUCCESS')
})

app.post('/deleteclan', async (req, res, next) => {
  if(req.body.token != token) return res.send('ACCESS DENIED: INVALID TOKEN')
  database.deleteClan(req.body.id)
  res.send('SUCCESS')
})

/*====================*/
/*=======PLAYER=======*/
/*====================*/

app.get('/players', async (req, res, next) => {
  let players = await database.getPlayers()

  // filter out token
  for(let id in players) delete players[id].token
  res.send(players)
})

app.post('/playertoken', async (req, res, next) => {
  if(req.body.token != token) return res.send('ACCESS DENIED: INVALID TOKEN')
  let id = req.body.id
  let playertoken = await database.getPlayerToken(id)
  res.send({token: playertoken})
})

app.post('/updateplayer', async (req, res, next) => {
  let id = req.body.id
  let what = req.body.what
  let to = req.body.to

  // token access handling
  if(req.body.token != token) {
    let playerToken = await database.getPlayerToken(id)
    if(playerToken == req.body.token) {
      if(what == 'points') return res.send('ACCESS DENIED: CANT CHANGE POINTS WITH USER TOKEN')
      if(what == 'id') return res.send('ACCESS DENIED: CANT CHANGE ID WITH USER TOKEN')
      if(what == 'token') return res.send('ACCESS DENIED: CANT CHANGE TOKEN WITH USER TOKEN')
      if(what == 'division') return res.send('ACCESS DENIED: CANT CHANGE DIVISION WITH USER TOKEN')
    }
    else return res.send('ACCESS DENIED: INVALID TOKEN')

  }
  database.updatePlayer(id, what, to)


  // if change points
  if(what == "points") {

    let players = await database.getPlayers()

    // UPDATE DIVISION

    let playerDivision
    let player = players[id]
    let currentPoints = player.points
    let divisions = await database.getDivisions()
    
    // get division
    for(let divisionName in divisions) {
      let division = divisions[divisionName]
      if(currentPoints > division.from && currentPoints < division.to) playerDivision = division
    }
    if(player.division != playerDivision.name) database.updatePlayer(id, "division", playerDivision.name)



    // UPDATE CLAN TOTAL POINTS

    let clans = await database.getClans()
    let playerClan = Object.values(clans).find((c) => c.name == player.clan)
    if(playerClan != undefined) {
      let totalPoints = 0

      for(let i in players) {
        let player = players[i]
        if(player.clan != playerClan.name) continue
        totalPoints += player.points
      }

      database.updateClan(playerClan.id, 'points', totalPoints)
    }
  }

  // if change clan
  if(what == 'clan') {
    let clans = await database.getClans()
    let players = await database.getPlayers()
    let player = players[id]
    let playerClan = Object.values(clans).find((c) => c.name == player.clan)
    if(playerClan != undefined) return
    let clanMembers = playerClan.members

    // leave clan
    if(to == 'none') {
      let index = clanMembers.indexOf(id)
      if(index !== -1) clanMembers.splice(index, 1)
    }

    // join clan
    else clanMembers.push(id)

    // update
    database.updateClan(playerClan.id, 'members', clanMembers)
  }

  res.send('SUCCESS')
})

app.post('/newplayer', async (req, res, next) => {
  if(req.body.token != token) return res.send('ACCESS DENIED: INVALID TOKEN')

  let id = req.body.id
  let username = req.body.username

  database.newPlayer(id, username)
  res.send('SUCCESS')
})


/*=====================*/
/*========OTHER========*/
/*=====================*/

app.get('/weapons', async (req, res, next) => {
  let weapons = await database.getWeapons()
  res.send(weapons)
})

app.get('/divisions', async (req, res, next) => {
  let divisions = await database.getDivisions()
  res.send(divisions)
})

app.listen(process.env.PORT || port, () => {
  console.log('Server listening on port ', process.env.PORT || port)
})