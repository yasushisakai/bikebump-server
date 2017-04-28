import { json, urlencoded } from 'body-parser'
import * as express from 'express'
import { resolve } from 'path'
import { ApiController } from './controllers'

const app: express.Application = express()
const port: number = process.env.port || 8080
const distRoot: string = resolve(__dirname, '../lib/dist')

app.use(urlencoded({extended: false}))
app.use(json())

// serve static files in general
app.use(express.static(distRoot))

// other API stuff goes inside
app.use('/api', ApiController)

app.get('/test', (req: express.Request, res: express.Response) => {
  console.log('hello')
  res.json('hello')
})

app.listen(port, () => {
  console.log(`Listening at port: ${port}`)
})
