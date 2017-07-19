import { tidy } from '@mapbox/geojson-tidy';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as haversine from 'haversine';
import { getChild, overwriteCommutes, getNewCommuteId } from './Api';

export async function saveAll () {
    const all = await getChild('/');
    const now = Date.now();
    console.log(`saving file ${now}`);

    if (!existsSync('out')) {
        mkdirSync('out');
    }

    writeFileSync(`out/all_${now}.json`, JSON.stringify(all));
}

function verbose ({lat, lng}) {
    return {latitude: lat, longitude: lng};
}

function convertToGeoJSON (commute) {
        let timestamps = [];
        const coordinates = Object.keys(commute)
            .filter((key) => key !== 'uid')
            .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
            .map((key) => {
                timestamps.push(key);
                return key;
            })
            .map((timestamp) => {
                const coord = commute[timestamp];
                return [coord.lng, coord.lat];
            });

        const geoJSON = {
            features: [
                {geometry: {
                    coordinates,
                    type: 'LineString',
                },
                properties: {
                    coordTimes: timestamps,
                },
                type: 'Feature',
                },
            ],
            type: 'FeatureCollections',
        };

        return geoJSON;
}

function trimCommute (commute) {
    const newCommute = {};

    Object.keys(commute)
        .filter((key) => key !== 'uid' && key !== 'origin')
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
        .map((timestamp, i, ary) => {
            if (i < ary.length - 2) {
                const pos1 = verbose(commute[timestamp]);
                const nextTimestamp = parseInt(ary[i + 1], 10);
                const pos2 = verbose(commute[nextTimestamp]);
                const duration = nextTimestamp - parseInt(timestamp, 10);
                const distance = haversine(pos1, pos2);
                const speed = distance / (duration / 3600000); // km/h
                if (0.5 < speed && speed < 75) {
                    newCommute[timestamp] = commute[timestamp];
                    }
                }
            });

    return newCommute;
}

function featureToCommutes (uid, origin, geoJSON) {
    const newCommutes = {};
    geoJSON.features.map(async (feature, index) => {
        const newCommute = {uid, origin};
        // console.log(feature.properties);
        feature.geometry.coordinates.map((coordinate, i) => {
            const timestamp = feature.properties.coordTimes[i];
            newCommute[timestamp] = {lng: coordinate[0], lat: coordinate[1]};
        });
        if (index === 0) {
            newCommutes[origin] = newCommute;
        } else {
            try {
            const id = await getNewCommuteId();
            newCommutes[id] = newCommute;
            } catch (error) {
                console.error(error);
                process.exit(1);
            }
        }
    });
    return newCommutes;
}

export async function cleanCommutes () {
    const commutes = await getChild('/commutes');

    console.log(Object.keys(commutes).length);

    let newCommutes = {};

    Object.keys(commutes).map((id) => {
        if (Object.keys(commutes[id]).length > 3) {
            const uid = commutes[id].uid;
            if (!commutes[id].origin) { 
            const commute = trimCommute(commutes[id]);
            const tidyGeoJSON = tidy(convertToGeoJSON(commute));
            const tempCommutes = featureToCommutes(uid, id, tidyGeoJSON);
            newCommutes = { ...newCommutes, ...tempCommutes};
            // newCommutes[id] = {...commute, uid};
            } else {
                newCommutes[id] = commutes[id];
            }
        }
    });

    console.log(Object.keys(newCommutes).length);

    overwriteCommutes(newCommutes);
}
