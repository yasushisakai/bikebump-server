import axios, {AxiosError, AxiosResponse} from 'axios'

interface ILatLng {
  lat: number
  lng: number
}

interface ITile {
  x: number
  y: number
  z: number
}

function lng2Tile (lng: number, zoom: number): number {
  return (Math.floor(lng + 180) / 360 * Math.pow(2, zoom))
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
  const url: string = `http://tile.mapzen.com/mapzen/vector/v1/roads/${formattedTile}.json?api_key=mapzen-Aw74ZDm`

  return axios(url)
    .then((response: AxiosResponse) => response.data.features)
    .catch((error: AxiosError) => { console.error()})
}

export function fetchRoadsfromLatLng (latLng: ILatLng): Promise<any> {
  const tile: ITile = latLng2Tile(latLng, 15)
  return fetchRoadsFromTile(tile)
}
