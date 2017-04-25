import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import Dings from './helpers/Dings'
import { getCloseRoads, getClosestRoad, fetchRoads } from './helpers/Map'
import { updateDingInfo, deleteRoads, deleteRoadInfoFromDings, getDingsAll } from './helpers/firebase'

const app = express()
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())


const dings = new Dings()

const portNum = 8080
const distRoot = path.resolve(__dirname, '../lib/dist')

app.use(express.static(distRoot))

const api_endpoints = express.Router()


// POST
// api/dings/add
// params (body, x-www-from-urlencoded)
// lat:number
// lat:number
// uid:string
// timestamp:number
// value:number
//
api_endpoints.post('/dings/add/', (req, res) => {
  const lat = parseFloat(req.body.lat)
  const lng = parseFloat(req.body.lng)
  const uid = req.body.uid
  const timestamp = req.body.timestamp
  const value = req.body.value
  
  dings.addDing(lat, lng, uid, timestamp, value)
  .then(dingId => res.json(dingId))
})

api_endpoints.get('/fetchRoads/:lat/:lng', (req, res) => {

  const lat = parseFloat(req.params.lat)
  const lng = parseFloat(req.params.lng)

  fetchRoads(lat, lng, 15)
    .then(roads =>
    { 
      return res.json(roads)
    })
    .catch(error => console.error(error))
})

// api_endpoints.get('/getCloseRoads/:lat/:lng', (req,res) => {
api_endpoints.get('/updateClosestRoads/', (req, res) => {

  
  // get each ding coordinates
  getDingsAll()
    .then(dings => Object.values(dings).map(ding => {
      const {lat, lng} = ding.coordinates
      getCloseRoads(lat, lng)
        .then(roads => getClosestRoad(lat, lng, roads))
        .then(({point, distance, road, direction}) => {
          if(distance < ding.radius*2){
            // update ding info @ FB
            updateDingInfo(ding.dingId, point, direction, road.properties.roadId)             
            // update roads
            // addRoad(road)
          }
        })
      })
    )
  res.json('hello') 
//  getCloseRoads(lat, lng)
//    .then(roads => getClosestRoad(lat, lng, roads))
//    .then(result => res.json(result))
})

api_endpoints.get('/refreshRoads', (req, res) => {
  deleteRoads()
  deleteRoadInfoFromDings()
  res.json('deleted all roads')
})

app.use('/api', api_endpoints)

app.get('*', (req, res) => {
  res.sendFile(path.resolve(distRoot, 'index.html'))
})

app.listen(portNum, () => {
  console.log(`app running in ${portNum}`)
})
