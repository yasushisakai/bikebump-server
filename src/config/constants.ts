import * as {database, initializeApp } from 'firebase-admin'
import { resolve } from 'path'

const key = resolve(__dirname, '../../', 'key.json')
import * as serviceAccount from key

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://bikebump-ea3b1.firebaseio.com',
})

const db: database.Database = firebase.database()

export const ROADLENGTHTHRESHOLD: number = 10
export const TILESIZE: number = 1000

