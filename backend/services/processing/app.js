const MicroMQ = require('micromq');
const sharp = require('sharp');
const fs = require('fs').promises;

const CHANNEL_PORT = process.env.CHANNEL_PORT || 5672;
const PORT = process.env.PORT || 5003;

const app = new MicroMQ({
    name: 'processing',
    rabbit: {
        url: `amqp://localhost:${CHANNEL_PORT}`,
    },
});

app.action('optimizeImage', async (meta, res) => {
    try {
        sharp.cache({ files : 0 })
        const pathA = `${meta.capturedImageName}${meta.format}`;
        const pathB = `${meta.capturedImageName}_resized${meta.format}`;
        const capturedImageMetadata = await sharp(pathA).metadata();
        await sharp(pathA)
            .resize({
                width: parseInt((capturedImageMetadata.width*meta.quality).toString()),
                height: parseInt((capturedImageMetadata.height*meta.quality).toString()),
            })
            .toFile(pathB);
        const content = await fs.readFile(pathB, {encoding: 'base64'});
        await fs.unlink(pathB);
        res.json({content: content});
    } catch (error) {
        console.log(error)
    }
});

(async () => {
    await app.start(PORT);
    console.log(`Service running at ${PORT}`);
})();
