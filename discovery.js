/**
 * Components:
 * - PingServerSocket -> listen for incomming ping
 * - ackn -> send acknowledgement
 */

const net = require("net");
const { Device } = require("./device");

let deviceName = "Vivobook";

/**
 * 
 * @param { Function } newDeviceCallback Callback for new device event
 */
function initPingServerSocket(newDeviceCallback){
    let serverSocket = net.createServer(
        socket => {
            // Incomming ping connection

            socket.on('data', data => {
                // Incomming discovery message
                
                let device = processDiscoveryMessage(data.toString(), socket);

                // This function accepts a callback, that is called (if provided)
                // when a new device is added, it could be by either ping or ackn
                if(newDeviceCallback)
                    newDeviceCallback(device);
            });
        }
    );

    serverSocket.listen(49152, "0.0.0.0", () => {console.log("Ping server listening")});
}

/**
 * Process the ping/ackn message, generate the device from it
 * @param { String } msg Incomming Discovery message from socket
 * @param { net.Socket } socket Socket connection object that the message came from
 * @returns { Device } Device object created from the discovery message
 */
function processDiscoveryMessage(data, socket){
    // Discovery message format: MSG_TYPE\rDEVICE_NAME\rDEVICE_TYPE\r\n

    let dataString = data.toString().trimEnd();

    // Unpacking message
    let [messageType, deviceName, deviceType] = dataString.split("\r");
    console.info(`${messageType} ${deviceName} ${deviceType}`);

    // If its a valid ping message, then we need to send back an acknowledgement
    if(messageType == "PING")
        sendAckn(socket);

    const senderIp = socket.remoteAddress;

    // Creating Device object to pass to the callback,
    // as well as adding it to the list of available devices
    const device = new Device(deviceName, deviceType, senderIp);

    return device;
}

/**
 * 
 * @param { net.Socket } socket The socket connection object to send back ackn
 */
function sendAckn(socket){
    let acknMsg = `ACKN\r${deviceName}\rlaptop`;
    socket.write(acknMsg);
}

module.exports = {
    deviceName,
    sendAckn,
    processDiscoveryMessage,
    initPingServerSocket
}