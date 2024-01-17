// websocket/index.js

const io = require('./events');

const attach = (server) => {
    io.attach(server);
}

module.exports = {
    io,
    attach
}