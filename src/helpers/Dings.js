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

    // go through dings in memory
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

    // APPEND to exisiting ding
    if(minimalDistance < 10){

      const timestampData = {
        timestamp,
        uid,
        value,
      }

      appendDingFB(closestDing,timestampData)
      return Promise.resolve(closestDing) // server response needs the dingID
    
    }else{ // CREATE a new ding

    return fetchRoads(lat,lng) // from mapzen, new feature!
      .then(roads=>getClosestRoad(lat,lng,roads))
      .then(closestRoad=>{
        
        addRoadFB(closestRoad.road)
        // adds the associated road to the database

        return addDingFB(Utilities.formatDing(
          lat,
          lng,
          uid,
          timestamp,
          value,
          closestRoad.point,
          closestRoad.direction,
          closestRoad.road.properties.id,
        ))
      })
    }
  }

}