const {checkWaitTimes, getMetrics, getContentType, initExporter} = require('./exporter');
const express = require('express');
const server = express();
const config = require('./config.json');

function setupServer() {
    server.get('/metrics', async (req, res) => {
        try {
            res.set('Content-Type', getContentType());
            res.end(await getMetrics());
        } catch (ex) {
            res.status(500).end(ex);
        }
    });

    const port = config.port || 9010;
    console.log(
        `Server listening to ${port}, metrics exposed on /metrics endpoint`,
    );
    server.listen(port);
}

if(!config.park) {
    console.log("Park Id not configured in config.json!");
    process.exit(1);
}

initExporter(config.park)
setupServer();

const interval = config.interval || 300;

checkWaitTimes();
setInterval(async () => {
    checkWaitTimes();
}, interval * 1000);