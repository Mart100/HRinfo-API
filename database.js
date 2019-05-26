let admin
let db
let clanList = {}
let weaponList = {}
let playerList = {}
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
      gameID: 'none',
      gameStats: {}
    }

    db.collection('players').doc(id).set(obj)
    playerList[id] = obj
    return 'SUCCESS'
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
  },
  getTimers() {
    return new Promise((resolve, reject) => {
      db.collection("other").doc('timers').get().then((snapshot) => {
        let data = snapshot.data()
        resolve(data)
      })
    })
  },
  updateTimers(what, to) {
    let obj = {}
    obj[what] = to
    db.collection('other').doc('timers').update(obj)
  }

}
