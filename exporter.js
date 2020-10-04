const client = require('prom-client');
const waitingGauge = new client.Gauge({ 
    name: 'themeparks_waiting_time', 
    help: 'waiting time for configured themeparks',
    labelNames: ['rideId', 'rideName'],
});

const Themeparks = require("themeparks");

let park = null;

const register = client.register;

function initExporter(parkId) {
    park = new Themeparks.Parks[parkId]();
}

async function checkWaitTimes() {
    process.stdout.write("Checking waiting time...");
    if(park === null) {
        console.log("Park ID not configured!")
        return;
    }
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

function getMetrics() {
    return register.metrics();
}

function getContentType() {
    return register.contentType;
}

module.exports = {
    initExporter,
    checkWaitTimes,
    getMetrics,
    getContentType
}