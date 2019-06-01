let express = require('express')
const database = require('./database.js')
const HRapi = require('./HRapi.js')
const utils = require('./utils.js')
const challonge = require('./challonge.js')
const bodyParser = require('body-parser')
const cors =  require('cors')
let APItoken = 'aB9gHcoyQkVdCAPnr7xCtl52JXY5rpPY'

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
  if(req.body.token != APItoken) return res.send('ACCESS DENIED: INVALID TOKEN')
  let id = req.body.id
  let what = req.body.what
  let to = req.body.to
  database.updateClan(id, what, to)
  res.send('SUCCESS')
})

app.post('/newclan', async (req, res, next) => {
  if(req.body.token != APItoken) return res.send('ACCESS DENIED: INVALID TOKEN')
  let id = req.body.id
  database.newClan(id)
  res.send('SUCCESS')
})

app.post('/deleteclan', async (req, res, next) => {
  if(req.body.token != APItoken) return res.send('ACCESS DENIED: INVALID TOKEN')
  database.deleteClan(req.body.id)
  res.send('SUCCESS')
})

/*====================*/
/*=======PLAYER=======*/
/*====================*/

app.get('/players', async (req, res, next) => {
  let players = await database.getPlayers()
  players = JSON.parse(JSON.stringify(players))

  // filter out token
  for(let id in players) delete players[id].token
  res.send(players)
})

app.get('/playertoken', async (req, res, next) => {
  if(req.query.token != APItoken) return res.send('ACCESS DENIED: INVALID TOKEN')
  let id = req.query.id
  let playertoken = await database.getPlayerToken(id)
  res.send(playertoken)
})

