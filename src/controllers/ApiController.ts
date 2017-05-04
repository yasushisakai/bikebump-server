import axios, { AxiosError, AxiosResponse } from 'axios'
import { Request, Response, Router } from 'express'
import { dropDing, fetchDings, handleUpdateDing } from '../helpers/Api'
import { DingManager } from '../helpers/DingManager'
import { closestRoadFromLatLng, IClosestPoint, ILatLng } from '../helpers/Map'
import { RoadManager } from '../helpers/RoadManager'

const router: Router = Router()

const dingManager = new DingManager()
const roadManager = new RoadManager()

router.get('/', (req: Request, res: Response) => {
  res.json('api root')
})

/* POST
 * lat: number
 * lng: number
 * uid: string
 * timestamp: string
 * value: number
 */
router.post('/dings/add', async (req: Request, res: Response) => {
  const lat: number = parseFloat(req.body.lat)
  const lng: number = parseFloat(req.body.lng)
  const coordinates: ILatLng = {lat, lng}
  const uid: string = req.body.uid
  const timestamp: number = parseInt(req.body.timestamp, 10)
  const value: number = parseInt(req.body.value, 10)

  const {dingId, road} = await dingManager.addDing(uid, timestamp, coordinates, value)

  if (road !== null) {
    await roadManager.addRoad(road)
  }

  res.json(dingId)
})

router.get('/closestRoad', (req: Request, res: Response) => {
  const {lat, lng} = req.query
  const latLng: ILatLng = {lat: parseFloat(lat), lng: parseFloat(lng)}
  closestRoadFromLatLng(latLng)
    .then((roads) => { res.json(roads) })
    .catch((error) => console.error(error))
})

// router.get('/updateDings', (req: Request, res: Response) => {
//   fetchDings()
//     .then((dings) => Object.keys(dings).map((key) => dings[key]))
//     .then((dings) => dings.map((ding) => ding.coordinates))
//     .then((latLngs) => latLngs.slice(0, 5)) // sample first 50
//     .then((latLngs) => latLngs.map((latLng) => closestRoadFromLatLng(latLng)))
//     .then((promises) => Promise.all(promises))
//     .then((results) => results.map((result) => result.closestPoint.dist))
//     .then((distances) => distances.reduce((sum, dist) => (sum + dist), 0) / distances.length)
//     .then((meanDist) => res.json(meanDist))
//     .catch((error) => { console.error(error) })
// })
router.get('/updateDings', async (req: Request, res: Response) => {
  const sec: number = Date.now()
  const dings = await fetchDings()
  const dingArray = Object.keys(dings).map((key) => dings[key]) // .slice(0, 5) // do all
  dingArray.map(async (ding, index) => {
    const closestRoad: { closestPoint: IClosestPoint, road: any } = await closestRoadFromLatLng(ding.coordinates)
    if (ding.radius * 2 > closestRoad.closestPoint.dist) {
      await handleUpdateDing(ding.dingId, closestRoad)
    } else {
      await dropDing(ding.dingId)
    }
  })
  res.json('done')
})

export const ApiController: Router = router
