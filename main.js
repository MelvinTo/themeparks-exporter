const client = require('prom-client');
const waitingGauge = new client.Gauge({ 
    name: 'themeparks_waiting_time', 
    help: 'waiting time for configured themeparks',
    labelNames: ['rideId', 'rideName'],
});

const Themeparks = require("themeparks");
const config = require('./config.json');
if(!config.park) {
    throw new Error("park in config file is required!")
}

const park = new Themeparks.Parks[config.park]();

const express = require('express');
const server = express();

const register = client.register;

async function checkWaitTimes() {
    process.stdout.write("Checking waiting time...");
    const rideTimes = await park.GetWaitTimes();
    for(const ride of rideTimes) {
        if(ride.waitTime !== null) {
            waitingGauge.set({
                rideName: ride.name,
                rideId: ride.id
            }, ride.waitTime)
        }
    }
    process.stdout.write("Done\n");
}

function setupServer() {
    server.get('/metrics', async (req, res) => {
        try {
            res.set('Content-Type', register.contentType);
            res.end(await register.metrics());
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

setupServer();

checkWaitTimes();
setInterval(async () => {
    checkWaitTimes();
}, 5 * 60 * 1000);