app.post('/updateplayer', async (req, res, next) => {
  let id = req.body.id
  let what = req.body.what
  let token = req.body.token
  let to = req.body.to

  // token access handling
  if(token != APItoken) {
    let playerToken = await database.getPlayerToken(id)
    if(playerToken == token) {
      if(what == 'points') return res.send('ACCESS DENIED: CANT CHANGE POINTS WITH USER TOKEN')
      if(what == 'id') return res.send('ACCESS DENIED: CANT CHANGE ID WITH USER TOKEN')
      if(what == 'token') return res.send('ACCESS DENIED: CANT CHANGE TOKEN WITH USER TOKEN')
      if(what == 'division') return res.send('ACCESS DENIED: CANT CHANGE DIVISION WITH USER TOKEN')
    }
    else return res.send('ACCESS DENIED: INVALID TOKEN')

  }

  let oldPlayers = await database.getPlayers()
  let oldPlayer = oldPlayers[id]

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
    let playerClan = clans[player.clan]
    if(playerClan != undefined) {
      let totalPoints = 0

      for(let i in players) {
        let player = players[i]
        if(player.clan != playerClan.id) continue
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
    let playerClan = clans[player.clan]
    if(playerClan != undefined) {
      let clanMembers = playerClan.members

      // leave clan
      if(to == 'none') {
        let index = clanMembers.indexOf(id)
        if(index !== -1) clanMembers.splice(index, 1)
      }

      // join clan
      else {

        // remove from old clan
        if(oldPlayer.clan != 'none') {
          let oldClan = clans[oldPlayer.clan]
          let index = oldClan.members.indexOf(id)
          if(index !== -1) oldClan.members.splice(index, 1)
          database.updateClan(oldClan.id, 'members', oldClan.members)
        }

        // add new member
        clanMembers.push(id)
      }

      // update
      database.updateClan(playerClan.id, 'members', clanMembers)
    }
  }

  // if change gameID
  if(what == 'gameID') {
    let HRaccounts = await database.getHRaccounts()
    let HRaccount = HRaccounts[to]
    if(HRaccount != undefined) {
      let stats = await database.getHRaccountGameStats(to)
      for(let stat of Object.values(stats)) database.addPlayerGameStats(id, stat)
    }
  }
  res.send('SUCCESS')
})

app.post('/newplayer', async (req, res, next) => {
  if(req.body.token != APItoken) return res.send('ACCESS DENIED: INVALID TOKEN')

  let id = req.body.id
  let username = req.body.username

  database.newPlayer(id, username)
  res.send('SUCCESS')
})

app.get('/playerstats', async (req, res, next) => {

  let id = req.query.id
  let stats = await database.getPlayerGameStats(id)

  res.send(stats)
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

async function updateGameStats(players) {
  let timers = await database.getTimers()
  let gameStatTimer = timers.gameStatUpdate
  let now = new Date()
  let currentDay = Math.floor(now.getTime() / (1000*60*60*24))

  if(currentDay > gameStatTimer) {
    database.updateTimers('gameStatUpdate', currentDay)
    console.log('RECORDING STATISTICS!!!')

    let players = await database.getPlayers()
    let ldrboard = await HRapi.getLeaderboard('daily', 'totalKills')
    let HRaccounts = await database.getHRaccounts()

    // add leaderboard people
    for(let plyr of ldrboard) addAnonAcc(plyr.userId, HRaccounts)

    // wait a while
    await utils.sleep(5000)

    // update players
    for(let playerID in players) {
      let player = players[playerID]
      if(player.gameID == 'none' || player.gameID == undefined) continue
      let currentUserStats = await HRapi.getUserStats(player.gameID)

      // remove some unnecasery shit
      delete currentUserStats.weaponsDealt
      delete currentUserStats.weaponsReceived
      delete currentUserStats.createdAt
      delete currentUserStats.name
      delete currentUserStats.userId
      delete currentUserStats.__v
      delete currentUserStats._id
      currentUserStats.recordedAt = currentDay
      
      database.addPlayerGameStats(playerID, currentUserStats)
    }

    // update HRaccounts
    for(let HRaccGameID in HRaccounts) {
      let HRacc = HRaccounts[HRaccGameID]
      if(HRacc.gameID == 'none' || HRacc.gameID == undefined) continue
      let currentUserStats = await HRapi.getUserStats(HRacc.gameID)

      // remove some unnecasery shit
      delete currentUserStats.weaponsDealt
      delete currentUserStats.weaponsReceived
      delete currentUserStats.createdAt
      delete currentUserStats.name
      delete currentUserStats.userId
      delete currentUserStats.__v
      delete currentUserStats._id
      currentUserStats.recordedAt = currentDay
      
      database.addHRaccountGameStats(HRacc.gameID, currentUserStats)
    }
  }
}

async function updatePlayingCount() {
  let timers = await database.getTimers()
  let currentTime = Math.floor(Date.now() / (1000*60*10))
  if(currentTime > timers.playingCount) {
    database.updateTimers('playingCount', currentTime)
    let playingCount = await HRapi.getPlayingCount()
    playingCount.recordedAt = currentTime
    database.addPlayingCount(currentTime.toString(), playingCount)
  }
}

app.get('/playingcount', async (req, res, next) => {
  let playingCount = await database.getPlayingCount()
  res.send(playingCount)
})

function addAnonAcc(gameID, HRaccounts) {

  let alreadyExist = HRaccounts[gameID] != undefined
  if(alreadyExist) return

  database.newHRaccount(gameID)
}


/*===================================*/
/*============TOURNAMENTS============*/
/*===================================*/
app.get('/tournaments', async (req, res, next) => {
  let tournaments = await database.getTournaments()
  res.send(tournaments)
})

app.get('/newtournament', async (req, res, next) => {
  let token = req.query.token
  let name = req.query.name
  if(token != APItoken) return res.send('ACCESS DENIED: INVALID TOKEN')

  await challonge.newTournament(name)
  database.newTournament(name)
  res.send('SUCCESS')
})

app.get('/updatetournament', async (req, res, next) => {
  let token = req.query.token
  if(token != APItoken) return res.send('ACCESS DENIED: INVALID TOKEN')
  let id = req.query.id
  let what = req.query.what
  let to = req.query.to
  database.updateTournament(id, what, to)
  res.send('SUCCESS')
})

app.get('/jointournament', async (req, res, next) => {
  let token = req.query.token
  let tournamentID = req.query.id
  let players = await database.getPlayers()
  let tournaments = await database.getTournaments()

  let player = Object.values(players).find((p) => p.token == token)
  let tournament = Object.values(tournaments).find(t => t.id == tournamentID)

  // check if able to join
  if(player == undefined) return res.send('PLAYER UNDEFINED')
  if(tournament == undefined) return res.send('TOURNAMENT UNDEFINED')
  if(tournament.players.includes(player.id)) return res.send('PLAYER ALREADY IN TOURNAMENT')
  if(tournament.status != 'open') return res.send('TOURNAMENT NOT OPEN')

  tournament.players.push(player.id)

  database.updateTournament(tournament.id, 'players', tournament.players)

  return res.send('SUCCESS')
})

app.get('/starttournament', async (req, res, next) => {
  let token = req.query.token
  if(token != APItoken) return res.send('ACCESS DENIED: INVALID TOKEN')

  let tournamentID = req.query.id
  let tournaments = await database.getTournaments()
  let tournament = Object.values(tournaments).find(t => t.id == tournamentID)

  database.updateTournament(tournament.id, 'status', 'ongoing')



})

/*============================*/
/*============LOOP============*/
/*============================*/
setInterval(updateTick, 1000*60)

function updateTick() {
  updateGameStats()
  updatePlayingCount()
}

app.get('/updatetick', async (req, res, next) => {
  if(req.query.token != APItoken) return res.send('ACCESS DENIED: INVALID TOKEN')
  updateTick()
  res.send('SUCCESS')
})