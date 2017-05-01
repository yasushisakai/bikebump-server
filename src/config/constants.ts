/// <reference path="../../typings/json.d.ts" />

import * as firebase from 'firebase-admin'
import * as serviceAccount from '../../key.json'

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://bikebump-ea3b1.firebaseio.com',
})

const db: firebase.database.Database = firebase.database()
export const ref: firebase.database.Reference = db.ref()

export const ROADLENGTHTHRESHOLD: number = 10
export const TILESIZE: number = 1000
