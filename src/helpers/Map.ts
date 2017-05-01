import axios, {AxiosError, AxiosResponse} from 'axios'
import { ROADLENGTHTHRESHOLD, TILESIZE } from '../config/constants'
import { closestPointFromLine, distance, ILine, IPoint, toRadians } from './Geometry'

export interface ILatLng {
  lat: number
  lng: number
}

interface ITile {
  x: number
  y: number
  z: number
}

export interface IClosestPoint {
  cp: ILatLng
  dist: number
}

// converts a ILatLng to IPoint so called world coordinate
function latLngToWorld (latLng: ILatLng): IPoint {
  let sinY = Math.sin(toRadians(latLng.lat))
  sinY = Math.min(Math.max(sinY, -0.9999), 0.9999)
  return {
    x: TILESIZE * (0.5 + latLng.lng / 360.0),
    y: TILESIZE * (0.5 - Math.log((1 + sinY) / (1 - sinY)) / (4 * Math.PI)),
  }
}

function worldToLatLng (point: IPoint): ILatLng {
  const lng = ((point.x / TILESIZE) - 0.5) * 360.0
  const rady = Math.exp((point.y / TILESIZE - 0.5) * - (4.0 * Math.PI))

  return {
    lat: Math.asin((rady - 1) / (rady + 1)) * 180 / Math.PI,
    lng,
  }
}

function lng2Tile (lng: number, zoom: number): number {
  return (Math.floor((lng + 180) / 360 * Math.pow(2, zoom)))
}

function lat2Tile (lat: number, zoom: number): number {
  return (
    Math.floor(
    (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))
  )
}

function latLng2Tile (latLng: ILatLng, zoom: number): ITile {
  return {
    x: lng2Tile(latLng.lng, zoom),
    y: lat2Tile(latLng.lat, zoom),
    z: zoom,
  }
}

function formatTileForURL ({x, y, z}: ITile): string {
  return `${z}/${x}/${y}`
}

function fetchRoadsFromTile (tile: ITile): Promise<any> {
  const formattedTile: string = formatTileForURL(tile)
  const mapZenKey = `mapzen-vZqnB1d` // minori
  // const mapZenKey = `mapzen-Aw74ZDm`
  const url: string = `http://tile.mapzen.com/mapzen/vector/v1/roads/${formattedTile}.json?api_key=${mapZenKey}`

  return axios(url)
    .then((response: AxiosResponse) => response.data.features)
    .catch((error: AxiosError) => { console.error(error) })
}

function fetchRoadsFromTiles (tiles: ITile[]): Promise<any[]> {
  return Promise.all(tiles.map((tile) => fetchRoadsFromTile(tile)))
    .then((tileRoads) => tileRoads.reduce((flattened, arr) => [...flattened, ...arr], []))
}

function fetchRoadsfromLatLng (latLng: ILatLng): Promise<any> {
  const tile: ITile = latLng2Tile(latLng, 15)
  let tiles: ITile[] = []
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      tiles = [...tiles, {x: tile.x + i, y: tile.y + j, z: tile.z}]
    }
  }
  return fetchRoadsFromTiles(tiles)
}

// http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function latLngDistance (point1: ILatLng, point2: ILatLng): number {
  const R: number = 6378.137 * 1000 // Radius of the earth in m
  const dLat: number = (point2.lat - point1.lat) * (Math.PI / 180.0)
  const dLon: number = (point2.lng - point1.lng) * (Math.PI / 180.0)
  const a: number =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(point1.lat * (Math.PI / 180.0)) * Math.cos(point2.lat * (Math.PI / 180.0)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d: number = R * c // distance in meters
  return d
}

function parseLatLng (latLngArray: number[]): ILatLng {
  return {lat: latLngArray[1], lng: latLngArray[0]}
}

