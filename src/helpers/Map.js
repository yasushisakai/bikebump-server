import axios from 'axios'
import Line from './Line'
import Point from './Point'

// 
// MAP helper
//

function lng2tile(lon, zoom) { return (Math.floor((lon+180)/360*Math.pow(2, zoom)))}
function lat2tile(lat, zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2, zoom)))}


export function latLng2Tiles (latLng, z) { //z = zoom
  
  let coord = []
  const x = lng2tile(latLng.lng, z)
  const y = lat2tile(latLng.lat, z)
  
  for(let i=0;i<3;i++){
    for(let j=0;j<3;j++){
      coord.push({z, x:x+i-1, y:y+j-1}) // get moore neighborhood
    }
  }

  return coord
}

export function formatForURL ({z, x, y}){
  return `${z}/${x}/${y}`
}

//
// thank you Nina! (https://github.com/ninalutz)
// https://mapzen.com/projects/vector-tiles/
//
export function fetchRoads (lat=42.355121, lng=-71.102801, zoom=16) {
  const fileCoordinates = latLng2Tiles({lat, lng}, zoom)

  const promises = fileCoordinates.map((zxy) => {
    return axios.get(`http://tile.mapzen.com/mapzen/vector/v1/roads/${formatForURL(zxy)}.json?api_key=mapzen-Aw74ZDm`)
  })

  return Promise.all(promises)
    .then(results => {
      let features = []
      // below, I'm flattenning fetched data
      results.map(responses => {
        responses.data.features.map(road => {
          features.push(road)
        })
      return features
      }) 
    })
    .catch(error => {console.log(error)})
}

function latLngArrayToObject(array){
  return {lat:array[1], lng:array[0]}
}

export function getCloseRoads (lat, lng) {
  const tileIds = latLng2Tiles({lat, lng}, 17)
  
  let promises = []
  
  tileIds.map(tileId => {
    promises.push(fetchTile(tileId))
  })
  return Promise.all(promises)
    .then(results => results.map(result => result.features))
    .then(features => features.reduce((acc, curr) => acc.concat(curr), []))
    .catch(error => console.error('getCloseRoads', error))
}
export function fetchTile (tileCoord) {
  const stringCoord = formatForURL(tileCoord)
  return axios.get(`http://tile.mapzen.com/mapzen/vector/v1/roads/${stringCoord}.json?api_key=mapzen-Aw74ZDm`)
    .then(res => res.data)
}

function convertRoadGeometryToLatLngObject(roadGeometry){
  if(roadGeometry.type==='LineString'){
    return roadGeometry.coordinates.map((coordinate => latLngArrayToObject(coordinate)))
  }else{
    return roadGeometry.coordinates.map((lineString) => {
      return lineString.map(coordinate => latLngArrayToObject(coordinate))
    })
  }
}

export function getClosestRoad (lat, lng, roads) {
  
  let closestPoint = null
  let closestDistance = Math.pow(2, 50)
  let closestRoad = null
  let closestDirection = null

  roads.map((road) => {
    //console.log(road.geometry.coordinates[0])
    if(getRoadTotalDistance(road)>5){

      const {distance, point, direction} = getClosestRoadPoint([ lat, lng ], road)
      //console.log(distance,point,direction)

      if(closestDistance > distance){
        closestDistance = distance
        closestPoint = point
        closestRoad = road
        closestDirection = direction
      }
    }

  })

  if(closestRoad){
    const latLngObjects = convertRoadGeometryToLatLngObject(closestRoad.geometry)
    closestRoad.geometry.coordinates = latLngObjects
  }

  return {point:closestPoint, distance:closestDistance, road:closestRoad, direction:closestDirection}
}

export function getRoadTotalDistance (road){
  let dist =0

  if(road.geometry.type==='LineString'){
    road.geometry.coordinates.map((coord, index) => {
      if(index===0) return null
      const pPoint = Point.fromArray(road.geometry.coordinates[index-1])
      dist += pPoint.distanceToInMeters(Point.fromArray(coord))
    })
  }else if(road.geometry.type==='MultiLineString'){
    road.geometry.coordinates.map(linestring => {
      if(linestring.length < 2) return  
      linestring.map((coord, index) => {
        if(index===0) return null
        const pPoint = Point.fromArray(linestring[index-1])
        dist += pPoint.distanceToInMeters(Point.fromArray(coord))
      })
    })
  }
  return dist
}

export function getClosestRoadPoint (coordinate, road) { 

  let closestPoint = null
  let closestDistance = Math.pow(2, 50)
  let direction = null

  const coordPoint = new Point(coordinate[1], coordinate[0]) // lng=x, lat=y
  if(road.geometry.type === 'LineString'){
    road.geometry.coordinates.map((coord, index) => {
      if(index !== 0) {

        const line = Line.fromArray(road.geometry.coordinates[index-1], coord)
        const cp = line.getClosestPointTo(coordPoint)
        const tempDistance = cp.distanceToInMeters(coordPoint)
        if(closestDistance > tempDistance){
          direction = line.getDirection().unitize()
          closestPoint = cp
          closestDistance = tempDistance
        }
      }
    })
  }else{ // MultiLineString
    road.geometry.coordinates.map((coords) => {
      coords.map((coord, index) => {
        if(index !== 0) {
          const line = Line.fromArray(coords[index-1], coord)
          const cp = line.getClosestPointTo(coordPoint)
          const tempDistance = cp.distanceToInMeters(coordPoint)

          if(closestDistance > tempDistance){
            direction = line.getDirection().unitize()
            closestPoint = cp
            closestDistance = tempDistance
          }

        }
      })
    })
  }

  return {distance:closestDistance, point:closestPoint, direction}
}
