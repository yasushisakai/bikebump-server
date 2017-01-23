import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import RoadHelper from './helpers/RoadHelper'
import { ref, registerAnonymous, getAccessToken  } from './helpers/firebase'
import Utilities from './helpers/Utilities'

const app = express()
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

const roadHelper = new RoadHelper()
const portNum = 8080
const distRoot = path.resolve(__dirname,'../lib','dist')

app.use(express.static(distRoot))

const api_endpoints = express.Router();

//
//  api/road/closest?lng=42.3552525&lat=-71.1032591
//
api_endpoints.get('/road/closest',(req,res)=>{
  const coordinate ={
    lat:parseFloat(req.query.lat),
    lng:parseFloat(req.query.lng),
  }
  const {road, closestPt, distance, roadLine } = roadHelper.findClosest(coordinate)
  
  res.json(
    Utilities.formatRoad(
      road.id,
      road.name,
      closestPt,
      distance,
      roadLine
      ))
})

//
//  /api/road/8648996
//
// FIXME: consistant with closest api!!
api_endpoints.get('/road/:roadId',(req,res)=>{
  res.json(roadHelper.getRoad(req.params.roadId)) 
})


//
// /api/auth/reg
//
// api_endpoints.get('/auth/register/anon',(req,res)=>{
//   registerAnonymous()
//     .then((user_tokens)=>{
//       res.json(user_tokens)
//     }) 
// })

// POST!
// /api/auth/token/
// parameters: uid 
// 
//
// api_endpoints.post('/api/auth/token/',(req,res)=>{
//   const uid = req.body.uid
//   return getAccessToken(uid)
//     .then((uid)=>(return uid)) 
// })

app.use('/api',api_endpoints)

app.get('*',(req,res)=>{
  res.sendFile(path.resolve(distRoot,'index.html'))
})



app.listen(portNum,()=>{
  console.log(`app running in ${portNum}`)
})