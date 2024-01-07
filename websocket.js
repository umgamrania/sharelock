const ws = require("ws");
const events = require("events");
const net = require("net");
const { flood } = require("./network");
const { Device } = require("./device");

let connections = {}

function initWebSocket(){
    const eventEmitter = new events.EventEmitter();

    const server = new ws.Server({port: 8080});
    console.log("WebSocket listening");

    server.on('connection', websocket => {
        connections[websocket._socket.remoteAddress] = {
            "ws": websocket
        }

        websocket.onmessage = msgStr => {
            let msg = JSON.parse(msgStr.data);

            if(msg.type == "flood") {
                flood(device => {
                    websocket.send(JSON.stringify({
                        type: "newDevice",
                        device: device
                    }));
                });
            }

            else if(msg.type == "getAllDevices") {
                websocket.send(JSON.stringify({
                    devices: Device.getAvailableDevices()
                }));
            }

            else if(msg.type == "openConnection") {
                let plainSocket = net.connect(49153, msg.peerIp);
                plainSocket.on('connect', () => {
                    connections[websocket._socket.remoteAddress].plainSocket = plainSocket;
                    plainSocket.write("ls\r\n");
                    
                    let buf = "";
                    plainSocket.on('data', data => {
                        buf += data.toString();
                        if(buf.endsWith("\r\n")){
                            websocket.send(JSON.stringify({
                                type: "peerData",
                                data: buf
                            }));
                            buf = "";
                        }
                    });
                });
            }

            else if(msg.type == "peerData") {
                let plainSocket = connections[websocket._socket.remoteAddress].plainSocket;
                console.log(msg.data);
                plainSocket.write(msg.data);
            }
        }
    });
    
    return eventEmitter;
}

function broadcast(data){
    for(client of Object.values(connections)){
        client.ws.send(JSON.stringify(data));
    }
}

module.exports = {
    initWebSocket,
    broadcast
}