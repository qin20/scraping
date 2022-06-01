const ProxyChain = require('proxy-chain');
const axios = require('axios');

const PROXY_POOL = 'http://127.0.0.1:5010';

const server = new ProxyChain.Server({
    port: 8188,
    verbose: true,
    prepareRequestFunction: async (options) => {
        const resp = await axios.get(`${PROXY_POOL}/get`);
        console.log('================================', resp.data.proxy);
        return {
            upstreamProxyUrl: `http://${resp.data.proxy}`,
            failMsg: 'Bad username or password, please try again.',
        };
    },
});

server.listen(() => {
    console.log(`Proxy server is listening on port ${server.port}`);
});

// Emitted when HTTP connection is closed
server.on('connectionClosed', ({ connectionId, stats }) => {
    console.log(`Connection ${connectionId} closed`);
    console.dir(stats);
});

// Emitted when HTTP request fails
server.on('requestFailed', ({ request, error }) => {
    console.log(`Request ${request.url} failed`);
    console.error(error);
});