function lineStringLength (coordinates: number[][]): number {
  return coordinates
    .map((coordinate) => parseLatLng(coordinate)) // convert arrays to ILatLng
    .reduce((distance, coordinate, cId, array) => {
    if (cId !== 0) {
      return distance + latLngDistance(array[cId - 1], array[cId])
    } else {
      return distance
    }
  }, 0)
}

function multiLineStringLength (coordinates: number[][][]): number {
  return coordinates
    .reduce((distance, coords) => {
      return distance + lineStringLength(coords)
    }, 0)
}

function roadLength (road: any): number {
  if (road.geometry.type === 'LineString') {
    return lineStringLength(road.geometry.coordinates)
  } else {
    return multiLineStringLength(road.geometry.coordinates)
  }
}
function filterShortRoads (road: any): boolean {
  // returns false if road is shorter than roadLengthThreshold
  // console.log(road.properties.id ? true : false)
  return roadLength(road) > ROADLENGTHTHRESHOLD
}

function filterRoadsWithoutId (road: any): boolean {
 return road.properties.id ? true : false
}

function filterRoad (road: any): boolean {
 return filterShortRoads(road) && filterRoadsWithoutId(road)
}

function lineStringClosestPoint (coordinates: number[][], latLng: ILatLng): IClosestPoint  {
  let closestPoint: IPoint
  const worldExaminePt: IPoint = latLngToWorld(latLng)
  const closestDist: number = coordinates.map((coordinate) => parseLatLng(coordinate))
      .reduce((currentClosestDist, coordinate, cId, array) => {
      if (cId !== 0) {
        // create line segment
        const start: IPoint = latLngToWorld(array[cId - 1])
        const end: IPoint = latLngToWorld(array[cId]) // latLng
        const line: ILine = {start, end}
        // line, point closest point
        const cp = closestPointFromLine(worldExaminePt, line)
        const dist = distance(cp, worldExaminePt)
        if (dist < currentClosestDist) {
          closestPoint = cp
          return dist
        } else {
          return currentClosestDist
        }
      } else {
        return currentClosestDist
      }
    }, 100000000)
  const cp = worldToLatLng(closestPoint)
  const dist = latLngDistance(cp, latLng)
  return {cp, dist}
}

// MultiLineStrings are just one dimension deeper, it's an array of LineStrings
function multiLineStringClosestPoint (coordinates: number[][][], latLng: ILatLng): IClosestPoint {
  return coordinates
    .reduce((currentClosestPoint, lineString) => {
      const tempClosest: IClosestPoint = lineStringClosestPoint(lineString, latLng)
      return currentClosestPoint.dist > tempClosest.dist ? tempClosest : currentClosestPoint
    }, {cp: null, dist: 1000000000000})
}

// get the closest Point to a single road
function roadClosestPoint (road: any, latLng: ILatLng): IClosestPoint {
  if (road.geometry.type === 'LineString') {
    return lineStringClosestPoint(road.geometry.coordinates, latLng)
  } else {
    return multiLineStringClosestPoint(road.geometry.coordinates, latLng)
  }
}

function roadsClosestPoint (roads: any[], latLng: ILatLng): {closestPoint: IClosestPoint, road: any} {
  let closestRoad: any
  const closestPoint: IClosestPoint = roads.reduce((currentClosestPoint, road) => {
    const tempClosest: IClosestPoint = roadClosestPoint(road, latLng)
    if (currentClosestPoint.dist > tempClosest.dist) {
      closestRoad = road
      return tempClosest
    } else {
      return currentClosestPoint
    }
  }, {cp: null, dist: 100000000000})
  return {closestPoint, road: closestRoad}
}

export function closestRoadFromLatLng (latLng: ILatLng): Promise<{closestPoint: IClosestPoint, road: any}> {
  return fetchRoadsfromLatLng(latLng)
    .then((roads) => roads.filter(filterShortRoads))
    .then((roads) => roads.filter(filterRoadsWithoutId))
    .then((roads) => roadsClosestPoint(roads, latLng))
}
