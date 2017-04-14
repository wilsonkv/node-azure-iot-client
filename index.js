'use strict';

var clientFromConnectionString = require('azure-iot-device-amqp').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var connStr = 'HostName=WilzIoTHub.azure-devices.net;DeviceId=nodejsdevice;SharedAccessKey=pCcnUasTURIaelJLa+58gL39yN+T3DrQwSxEe4W85DE=';

var client = clientFromConnectionString(connStr);

function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
    };
}

var i = 0;

var connectCallback = function (err) {
    if (err) {
        console.log('Could not connect to IoT Hub: ' + err);
    } else {
        console.log('Client connected to IoT Hub');

        client.on('message', function (msg) {
            client.complete(msg, printResultFor('completed'));

            if (msg.data[0] == 42) {
                console.log("\x1b[33m", 'Command = ' + msg.data);
                console.log("\x1b[0m", '------------------');
            } else {
                console.log("\x1b[31m", 'Command = ' + msg.data);
                console.log("\x1b[0m", '------------------');
            }
        });

        // Create a message and send it to the IoT Hub every second
        setInterval(function () {
            i++;



            var cel = Math.floor(Math.random() * (32 - 20 + 1) + 20);
            var fahr = ((cel * 9) / 5) + 32;
            var humid = Math.floor(Math.random() * (85 - 72 + 1) + 72);
            var pressure = Math.floor(Math.random() * (1012 - 1008 + 1) + 1008);
            var meters = 9;
            var payload = JSON.stringify({
                deviceId: 111,
                location: 'Cochin',
                // celsius & fahrenheit are averages taken from both sensors on the shield
                celsius: cel,
                fahrenheit: fahr,
                relativeHumidity: humid,
                pressure: pressure,
                meters: meters,
                feet: (meters/0.3048)
            });

            //            var data = JSON.stringify({
            //                numberOfCycles: Math.floor(Math.random()*(max-min+1)+min)
            //            });
            var message = new Message(payload);
            // Use Routing
            message.properties.add('severity', 'high');

            console.log("Telemetry sent: " + message.getData());
            client.sendEvent(message, printResultFor('send'));
        }, 2000);
    }
};

console.log("\x1b[31m", 'NodeJs IoTHub DEMO');
console.log("\x1b[0m", '==================');

client.open(connectCallback);
