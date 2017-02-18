import path from 'path'
import firebase from "firebase-admin"

// TODO: move these variables to ENV 

const jsonFromGoogle = path.resolve(__dirname,'../../config/','bikebump-ea3b1-firebase-adminsdk-ephgk-53ad7855df.json')

const serviceAccount = require(jsonFromGoogle)

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://bikebump-ea3b1.firebaseio.com"
});

const db = firebase.database()
export const ref = db.ref()


export function listenToDings (callback,errorCallback) {
  ref.child('dings').on('value',(snapshot)=>{
    const dings = snapshot.val() || {}
    callback(dings)
  },errorCallback)
}

export function addDingFB(ding){
  const dingId = ref.child(`dings`).push().key
  return ref.child(`dings/${dingId}`).set({...ding,dingId})
}

export function appendDingFB(dingId, timestampData){
  return ref.child(`dings/${dingId}/timestamps/${timestampData.timestamp}`).set(timestampData)
}

export function addRoadFB(road){
  return ref.child(`roads/${road.properties.id}`).set(road)
}

export function addUsersDingFB(uid, dingId){
  return ref.child(`userDings/${uid}/${dingId}`).set(true)
}


//
// auth stuff
//
export function registerAnonymous () {
  console.log('adding anon user')
  // make a new uid
  const uid = ref.child('users').push().key
  ref.child(`users/${uid}/uid`).set(uid)

  return firebase.auth().createCustomToken(uid)
    .then((customToken)=>{
      return {uid,customToken}
    })
    .catch((error)=>{ console.log(error) })
}

export function getAccessToken (uid) {
  return firebase.auth().createCustomToken(uid)
    .then((customToken)=>{
      return {customToken}
    })
    .catch((error)=>{ console.log(error) })
}