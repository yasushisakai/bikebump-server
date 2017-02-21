import {
  ref,
  listenToDings,
  addDingFB,
  appendDingFB,
  addRoadFB,
  deleteTimeStamp,
  changeTimeStampValue,
} from './firebase'

import RoadHelper from './RoadHelper'
import Utilities from './Utilities'

import { getClosestRoad, fetchRoads } from './Map'

export const dingRadius = 15 //m

export default class Dings {

  constructor() {
    this.dings = {}
    listenToDings(this.updateDings.bind(this))
    this.roadHelper = new RoadHelper()
  }

  updateDings(dings) {
    this.dings = dings
  }

  updateTimestamps(){
    Object.keys(this.dings).map(dingId=>{
      const ding = this.dings[dingId]
      const timeStampKeys = Object.keys(ding.timestamps)
      let cnt = 0
      for(let i=1;i<timeStampKeys.length;i++){
        const prevTimestamp = timeStampKeys[i-1]
        const prevRecord = ding.timestamps[prevTimestamp]
        const timestamp = timeStampKeys[i]
        const record = ding.timestamps[timestamp]

        const interval = parseInt(timestamp)-parseInt(prevTimestamp)
        if(interval<6000 && record.uid === prevRecord.uid){
          //cnt++
          deleteTimeStamp(dingId,prevTimestamp)
          changeTimeStampValue(dingId,timestamp,1)
        }
      }
      //console.log(cnt,timeStampKeys.length)
    })
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
    if(closestDing !== '' && minimalDistance < this.dings[closestDing].radius){

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