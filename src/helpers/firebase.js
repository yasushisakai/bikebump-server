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
  console.log(ding)
  ref.child(`dings/${dingId}`).set({...ding,dingId})
  return Promise.resolve(dingId)
}

export function changeTimeStampValue(dingId,timestamp,value){
  ref.child(`dings/${dingId}/${timestamp}/value`).set(null)
  ref.child(`dings/${dingId}/timestamps/${timestamp}/value`).set(value)
}

export function deleteTimeStamp(dingId,timestamp){
  ref.child(`dings/${dingId}/timestamps/${timestamp}`).set(null)
}

export function appendDingFB(dingId, timestampData){
  const {uid,value} = timestampData
  return ref.child(`dings/${dingId}/timestamps/${timestampData.timestamp}`)
    .set({uid,value})
}

export function addRoadFB(road){
  return ref.child(`roads/${road.properties.id}`).set(road)
}

export function addUsersDingFB(uid, dingId){
  return ref.child(`userDings/${uid}/${dingId}/ding`).set(true)
}

export function createPattern(text,budget){
  const patternId = ref.child('patterns').push().key

  const pattern = {text, budget, patternId}

  return ref.child(`patterns/${patternId}`).set(pattern)
    .then(()=>patternId)
}

export function createProposal(roadId,patternId,start,end){

  const proposal = {
    domain:{start,end},
    patternId,
    roadId,
  }

  const proposalId = ref.child(`proposals/${roadId}`).push().key
  return ref.child(`proposals/${roadId}/${proposalId}`).set({...proposal,proposalId})
    .then(()=>proposalId)

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