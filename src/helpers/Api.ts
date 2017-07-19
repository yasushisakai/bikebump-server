import { ref } from '../config/constants';
import { IDing, ITimestamp } from './DingManager';
import { IClosestPoint } from './Map';

export function listenDings (cb: (dings: any) => any, errorCb): void {
  ref.child('dings').on('value', (snapshot) => {
    const dings = snapshot.val() || {};
    cb(dings);
  }, errorCb);
}

export function listenRoads (cb: (roads: any) => any, errorCb): void {
  ref.child('roads').on('value', (snapshot) => {
    const roads = snapshot.val() || {};
    cb(roads);
  }, errorCb);
}

export async function fetchDings (): Promise<any> {
  try {
    return await ref.child(`dings`).once('value')
      .then((snapshot) => snapshot.val());
  } catch (error) {
    console.error(error);
  }
}

export async function createDing (ding: IDing): Promise<string> {
  const dingId: string = await ref.child('dings').push().key;
  const newDing: IDing = {...ding, dingId};
  await ref.child(`dings/${dingId}`).set(newDing);
  return Promise.resolve(dingId);
}

export async function appendTimestamp (dingId: string, timestamp: number, timestampData: ITimestamp) {
  await ref.child(`dings/${dingId}/timestamps/${timestamp}`).set(timestampData);
}

async function updateDing (dingId: string, roadId: number, closestPoint: IClosestPoint): Promise<void> {
  const directory = `dings/${dingId}`;
  try {
  await ref.child(`${directory}/closestRoadPoint`).set(closestPoint);
  await ref.child(`${directory}/roadId`).set(roadId);
  } catch (error) {
    console.error(error);
  }
}

export async function createRoad (road: any): Promise<void> {
  try {
    await ref.child(`roads/${road.properties.id}`).set(road);
  } catch (error) {
    console.error(error);
  }
}

export async function handleUpdateDing (dingId: string, closestRoad): Promise<void> {
  const {closestPoint, road} = closestRoad;
  try {
    await updateDing(dingId, road.properties.id, closestPoint);
    await createRoad(road);
  } catch (error) {
    console.error(error);
  }
}

export async function dropDing (dingId: string) {
  await ref.child(`dings/${dingId}`).set(null);
}

//
// generic value get function
//

export async function getChild (path: string): Promise<any> {
  try {
    const snapshot = await ref.child(path).once('value');
    return snapshot.val() || {};
  } catch (error) {
    console.log(error);
  }
}

export async function setValue (path: string, value: any): Promise<void> {
  try {
    return await ref.child(path).set(value);
  } catch (error) {
    console.log(error);
  }
}

export async function overwriteCommutes (commutes: object): Promise<void> {
  try {
    return await ref.child('commutes').set(commutes);
  } catch (error) {
    console.log(error);
  }
}
