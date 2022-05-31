const axios = require('axios');
const randomUseragent = require('random-useragent');
const logger = require('pino')();

// 代理池地址
const PROXY_POOL = 'http://127.0.0.1:5010';

/**
 * 从代理池中获取一个代理
 * @returns string
 */
async function getProxy() {
    try {
        logger.debug('获取代理开始...');
        const resp = await axios.get(`${PROXY_POOL}/get`);
        logger.debug({ proxy: resp.data.proxy }, '获取代理成功');
        return resp.data.proxy;
    } catch (e) {
        logger.warn(`获取代理失败 - ${e.message}`);
    }
}

/**
 * 从代理池中删除一个代理
 * @param {string} proxy
 */
async function removeProxy(proxy) {
    if (!proxy) {
        return;
    }
    try {
        logger.debug({ proxy }, '删除代理开始...');
        await axios.get(`${PROXY_POOL}/delete?proxy=${proxy}`);
        logger.debug('删除代理成功');
    } catch (e) {
        logger.warning(`删除代理失败 - ${e.message}`);
    }
}

/**
 * 代理字符串转成代理对象
 * @param {string} url
 * @returns obj { host: string; port: number; }
 */
function url2Obj(url) {
    if (!url) return;
    return { host: url.split(':')[0], port: +url.split(':')[1] };
}

/**
 * 爬虫函数，获取一个地址的内容
 * @param {string} url
 * @returns string
 */
async function scraping(url, options = {}) {
    logger.info({ url }, '抓取内容开始...');
    if (!url) {
        logger.error('抓取内容失败，缺少URL参数');
        return;
    }
    return new Promise((resolve, reject) => {
        /**
         * 每个url支持一定数量的重试次数，默认为5次
         * @param {*} times
         */
        async function go(times = 0) {
            const proxy = await getProxy();
            const { retry = 10, ...restOptions } = options;
            const opts = {
                headers: {
                    'User-Agent': randomUseragent.getRandom((ua) => {
                        const os = ['Mac OS', 'Windows'];
                        const bs = ['Firefox', 'Safari', 'Chrome'];
                        const result = os.includes(ua.osName) && bs.includes(ua.browserName);
                        return result;
                    }),
                },
                proxy: url2Obj(proxy),
                timeout: 30 * 1000,
                ...restOptions,
            };
            logger.info(opts, '请求开始...');
            axios.get(url, opts)
                .then(async (resp) => {
                    logger.info(resp.data, '请求成功');
                    await removeProxy(proxy);
                    logger.info('抓取内容结束');
                    resolve(resp.data);
                })
                .catch(async (e) => {
                    logger.warn(`请求失败 - ${e.message}`);
                    await removeProxy(proxy);
                    if (times < retry) {
                        logger.info(`开始重试请求${times + 1}/${retry}...`);
                        go(times + 1);
                    } else {
                        logger.error(e, '抓取内容失败');
                        reject(e);
                    }
                });
        }

        go();
    });
}

module.exports = scraping;
