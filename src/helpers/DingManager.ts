import { DINGRADIUS } from '../config/constants'
import { appendTimestamp, createDing, listenDings } from './Api'
import { closestRoadFromLatLng, IClosestPoint, ILatLng, latLngDistance } from './Map'

export interface IDing {
  closestRoadPoint: IClosestPoint
  coordinates: ILatLng
  dingId?: string // may not be assigned
  radius: number
  roadId: number
  timestamps?: {
    [index: number]: ITimestamp,
  }
}

export interface ITimestamp {
  uid: string
  value: number
}

export class DingManager {
  private dings: {[key: string]: IDing}
  constructor () {
    listenDings((dings) => { this.dings = dings }, (error) => {console.error(error)})
  }

  public async addDing (uid: string, timestamp: number, coordinates: ILatLng, value: number): Promise<any> {
    const timestampData: ITimestamp = {uid, value}
    const check = this.checkInside(coordinates)
    if (check.isInside) {
      // appendTimestamp call modifies 'dings/' so this.dings will be updated accordingly
      await appendTimestamp(check.dingId, timestamp, timestampData)
      console.log(`[LOG]: appending timestamp to ding: ${check.dingId}`)
      return Promise.resolve(null)
    } else {
      // we don't want to add dings without roads
      const closestRoad = await closestRoadFromLatLng(coordinates)
      console.log(closestRoad)
      if (closestRoad.closestPoint.dist < DINGRADIUS * 2) {
        // add
        const tempDing: IDing = {
          closestRoadPoint: closestRoad.closestPoint,
          coordinates,
          radius: DINGRADIUS,
          roadId: closestRoad.road.properties.id,
          timestamps: {},
        }
        tempDing.timestamps[timestamp] = timestampData
        // dingId will be added by firebase
        const dingId: string = await createDing(tempDing)
        console.log(`[LOG]: created ding: ${dingId}`)
        // TODO: contact road Manager
        return Promise.resolve(closestRoad.road)
      } else {
        console.log('[LOG]: didn\'t add ding, could not find any road near by')
        return Promise.resolve(null)
      }
    }
  }

  private checkInside (coordinates: ILatLng): {isInside: boolean, dingId: string} {
    let isInside: boolean = false
    let dingId: string = ''
    Object.keys(this.dings).map((key) => {
      const ding = this.dings[key]
      const distanceToDing = latLngDistance(ding.coordinates, coordinates)
      if (distanceToDing < ding.radius) {
        isInside = true
        dingId = ding.dingId
      }
    })

    return {isInside, dingId}
  }

}
