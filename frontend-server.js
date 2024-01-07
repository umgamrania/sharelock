const express = require("express")
const app = express();

app.get('/', (req, res) => {
    res.sendFile("D:/node/frontend/index.html");
});
app.get('/script.js', (req, res) => {
    res.sendFile("D:/node/frontend/script.js");
});
app.get('/style.css', (req, res) => {
    res.sendFile("D:/node/frontend/style.css");
});

function initFrontendServer(){
    app.listen(80);
}

module.exports = {
    initFrontendServer
}