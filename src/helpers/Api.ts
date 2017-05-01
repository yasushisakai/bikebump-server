import { ref } from '../config/constants'
import { IClosestPoint } from '../helpers/Map'

export function fetchDings () {
  return ref.child(`dings`).once('value')
    .then((snapshot) => snapshot.val())
    .catch((error) => { console.log(error) })
}

function updateDing (dingId: string, roadId: number, closestPoint: IClosestPoint): Promise<void> {
  const directory = `dings/${dingId}`
  return ref.child(`${directory}/closestRoadPoint`).set(closestPoint)
    .then(() => ref.child(`${directory}/roadId`).set({ roadId }))
}

function createRoad (road: any): Promise<void> {
  return ref.child(`roads/${road.properties.id}`).set(road)
}

export function handleUpdateDing (dingId: string, closestPoint: IClosestPoint, road: any): Promise<void> {
  return updateDing(dingId, road.properties.id, closestPoint)
    .then(() => createRoad(road))
}
