const tunneller = require('localtunnel');

let tunnel;

module.exports = {
    connect: async function(port) {
        tunnel = await tunneller({subdomain: '507f191e810c19729de860ea', port: port});
        return tunnel.url;
    },
    disconnect: function() {
        tunnel.on('close', () => {});
    },
}
