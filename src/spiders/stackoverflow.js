const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const invariant = require('tiny-invariant');
const scraping = require('../utils/scraping');
const concurrent = require('../utils/concurrent');

const tagged = process.argv[2];

invariant(tagged, '未指定tagged');

const dataPath = path.resolve(__dirname, `../../tmp/${tagged}.js`);
const dataCachePath = path.resolve(__dirname, `../../tmp/${tagged}-cache.js`);

let data = require(dataPath) || {};
let dataCache = require(dataCachePath) || {};

(async () => {
    let page = 0;
    const pageTotal = 20000;
    concurrent(() => {
        while (dataCache[++page]) {
            continue;
        }
        if (page > pageTotal) {
            return null;
        }
        const currentPage = page;
        const task = scraping(`https://stackoverflow.com/questions/tagged/${encodeURIComponent(tagged)}?tab=votes&page=${page}&pagesize=50`);
        task.then((html) => {
            const $ = cheerio.load(html);
            const urls = {};
            $('.s-post-summary--content-title a').each((i, a) => {
                urls[a.attribs.href] = 1;
            });
            if (Object.keys(urls).length) {
                data = { ...data, ...urls };
                dataCache = { ...dataCache, [currentPage]: 1 };
                fs.writeFileSync(dataPath, `module.exports = ${JSON.stringify(data, null, 4)};\n`);
                fs.writeFileSync(dataCachePath, `module.exports = ${JSON.stringify(dataCache, null, 4)};\n`);
            }
        }).catch((e) => {
            console.log('=========', e.message);
        });
        return task;
    });
})();
