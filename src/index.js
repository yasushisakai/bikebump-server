import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'

const app = express()
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

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

//
// important!
//
api_endpoints.post('/dings/add/', (req, res) => {
  res.json('dings add')
})


api_endpoints.get('/test', (req, res) => {
  res.json('test')
})

app.use('/api', api_endpoints)

app.get('*', (req, res) => {
  res.sendFile(path.resolve(distRoot, 'index.html'))
})

app.listen(portNum, () => {
  console.log(`app running in ${portNum}`)
})
