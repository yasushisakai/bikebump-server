import path from 'path'
import firebase from "firebase-admin"

// TODO: move these variables to ENV 

const jsonFromGoogle = path.resolve(__dirname, '../../config/', 'bikebump-ea3b1-firebase-adminsdk-ephgk-53ad7855df.json')

// const jsonFromGoogle = path.resolve(__dirname,'../../config/','bikebump-dev-firebase.json'

const serviceAccount = require(jsonFromGoogle)

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://bikebump-ea3b1.firebaseio.com",
})

const db = firebase.database()
export const ref = db.ref()

export function listenToDings (callback, errorCallback) {
  ref.child('dings').on('value', (snapshot) => {
    const dings = snapshot.val() || {}
    callback(dings)
  }, errorCallback)
}


export function addDingFB(ding){
  const dingId = ref.child(`dings`).push().key
  console.log('addDingFB')
  console.log(ding)
  ref.child(`dings/${dingId}`).set({...ding, dingId})
  return Promise.resolve(dingId)
}

export function overwriteDing(ding){
  ref.child(`dings/${ding.dingId}`).set(ding)
}

export function changeTimeStampValue(dingId, timestamp, value){
  ref.child(`dings/${dingId}/${timestamp}/value`).set(null)
  ref.child(`dings/${dingId}/timestamps/${timestamp}/value`).set(value)
}

export function deleteTimeStamp(dingId, timestamp){
  ref.child(`dings/${dingId}/timestamps/${timestamp}`).set(null)
}

export function appendDingFB(dingId, timestampData){
  const {uid, value} = timestampData
  console.log('appendDingFB')
  console.log(dingId, timestampData)
  return ref.child(`dings/${dingId}/timestamps/${timestampData.timestamp}`)
    .set({uid, value})
}

export function addRoadFB(road){
  return ref.child(`roads/${road.properties.id}`).set(road)
}

export function getAllRoads () {
  ref.child('roads').once('value')
    .then((snapshot) => snapshot.val())
}

export function deleteRoads () {
  ref.child('roads').set(null)
}

export function deleteRoadInfoFromDings () {
  ref.child('dings').once('value')
    .then(snapshot => snapshot.val())
    .then(roads => {
      Object.keys(roads).map(dingId => {
        const promises = [
          ref.child(`dings/${dingId}/closestRoadPoint`).set(null), 
          ref.child(`dings/${dingId}/roadId`).set(null),
          ref.child(`dings/${dingId}/direction`).set(null),
        ] 
        Promise.all(promises)
      }) 
    })
}

export function getDingsAll () {
  return ref.child('dings').once('value')
    .then(snapshot => snapshot.val())
}

export function updateDingInfo (dingId, point, direction, roadId) {
  const baseURL = `dings/${dingId}`
  const promises = [
    ref.child(`${baseURL}/closestRoadPoint`).set(point),
    ref.child(`${baseURL}/direction`).set(direction),
    ref.child(`${baseURL}/roadId`).set(roadId),
  ]
  return Promise.all(promises)
    .catch(error => console.log('updateDingInfo', error))
}
export function deleteDingsWithRoadId(roadId){
  ref.child('dings').once('value')
    .then((snapshot) => snapshot.val())
    .then(dings => {
      Object.values(dings).map((ding) => {
        if(ding.roadId === roadId){
          ref.child(`dings/${ding.dingId}`).set(null)
        }
      })
    })
}

export function addUsersDingFB(uid, dingId){
  return ref.child(`userDings/${uid}/${dingId}/ding`).set(true)
}

