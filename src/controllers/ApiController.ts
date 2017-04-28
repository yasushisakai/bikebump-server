import axios, { AxiosError, AxiosResponse } from 'axios'
import { Request, Response, Router } from 'express'
import { fetchRoadFromTile } from '../helpers/Map'

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
})

export const ApiController: Router = router
