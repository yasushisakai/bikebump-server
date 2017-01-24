import {
  ref,
  listenToDings,
  addDingFB,
  appendDingFB,
} from './firebase'

import RoadHelper from './RoadHelper'
import Utilities from './Utilities'

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
        timestamp,
        uid,
        value,
      }
      return appendDingFB(closestDing,timestampData)
    }else{
      // create ding
      const closestRoad = this.roadHelper.findClosest({lat,lng})
      const newDing = Utilities.formatDing(lat,lng,uid,timestamp, value)
      newDing.roadId = closestRoad.road.id
      return addDingFB(newDing)
    }
  }

}