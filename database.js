let admin
let db
let clanList = {}
let weaponList = {}
let playerList = {}
let divisionList = {}

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
      if(Object.keys(divisionList) > 0) return new Promise((resolve, reject) => { resolve(divisionList) })

      db.collection("divisions").get().then((querySnapshot) => {
        let divisions = {}
        querySnapshot.forEach((doc) => {
          let data = doc.data() 
          divisions[data.name] = data
        })
        divisionList = divisions
        resolve(divisions)
      })
    })
  },
  getWeapons() {
    return new Promise((resolve, reject) => {
      if(Object.keys(weaponList) > 0) return new Promise((resolve, reject) => { resolve(weaponList) })

      db.collection("weapons").get().then((querySnapshot) => {
        let weapons = {}
        querySnapshot.forEach((doc) => {
          let data = doc.data() 
          weapons[data.name] = data
        })
        weaponList = weapons
        resolve(weapons)
      })
    })
  },
  getPlayers() {
    return new Promise((resolve, reject) => {
      if(Object.keys(playerList) > 0) resolve(playerList)

      db.collection("players").get().then((querySnapshot) => {
        let players = {}
        querySnapshot.forEach((doc) => {
          let data = doc.data() 
          players[data.id] = data
        })
        playerList = players
        resolve(players)
      })
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
      clan: "none",
      division: 'jungle',
      points: 0,
      username: username
    }

    db.collection('players').doc(id).set(obj)
    playerList[id] = obj
    return 'SUCCESS'
  },
  getClans() {
    return new Promise((resolve, reject) => {
      if(Object.keys(clanList) > 0) resolve(clanList)

      db.collection("clans").get().then((querySnapshot) => {
        let clans = {}
        querySnapshot.forEach((doc) => {
          let data = doc.data() 
          clans[data.id] = data
        })
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
      public: false
    }

    db.collection('clans').doc(id).set(obj)
    clanList[id] = obj
    return 'SUCCESS'
  },
  deleteClan(id) {
    db.collection('clans').doc(id).delete()
  },
}
