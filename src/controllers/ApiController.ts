import axios, { AxiosError, AxiosResponse } from 'axios'
import { Request, Response, Router } from 'express'
import { fetchRoadsfromLatLng, filterShortRoads, ILatLng} from '../helpers/Map'

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
  fetchRoadsfromLatLng(latLng)
    .then((roads) => roads.filter((road) => filterShortRoads(road)))
    .then((roads) => res.json(roads))
    .catch((error) => console.error(error))
})

export const ApiController: Router = router
