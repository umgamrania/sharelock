let ws = new WebSocket("ws://localhost:8080")
ws.onmessage = msg => {
    let msgJson = JSON.parse(msg.data);
    if("devices" in msgJson){
        for(let device of msgJson.devices){
            document.querySelector(".device-container").appendChild(getDevice(device));
        }
    }
    else if(msgJson.type == "newDevice"){
        document.querySelector(".device-container").appendChild(getDevice(msgJson.device));
    }
    else{
        let tokens = msgJson.data.split("\t");
        renderFiles(tokens[3], tokens[4]);
    }
}

ws.onopen = () => {
    send({type: "getAllDevices"});
}

function send(data){
    ws.send(JSON.stringify(data));
}

function renderFiles(folders, files){
    let back = document.createElement("p");
    back.innerHTML = "<- Back";
    back.className = "back";
    back.onclick = () => {
        send({type: "peerData", data: "backn\r1\r\n"});
        document.querySelector(".explorer").innerHTML = "";
    }
    document.querySelector(".explorer").appendChild(back);

    for(let folder of folders.split("\n")){
        let item = getFolder(folder);
        item.onclick = () => {
            send({type: "peerData", data: `cd\r${item.innerText}\r\n`});
            document.querySelector(".explorer").innerHTML = "";
        }
        document.querySelector(".explorer").appendChild(item);
    }
    for(let folder of files.split("\n")){
        let item = getFolder(folder);
        document.querySelector(".explorer").appendChild(item);
    }
}

function getFolder(data){
    let [name] = data.split("\r");
    let p = document.createElement("p");
    p.innerText = name;
    return p;
}
function getDevice(data) {
    let div = document.createElement("div");
    div.className = "device";

    let p = document.createElement("p");
    p.className = "name";
    p.innerText = data.deviceName;

    let ip = document.createElement("p");
    ip.className = "ip";
    ip.innerText = data.ip;

    div.appendChild(p);
    div.appendChild(ip);

    div.onclick = () => {
        send({type: "openConnection", peerIp: data.ip});
    }

    return div;
}