/**
 * 并发控制
 */
const logger = require('pino')();
const duration = require('duration');

/**
 * 并发控制运行getTask
 * @param {function} getTask 获取任务，如果返回结果为空，则认为任务已经完成，会停止
 * @param {number} max 并发数
 * @param {string} taskName
 */
async function concurrent(getTask, max = 10, taskName = '并发') {
    if (!getTask) {
        logger.error(`[${taskName}]任务运行失败，缺少'getTask'参数`);
        return;
    }

    let taskCount = 0;
    let doneCount = 0;

    const start = new Date();

    let logTimeout;
    const log = () => {
        if (logTimeout) {
            clearTimeout(logTimeout);
        }
        logTimeout = setTimeout(() => {
            logger.info(`[${taskName} - concurrent] 当前运行任务${taskCount}, 已完成任务${doneCount}，已运行时间：${duration(start, new Date()).toString('%Hs:%M:%S')}`);
        }, 500);
    };

    const addTask = () => {
        setTimeout(() => {
            log();
            if (taskCount < max) {
                const task = getTask();
                if (task) {
                    taskCount++;
                    task.finally(() => {
                        taskCount--;
                        doneCount++;
                        log();
                    });
                }
            }
            addTask();
        }, Math.random() * 1000);
    };

    addTask();
    return;
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
