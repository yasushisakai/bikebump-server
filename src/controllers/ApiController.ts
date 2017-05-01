import axios, { AxiosError, AxiosResponse } from 'axios'
import { Request, Response, Router } from 'express'
import { fetchDings } from '../helpers/Api'
import { closestRoadFromLatLng, ILatLng } from '../helpers/Map'

const router: Router = Router()

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
router.post('/dings/add', (req: Request, res: Response) => {
  console.log(req.body.lat)
})

router.get('/closestRoad', (req: Request, res: Response) => {
  const {lat, lng} = req.query
  const latLng: ILatLng = {lat: parseFloat(lat), lng: parseFloat(lng)}
  closestRoadFromLatLng(latLng)
    .then((roads) => { res.json(roads) })
    .catch((error) => console.error(error))
})

router.get('/getDings', (req: Request, res: Response) => {
  fetchDings()
    .then((dings) => Object.keys(dings).map((key) => dings[key]))
    .then((dings) => dings.map((ding) => ding.coordinates))
    .then((latLngs) => latLngs.map((latLng) => closestRoadFromLatLng(latLng)))
    .then((promises) => Promise.all(promises))
    // .then((results) => res.json(results))
    .then((results) => results.map((result) => result.closestPoint.dist))
    .then((distances) => distances.reduce((sum, dist) => (sum + dist), 0) / distances.length)
    .then((meanDist) => res.json(meanDist))
    // .then((closests) => { res.json(closests) })
    .catch((error) => { console.error(error) })
})

export const ApiController: Router = router
