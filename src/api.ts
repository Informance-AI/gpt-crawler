// "/Users/chuci/Documents/GitKraken/gpt-crawler/output-1.json"

import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { readFile, unlink } from 'fs/promises';
import { startCrawling } from "./main.js";
import { constants } from 'fs';
import { readdir } from 'fs/promises';

const app = express();
const port = 3001;

// Mock database to store process status
const processStatus = new Map();

app.use(cors());
app.use(express.json());
app.use(fileUpload());

app.post('/crawl', async (req, res) => {
    if (!req.files || !req.files.config) {
        return res.status(400).json({ message: 'Config file is required.' });
    }

    // Generate a unique process ID and send it back immediately
    const processId = Math.random().toString(36).substr(2, 9);
    processStatus.set(processId, 'running');
    res.send({ processId });
    console.log('Process started with ID:', processId);

    // Process the crawling in the background
    (async () => {
        try {
            if (req.files && req.files.config) {
                let configContent;
                if (Array.isArray(req.files.config)) {
                    configContent = req.files.config[0].data.toString('utf-8');
                } else {
                    configContent = req.files.config.data.toString('utf-8');
                }
                const config = JSON.parse(configContent);
                console.log('Crawling with configuration:', config);

                // Start crawling
                await startCrawling(config);

                // After crawling is done, read the output file (if needed) and delete it
                // const outputFileContent = await readFile("/path/to/output.json", 'utf-8');
                // Inside your try block where you want to unlink the file
                const outputPath = "/Users/chuci/Documents/GitKraken/gpt-crawler/output-1.json";
                const storagePath = "/Users/chuci/Documents/GitKraken/gpt-crawler/storage/datasets/default/";
                
                try {
                    await unlink(outputPath);
                    console.log('Output file deleted successfully');
                } catch (error: any) {
                    if (error.code === 'ENOENT') {
                        console.log('Output file does not exist, no need to delete');
                    } else {
                        throw error; // Re-throw the error if it is not related to file existence
                    }
                }

                try {
                    const files = await readdir(storagePath);
                    for (const file of files) {
                        try {
                            await unlink(`${storagePath}${file}`);
                            console.log(`Deleted file: ${file}`);
                        } catch (error: any) {
                            if (error.code !== 'ENOENT') {
                                throw error; // Only re-throw if the error is not because the file doesn't exist
                            }
                        }
                    }
                } catch (error: any) {
                    console.error('Error reading the storage directory', error);
                }

                // Update the process status in the mock database
                processStatus.set(processId, 'done');
            }
        } catch (error) {
            // If an error occurs, update the process status with the error
            processStatus.set(processId, 'error');
            console.error('Error occurred during crawling', error);
        }
    })();
    return;
});

// Endpoint to check process status
app.get('/status/:processId', (req, res) => {
    const processId = req.params.processId;
    const status = processStatus.get(processId) || 'not found';
    res.send({ processId, status });
});

app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
});

export default app;