const MicroMQ = require('micromq');
const fs = require('fs').promises;

const CHANNEL_PORT = process.env.CHANNEL_PORT || 5672;
const PORT = process.env.PORT || 5002;

const app = new MicroMQ({
    name: 'files',
    microservices: ['processing'],
    rabbit: {
        url: `amqp://localhost:${CHANNEL_PORT}`,
    },
});

app.post('/upload', async (req, res) => {
    try {
        await fs.writeFile(`capturedImage.png`, req.body.capturedImage, 'base64');
        const { response } = await app.ask('processing', {
            server: {
                action: 'optimizeImage',
                meta: {
                    capturedImageName: `${__dirname}\\capturedImage`,
                    format: '.png',
                    quality: .05
                },
            },
        })
        res.json(response);
    }
    catch (error) {
        console.log(error);
    }
});

(async () => {
    await app.start(PORT);
    console.log(`Service running at ${PORT}`);
})();
