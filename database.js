let admin
let db
let clanList = {}
let weaponList = {}
let playerList = {}
let HRaccountList = {}
let timerList = {}
let divisionList = {}

const utils = require('./utils.js')
const serviceAccount = require("./databaseCredentials.json")

module.exports = {
  initialize() {

    let firebaseAdmin = require("firebase-admin")

    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(serviceAccount),
      databaseURL: "https://helmetroyaleinfo.firebaseio.com"
    })

    db = firebaseAdmin.firestore()

    db.settings({timestampsInSnapshots: true})
    console.log('Database Initialized')

  },
  getDivisions() {
    return new Promise((resolve, reject) => {
      if(Object.keys(divisionList).length > 0) return resolve(divisionList)

      db.collection("divisions").get().then((querySnapshot) => {
        let divisions = {}
        querySnapshot.forEach((doc) => {
          let data = doc.data() 
          divisions[data.name] = data
        })
        console.log('DATABASE GET DIVISIONS')
        divisionList = divisions
        resolve(divisions)
      })
    })
  },
  getWeapons() {
    return new Promise((resolve, reject) => {
      if(Object.keys(weaponList).length > 0) return resolve(weaponList)

      db.collection("weapons").get().then((querySnapshot) => {
        let weapons = {}
        querySnapshot.forEach((doc) => {
          let data = doc.data() 
          weapons[data.name] = data
        })
        console.log('DATABASE GET WEAPONS')
        weaponList = weapons
        resolve(weapons)
      })
    })
  },
  getPlayers() {
    return new Promise((resolve, reject) => {
      if(Object.keys(playerList).length > 0) return resolve(playerList)

      db.collection("players").get().then((querySnapshot) => {
        let players = {}
        querySnapshot.forEach((doc) => {
          let data = doc.data() 
          players[data.id] = data
        })
        console.log('DATABASE GET PLAYERS')
        playerList = players
        resolve(players)
      })
    })
  },
  getPlayerGameStats(id) {
    return new Promise((resolve, reject) => {
      db.collection("players").doc(id).collection('gameStats').get().then((querySnapshot) => {
        let gameStats = {}
        querySnapshot.forEach((doc) => {
          let data = doc.data() 
          gameStats[data.recordedAt] = data
        })
        resolve(gameStats)
      })
    })
  },
  addPlayerGameStats(id, stats) {
    db.collection('players').doc(id).collection('gameStats').doc(stats.recordedAt.toString()).set(stats)
  },
  getPlayerToken(id) {
    return new Promise(async (resolve, reject) => {
      let players = await this.getPlayers()
      let player = players[id]
      resolve(player.token)
    })
  },
  updatePlayer(id, what, to) {
    let obj = {}
    obj[what] = to
    db.collection('players').doc(id).update(obj)
    if(playerList[id] != undefined) playerList[id][what] = to
    return 'SUCCESS'
  },
  newPlayer(id, username) {
    let obj = {
      id: id,
      clan: 'none',
      division: 'jungle',
      points: 0,
      token: utils.randomToken(),
      username: username,
      gameID: 'none'
    }

    db.collection('players').doc(id).set(obj)
    playerList[id] = obj
    return 'SUCCESS'
  },
  newHRaccount(gameID) {
    let obj = {
      gameID: gameID
    }
    db.collection('HRaccounts').doc(gameID).set(obj)
    HRaccountList[gameID] = obj
    return 'SUCCESS'
  },
  addHRaccountGameStats(gameID, stats) {
    db.collection('HRaccounts').doc(gameID).collection('gameStats').doc(stats.recordedAt.toString()).set(stats)
  },
  getHRaccountGameStats(id) {
    return new Promise((resolve, reject) => {
      db.collection("HRaccounts").doc(id).collection('gameStats').get().then((querySnapshot) => {
        let stats = {}
        querySnapshot.forEach((doc) => {
          let data = doc.data() 
          stats[data.recordedAt] = data
        })
        resolve(stats)
      })
    })
  },
  getHRaccounts() {
    return new Promise((resolve, reject) => {
      if(Object.keys(HRaccountList).length > 0) return resolve(HRaccountList)

      db.collection("HRaccounts").get().then((querySnapshot) => {
        let list = {}
        querySnapshot.forEach((doc) => {
          let data = doc.data() 
          list[data.gameID] = data
        })
        console.log('DATABASE GET HR ACCOUNTS')
        HRaccountList = list
        resolve(list)
      })
    })
  },
  getClans() {
    return new Promise((resolve, reject) => {
      if(Object.keys(clanList).length > 0) return resolve(clanList)

      db.collection("clans").get().then((querySnapshot) => {
        let clans = {}
        querySnapshot.forEach((doc) => {
          let data = doc.data() 
          clans[data.id] = data
        })
        console.log('DATABASE GET CLANS')
        clanList = clans
        resolve(clans)
      })
    })
  },
  updateClan(id, what, to) {
    let obj = {}
    obj[what] = to
    db.collection('clans').doc(id).update(obj)
    if(clanList[id] != undefined) clanList[id][what] = to
    return 'SUCCESS'
  },
  newClan(id) {
    let obj = {
      id: id,
      desc: 'No description yet...',
      tag: 'none',
      points: 0,
      discordMemberCount: 0,
      verified: false,
      members: [],
      public: false
    }

    db.collection('clans').doc(id).set(obj)
    clanList[id] = obj
    return 'SUCCESS'
  },
  deleteClan(id) {
    db.collection('clans').doc(id).delete()
    delete clanList[id]
  },
  addPlayingCount(time, to) {
    console.log(time, to)
    db.collection('playingCount').doc(time).set(to)
  },
  getTimers() {
    return new Promise((resolve, reject) => {
      if(Object.keys(timerList).length > 0) return resolve(timerList)

      db.collection("other").doc('timers').get().then((snapshot) => {
        let data = snapshot.data()
        timerList = data
        resolve(data)
      })
    })
  },
  updateTimers(what, to) {
    let obj = {}
    obj[what] = to
    db.collection('other').doc('timers').update(obj)
    timerList[what] = to
  }

}