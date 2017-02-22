import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import Dings from './helpers/Dings'
import { getClosestRoad, fetchRoads } from './helpers/Map'
import { ref, registerAnonymous, getAccessToken, createPattern, createProposal  } from './helpers/firebase'
import Utilities from './helpers/Utilities'

const app = express()
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

const dings = new Dings()

const portNum = 8080
const distRoot = path.resolve(__dirname,'../lib/dist')

app.use(express.static(distRoot))

const api_endpoints = express.Router();


// POST
// api/dings/add
// params (body, x-www-from-urlencoded)
// lat:number
// lat:number
// uid:string
// timestamp:number
// value:number
//
api_endpoints.post('/dings/add/',(req,res)=>{
  const lat = parseFloat(req.body.lat)
  const lng = parseFloat(req.body.lng)
  const uid = req.body.uid
  const timestamp = req.body.timestamp
  const value = req.body.value
  
  dings.addDing(lat,lng,uid,timestamp,value)
  .then(dingId=>res.json(dingId))
})

api_endpoints.get('/patterns/add/:text/:budget',(req,res)=>{
  const text = req.params.text
  const budget = parseInt(req.params.budget)
  createPattern(text,budget)
    .then(patternId=>res.json(patternId))
})

api_endpoints.get('/proposals/add/:roadId/:patternId/:start/:end',(req,res)=>{

  const roadId = req.params.roadId
  const patternId = req.params.patternId
  const start = parseFloat(req.params.start)
  const end = parseFloat(req.params.end)

  createProposal(roadId,patternId,start,end)
    .then(proposalId=>res.json(proposalId))

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
