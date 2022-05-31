/**
 * 并发控制
 */
const logger = require('pino')();

/**
 * 并发控制运行getTask
 * @param {function} getTask 获取任务，如果返回结果为空，则认为任务已经完成，会停止
 * @param {number} max 并发数
 * @param {string} taskName
 */
async function concurrent(getTask, max = 5, taskName = '并发') {
    if (!getTask) {
        logger.error(`[${taskName}]任务运行失败，缺少'getTask'参数`);
        return;
    }

    let taskCount = 0;

    const next = () => {
        const task = getTask();
        if (task) {
            taskCount++;
            task.then(() => {
                next();
            }).finally(() => {
                taskCount--;
                if (taskCount === 0) {
                    logger.info(`[${taskName}]运行结束。`);
                }
            });
        }
    };

    for (let i = 0; i < max; i++) {
        next();
    }
}

module.exports = concurrent;
