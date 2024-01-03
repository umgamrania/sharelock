/**
 * This file contains mechanism to flood the network, send ping
 * to all devices in the network
 */

const { networkInterfaces } = require("os");
const discovery = require("./discovery");
const net = require("net");

const SOCKET_TIMEOUT_MS = 2000;

/**
 * @returns List of local IPs
 */
function getLocalIp(){
    const nets = networkInterfaces();
    const results = [];

    for (const name of Object.keys(nets)) {
        for(const interfaceData of nets[name]){
            if(interfaceData.address.startsWith("192.168")){
                results.push(interfaceData.address);
            }
        }
    }

    return results;
}

/**
 * 
 * @param { String } ip IP address of the device to ping
 */
function ping(ip, callback){
    // Need a way to stop trying to connect if no response
    // after a certain time period

    var timer;  // to store the id of timeout

    let socket = net.createConnection(49152, ip)
        .on('connect', _ => {
            // if connection succeeded, no need to distroy socket
            clearTimeout(timer);

            // sending ping
            socket.write(`PING\r${discovery.deviceName}\rlaptop\r\n`);
        })
        .on('data', data => {
            let dataString = data.toString().trimEnd();
            let device = discovery.processDiscoveryMessage(dataString, socket);
            if(callback){
                callback(device);
            }
        });

    timer = setTimeout(() => {
        socket.destroy();
    }, SOCKET_TIMEOUT_MS);
}

/**
 * Flood the network, send ping to all devices on network
 */
function flood(callback){
    let selectedIp = getLocalIp()[0];
    let [a, b, netId, c] = selectedIp.split(".");

    for(let i = 1; i < 255; i++){
        ping(`192.168.${netId}.${i}`, callback);
    }
}

module.exports = {
    getLocalIp,
    ping,
    flood
}