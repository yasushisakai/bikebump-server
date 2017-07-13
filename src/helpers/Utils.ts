import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { getChild } from './Api';

export async function saveAll () {
    const all = await getChild('/');
    const now = Date.now();
    console.log(`saving file ${now}`);

    if (!existsSync('out')) {
        mkdirSync('out');
    }

    writeFileSync(`out/all_${now}.json`, JSON.stringify(all));
}
