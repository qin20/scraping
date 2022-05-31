const scraping = require('./utils/scraping');
const concurrent = require('./utils/concurrent');

(async () => {
    try {
        const data = await scraping('https://stackoverflow.com/questions/tagged/javascript?tab=Votes');
        // const data = await scraping('https://stackoverflow.com/questions/39954826/cloud9-nodejs-error-write-eproto-140261073610560-and-in-localhost-everything');
        // const data = await scraping('https://www.google.com');
        // const data = await scraping('https://www.baidu.com');
        console.log(data);
    } catch (e) {
        // console.log(e);
    }

    // concurrent(() => {
    //     return new Promise((resolve, reject) => {
    //         const time = Math.random() * 10000;
    //         console.log(time);
    //         setTimeout(() => {
    //             console.log(`${time} done.`);
    //             resolve();
    //         }, time);
    //     });
    // });
})();
