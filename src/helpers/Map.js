import axios from 'axios'
import Line from './Line'
import Point from './Point'

// 
// MAP helper
//i

function lng2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }


export function latLng2Tile (latLng, zoom) {
  return { 
    z:zoom,
    x:lng2tile(latLng.lng,zoom),
    y:lat2tile(latLng.lat,zoom)
  }
}
export function formatForURL ({z,x,y}){
  return `${z}/${x}/${y}`
}

//
// thank you Nina! (https://github.com/ninalutz)
// https://mapzen.com/projects/vector-tiles/
//
export function fetchRoads (lat=42.355121, lng=-71.102801, zoom=17) {
  const fileCoordinates = formatForURL(latLng2Tile({lat,lng},zoom))
  const url = `http://tile.mapzen.com/mapzen/vector/v1/roads/${fileCoordinates}.json?api_key=mapzen-Aw74ZDm`

  return axios(url)
    .then(response=>response.data.features)  // roads
    .catch((error)=>{console.log(error)})
}

function latLngArrayToObject(array){
  return {lat:array[1],lng:array[0]}
}

function convertRoadGeometryToLatLngObject(roadGeometry){
  if(roadGeometry.type==='LineString'){
    return roadGeometry.coordinates.map((coordinate=>latLngArrayToObject(coordinate)))
  }else{
    return roadGeometry.coordinates.map((lineString)=>{
      return lineString.map(coordinate=>latLngArrayToObject(coordinate))
    })
  }
}

export function getClosestRoad (lat, lng, roads) {
  
  let closestPoint = null
  let closestDistance = Math.pow(2,50)
  let closestRoad = null
  let closestDirection = null

  roads.map((road)=>{
    const {distance, point, direction} = getClosestRoadPoint([lat,lng],road)

    if(closestDistance > distance){
      closestDistance = distance
      closestPoint = point
      closestRoad = road
      closestDirection = direction
    }

  })

  const latLngObjects = convertRoadGeometryToLatLngObject(closestRoad.geometry)

  closestRoad.geometry.coordinates = latLngObjects

  return {point:closestPoint, distance:closestDistance, road:closestRoad, direction:closestDirection}
}

export function getClosestRoadPoint (coordinate, road) { 

  let closestPoint = null
  let closestDistance = Math.pow(2,50)
  let direction = null

  const coordPoint = new Point(coordinate[1],coordinate[0]) // lng=x, lat=y
  if(road.geometry.type === 'LineString'){
    road.geometry.coordinates.map((coord,index)=>{
      if(index !== 0) {

        const line = Line.fromArray(road.geometry.coordinates[index-1] ,coord)
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
    road.geometry.coordinates.map((coords,index)=>{
      coords.map((coord,index)=>{
        if(index !== 0) {
          const line = Line.fromArray(coords[index-1],coord)
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