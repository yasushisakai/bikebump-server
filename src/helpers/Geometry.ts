export interface IPoint {
  x: number
  y: number
}

export interface ILine {
  start: IPoint
  end: IPoint
}

export function toRadians (angle): number {
  return angle * Math.PI / 180
}

export function distance (point1: IPoint, point2: IPoint): number {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point2.y, 2))
}

function lineLength (line: ILine): number {
  return distance(line.start, line.end)
}

function normalizePoint (point: IPoint): IPoint {
  const length = distance(point, {x: 0, y: 0})
  return {x: point.x / length, y: point.y / length}
}

function dot (point1: IPoint, point2: IPoint): number {
  return point1.x * point2.x + point1.y * point2.y
}

function angle (point1: IPoint, point2: IPoint): number {
  const norm1 = normalizePoint(point1)
  const norm2 = normalizePoint(point2)
  return Math.acos(dot(norm1, norm2))
}

export function closestPointFromLine (point: IPoint, line: ILine): IPoint {
  const lineEndToPoint: IPoint = {x: line.end.x - point.x, y: line.end.y - point.y}
  const lineDirection: IPoint = {x: line.end.x - line.start.x, y: line.end.y - line.start.y}
  const pointAngle = angle(lineDirection, lineEndToPoint)
  let t = 1.0 - distance(line.end, point) * Math.cos(pointAngle) / lineLength(line)
  t = Math.max(Math.min(1.0, t), 0.0) // point should always within range

  return {
    x: lineDirection.x * t + line.start.x,
    y: lineDirection.y * t + line.start.y,
  }
}
