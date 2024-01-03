/**
 * Components:
 * - PingServerSocket -> listen for incomming ping
 * - ping -> send outgoing ping
 * - ackn -> send acknowledgement
 */

const net = require("net");
const { Device } = require("./device");

/**
 * 
 * @param {Function} newDeviceCallback Callback for new device event
 */
function initPingServerSocket(newDeviceCallback){
    let serverSocket = net.createServer(
        socket => {
            // Incomming ping connection

            socket.on('data', data => {
                // Incomming ping message
                // Ping format: MSG_TYPE\rDEVICE_NAME\rDEVICE_TYPE\r\n

                let dataString = data.toString().trimEnd();

                // Unpacking message
                let [messageType, deviceName, deviceType] = dataString.split("\r");
                console.info(`${messageType} ${deviceName} ${deviceType}`);

                const senderIp = socket.remoteAddress;

                // Creating Device object to pass to the callback,
                // as well as adding it to the list of available devices
                const device = new Device(deviceName, deviceType, senderIp);
                
                // Discovery module accepts a callback, that is called
                // when a new device is added, it could be by either ping or ackn
                newDeviceCallback(device);
            });
        }
    );

    serverSocket.listen(49152, "0.0.0.0", () => {console.log("Ping server listening")});
}

module.exports = {
    initPingServerSocket
}