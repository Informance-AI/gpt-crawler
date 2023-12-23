import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { PlaywrightCrawler } from 'crawlee';
import { Page } from 'playwright';
import { readFile, writeFile, unlink } from 'fs/promises';
import { startCrawling } from "./main.js";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(fileUpload());

app.post('/crawl', async (req, res) => {
    if (!req.files || !req.files.config) {
        return res.status(400).json({ message: 'Config file is required.' });
    }

    let configContent;

    if (Array.isArray(req.files.config)) {
        configContent = req.files.config[0].data.toString('utf-8');
    } else {
        configContent = req.files.config.data.toString('utf-8');
    }

    const config = JSON.parse(configContent);

    console.log('Crawling with configuration:', config);

    try {
        await startCrawling(config);
        const outputFileContent = await readFile("/Users/chuci/Documents/GitKraken/gpt-crawler/output-1.json", 'utf-8');
        res.contentType('application/json');
        res.send(outputFileContent); // Removed return here
        await unlink("/Users/chuci/Documents/GitKraken/gpt-crawler/output-1.json");
    } catch (error) {
        res.status(500).json({ message: 'Error occurred during crawling', error });
    }

    // Added this line to ensure all code paths return a value
    return;
});

app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
});

export default app;
