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
  res.send(players)
})

app.post('/updateplayer', async (req, res, next) => {
  if(req.body.token != token) return res.send('ACCESS DENIED: INVALID TOKEN')
  let id = req.body.id
  let what = req.body.what
  let to = req.body.to
  database.updatePlayer(id, what, to)

  // if points, Check devision
  if(what == "points") {
    let playerDivision
    let player = await database.getPlayers()[id]
    let currentPoints = player.points
    let divisions = await database.getDivisions()

    // get division
    for(let divisionName in divisions) {
      let division = divisions[divisionName]
      if(currentPoints > division.from && currentPoints < division.to) playerDivision = division
    }

    database.updatePlayer(id, "division", playerDivision.name)
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