import { Config } from './config';
import { crawl, write } from "./core.js";

export async function startCrawling(config: Config) {
    await crawl(config);
    await write(config);
}

