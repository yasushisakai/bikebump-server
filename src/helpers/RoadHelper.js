// not using 'import' node.js does not support it.
import fs  from 'fs'
import path  from 'path'
import Point  from './Point'
import Line  from './Line'
import { ref } from './firebase'

/**
 * RoadHelper class
 */
export default class RoadHelper {
    constructor() {
        // have the entire roads.json file in memory
        const exportedRoadsPath = path.resolve(__dirname,'../../data','exported_roads.json')
        this.roadsData = JSON.parse(fs.readFileSync(exportedRoadsPath))
        this.roads = Object.keys(this.roadsData).map((key)=>(this.roadsData[key])) // its already an array....
        this.distanceThreshold = 30 // used to chip off unrelavent reports

    }

    /**
    * addRoadToFB
    * adds the road to FB /roads branch
    * first checks if it is already there..
    */
    addRoadToFB (road) {

        ref.child(`roads/${road.roadId}`).once('value')
            .then((snapshot)=>{
                const roadInServer = snapshot.val()
                if(roadInServer === null){
                    ref.child(`roads/${road.roadId}`).set(road) //FIXME: strip properties with empty string
                        .then(()=>{console.log(`added road to FB: ${road.roadId}`)}) 
                }
            })
            .catch((error)=>{
                console.log(error)
            })
    }


    /**
    * getRoad
    * returns the road information
    */
    getRoad (id) {
        let road = this.roadsData[id]
        const roadId = road.id
        delete road.id
        return {
            ...road,
            roadId:id
        }
    }

    /**
     * findClosest
     * finds the closest road from `this.roads`.
     * Note that this always gives the closest road however far the road is.
     * @param _point : LatLng value (but Point class)
     * @returns {{}} : the closest road w/ the closest Point, distance and roadLine(a segment of the road)
     */
    findClosest({lat,lng}){
        const examinePoint = new Point(lng,lat)
        let closestRoad, closestPt, roadLine, minDistance = 100000000
        // TODO: able to use huge 'reduce'?
        this.roads.map((road, index)=> {
            if (road.geometry.type == "LineString") {
                // TODO : repeating code error prone
                for (let i = 0, l = road.geometry.coordinates.length - 1; i < l; ++i) {
                    let st = Point.fromArray(road.geometry.coordinates[i])
                    let en = Point.fromArray(road.geometry.coordinates[i + 1])
                    let line = new Line(st, en)
                    if (line.getLength() < 0.000000000001) {
                        continue
                    }
                    let closePoint = line.getClosestPointTo(examinePoint)
                    let distance = closePoint.distanceToInMeters(examinePoint)
                    if (minDistance > distance) {
                        minDistance = distance
                        closestRoad = road
                        closestPt = closePoint
                        roadLine = line
                    }
                }
            } else {
                road.geometry.coordinates.map((partialRoad)=> {
                    // TODO: repeated code here
                    for (let i = 0, l = partialRoad.length - 1; i < l; ++i) {
                        let st = Point.fromArray(partialRoad[i])
                        let en = Point.fromArray(partialRoad[i + 1])
                        let line = new Line(st, en)
                        if (line.getLength() < 0.00000000001) {
                            continue
                        }
                        let closePoint = line.getClosestPointTo(examinePoint)
                        let distance = closePoint.distanceToInMeters(examinePoint)
                        if (minDistance > distance) {
                            minDistance = distance
                            closestRoad = road
                            closestPt = closePoint
                            roadLine = line
                        }
                    }
                })
            }
        })
        let result = {}
        result.road = closestRoad
        result.closestPt = closestPt
        result.distance = minDistance
        result.roadLine = roadLine

        // only adds if its in certain range
        if( minDistance < this.distanceThreshold ){
            closestRoad = {...closestRoad, roadId:closestRoad.id}
            delete closestRoad.id
            this.addRoadToFB(closestRoad)
        }

        return result
    }
}
