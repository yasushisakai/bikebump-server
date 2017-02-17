import {
  ref,
  listenToDings,
  addDingFB,
  appendDingFB,
  addRoadFB
} from './firebase'

import RoadHelper from './RoadHelper'
import Utilities from './Utilities'

import { getClosestRoad, fetchRoads } from './Map'


export default class Dings {

  constructor() {
    this.dings = {}
    listenToDings(this.updateDings.bind(this))
    this.roadHelper = new RoadHelper()
  }

  updateDings(dings) {
    this.dings = dings
  }

  addDing(lat,lng,uid,timestamp,value) {
    let minimalDistance = 10000000
    let closestDing = ''
    Object.keys(this.dings).map((dingId) => {
      const ding = this.dings[dingId]
      const distance = Utilities.distFromLatLng(
        this.dings[dingId].coordinates.lat,
        this.dings[dingId].coordinates.lng,
        lat,
        lng,
      )
      if (minimalDistance > distance) {
        minimalDistance = distance
        closestDing = dingId
      }
    })

    if(minimalDistance < 10){
      // append
      const timestampData = {
        uid,
        value,
      }
      return appendDingFB(closestDing,timestampData)
    }else{
      // create ding
    return fetchRoads(lat,lng)
      .then(roads=>getClosestRoad(lat,lng,roads))
      .then(closestRoad=>{

        addRoadFB(closestRoad.road)

        return Utilities.formatDing(
          lat,
          lng,
          uid,
          timestamp,
          value,
          closestRoad.point,
          closestRoad.road.properties.id,
          )
        }
      )
      .then(newDing=>addDingFB(newDing))
    }
  }

}