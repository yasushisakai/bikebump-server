import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as path from 'path'

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json)

const portNumber : number = 8080
const distRoot : string = path.resolve(__dirname, '../lib/dist')

app.use(express.static(distRoot))

// important!!
app.post('/api/dings/add', (req, res) => {
  const lat : number = parseFloat(req.body.lat)
  const lng : number = parseFloat(req.body.lng)
  const uid : string = req.body.uid
  const timestamp : number = parseInt(req.body.timestamp)
  const value : number = parseInt(req.body.value) 
  res.json('hello')
})

app.get('/api/test/', (req, res) => {
	console.log('anyone here?')
  res.json('test')
})


// start the server!
app.listen(portNumber, () => {
  console.log(`app running in port ${portNumber}`)
})
