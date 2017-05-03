import { createRoad, listenRoads } from './Api'

interface IRoad {
  type: string
  geometry: IGeometry
  properties: any
}

interface IGeometry {
  type: string
  coordinates: any
}

export class RoadManager {
  private roads: {[index: number]: IRoad}
  constructor () {
    listenRoads((roads) => {this.roads = roads}, (error) => {console.log(error)})
  }

  public async addRoad (road: IRoad): Promise<any> {
    const roadId = road.properties.id
    if (!this.roads[roadId]) {
      await createRoad(road)
      console.log(`added road: ${roadId}`)
    } else {
      console.log(`road(${roadId}) already in cache`)
      await Promise.resolve(null)
    }
  }
}
