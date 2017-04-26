import {dingRadius} from './Dings'

/**
 * uniquify
 *
 * gets rid of redundant elements inside a array
 * @param array
 * @returns {Array}
 */
export function uniquify(array) {
    let u = {}
    let a = []

    for (let i = 0, l = array.length; i < l; ++i) {
        if (!u.hasOwnProperty(array[i])) {
            a.push(array[i])
            u[array[i]] = 1
        }
    }
    return a
}

export function toRadians(degrees) {
    return degrees * Math.PI / 180
}

function toDegrees(radians) {
    return radians * 180 / Math.PI
}

/**
 * convertColorValuesToHex
 * @param _num
 * @returns {string}
 */
function convertColorValuesToHex(_num) {
    let hexString = Number(_num).toString(16)
    return hexString.length == 1 ? '0' + hexString : hexString
}

/**
 * hslToRgb
 * converts a hsl color to rgb
 * ref: http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 * @param h
 * @param s
 * @param l
 * @returns {*[]} : rgb value
 */
export function hslToRgb(h, s, l) {
    let r, g, b

    if (s == 0) {
        r = g = b = l // achromatic
    } else {

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s
        var p = 2 * l - q
        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
    }

    return [ r * 255, g * 255, b * 255 ]
}

export function hue2rgb(p, q, t) {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1 / 6) return p + (q - p) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
            return p
}

/**
 * getColor
 * returns a rgb color value from a parameter t value (0<t<1)
 * @param t
 * @returns {string}
 */
export function getColor(t) {

    let minHueValue = 0.0
    let maxHueValue = 120.0 / 360.0

    let H = (maxHueValue - minHueValue) * (1.0 - t) + minHueValue

    let minSatValue = 0.6
    let maxSatValue = 0.85

    let S = (maxSatValue - minSatValue) * (1.0 - t) + minSatValue

    let rgbArray = hslToRgb(H, S, 0.6)

    return '#' + rgbArray.reduce((p, c) => {

        return p + convertColorValuesToHex(c.toFixed(0))

    }, '')

}

/**
 * distFromLatLng
 * calculates the distance between two latlng values in Meters
 * ref:
 * http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
 *
 * @param lat1
 * @param lng1
 * @param lat2
 * @param lng2
 * @returns {number} : distance in METERS
 */
export function distFromLatLng(lat1, lng1, lat2, lng2) {

    var R = 6378.137 * 1000 // Radius of the earth in m
    var dLat = (lat2 - lat1) * (Math.PI / 180.0)
    var dLon = (lng2 - lng1) * (Math.PI / 180.0)
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180.0)) * Math.cos(lat2 * (Math.PI / 180.0)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    var d = R * c // Distance in meters

    return d
}

export function formatRoad(roadId, name, closestPt, distance, closestLine) {
    return {
        roadId,
        name,
        closestPt,
        distance,
        closestLine,
    }
}

export function formatDing(lat, lng, uid, timestamp, value) {
    const initialTimeStamp = {
        uid,
        value,
    }
    const initialDing = {
        dingId: '',
        coordinates: {
            lat,
            lng,
        },
        radius: dingRadius, // default
        timestamps: {},
    }

    initialDing.timestamps[timestamp] = initialTimeStamp
    return initialDing
}
