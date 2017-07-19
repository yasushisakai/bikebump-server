import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { latLng, LatLng } from 'leaflet';
import { getChild, overwriteCommutes } from './Api';

export async function saveAll () {
    const all = await getChild('/');
    const now = Date.now();
    console.log(`saving file ${now}`);

    if (!existsSync('out')) {
        mkdirSync('out');
    }

    writeFileSync(`out/all_${now}.json`, JSON.stringify(all));
}

export async function cleanCommutes () {
    const commutes = await getChild('/commutes');

    console.log(Object.keys(commutes).length);

    let newCommutes = {};
    Object.keys(commutes).map((id) => {
        if (Object.keys(commutes[id]).length < 3) {
            newCommutes[id] = commutes[id];
        }
    });

    console.log(Object.keys(newCommutes).length);

    /// overwriteCommutes(newCommutes);
}
