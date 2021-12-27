const express = require('express');
const LocalTunneller = require('./core/localTunneller');
const Gateway = require('micromq/gateway');

const CHANNEL_PORT = process.env.CHANNEL_PORT || 5672;
const PORT = process.env.PORT || 5001;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '100MB' }));

const gateway = new Gateway({
    microservices: ['files', 'processing'],
    rabbit: {
        url: `amqp://localhost:${CHANNEL_PORT}`,
    },
});

app.use(gateway.middleware());

app.post(['/upload'], async (req, res) => {
    try {
        await res.delegate('files')
    } catch (error) {
        console.log(error);
    }
});

(async() => {
    await app.listen(PORT);
    const url = await LocalTunneller.connect(PORT);
    console.log(`Gateway running at ${url}:${PORT}`);
})();

process.on('SIGINT', () => {
    LocalTunneller.disconnect()
    process.exit();
});
