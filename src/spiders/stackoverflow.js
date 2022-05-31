const path = require('path');
const cheerio = require('cheerio');
const invariant = require('tiny-invariant');
const scraping = require('../utils/scraping');
const concurrent = require('../utils/concurrent');

const tagged = process.argv[2];

invariant(tagged, '未指定tagged');

const dataPath = path.resolve(__dirname, `../../tmp/${tagged}.js`);

let data = require(dataPath) || [];

(async () => {
    let page = 0;
    const pageTotal = 30000;
    concurrent(() => {
        page++;
        if (page > pageTotal) {
            return null;
        }
        const task = scraping(`https://stackoverflow.com/questions/tagged/${encodeURIComponent(tagged)}?tab=votes&page=${page}&pagesize=50`);
        task.then((html) => {
            console.log(html);
            // const $ = cheerio.load(data);
            // const urls = $('.s-post-summary--content-title a').toArray().map((a) => a.href);
            // data = { ...data, ...urls };
            // fs.writeFileSync(dataPath, `module.exports = ${JSON.stringify(data, null, 4)};\n`);
            // console.log(`第${pageNumber}/${total}页数据获取成功。`);
        });
        return task;
    }, 1);
})();
