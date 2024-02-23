import { existsSync, readFileSync } from 'fs';
import { IncomingMessage, ServerOptions, ServerResponse, createServer } from 'http';
import { MongoClient, ObjectId } from 'mongodb';
import { extname, join } from 'path';
import { parse } from 'url';
import { CamConfig } from './shared/cam-config';
import { asNonNullOr, isNull } from './shared/core';
import { setConsoleTitle } from './utils';


const port = 8081;
const options: ServerOptions = {};
async function run() {

    const mongoUrl = 'mongodb://0.0.0.0:27017/';
    const mongo = new MongoClient(mongoUrl);
    console.log('connecting to backend at', mongoUrl, '...');
    await mongo.connect();
    console.log('connected');
    const db = mongo.db('saving');

    setConsoleTitle(`http://localhost:${port}`)
    console.log(`listening at ${port}`);
    console.log(`http://localhost:${port}`);

    const server = createServer(options, async (req, res) => {
        req.setEncoding('utf-8');

        const url = parse(req.url!, true);
        let path = asNonNullOr(url.pathname, '/index.html');
        path = path === '/' ? '/index.html' : path;

        const filepath = join(process.cwd(), path);
        if (req.method === 'GET') {
            if (path.startsWith('/cams/')) {
                // geting cam config
                const name = path.substring(6);
                console.log('pulling cam config:', name);
                const config: CamConfig | null = await db.collection('cams').findOne({ name }) as any;
                if (isNull(config)) {
                    const message = 'No config for cam:' + name;
                    console.log(message);
                    res.write('null', 'utf-8');
                    res.statusCode = 200;
                    res.end();
                } else {
                    const json = JSON.stringify(config, null, 4);
                    console.log('Cam config for', name, json);
                    res.write(json);
                    res.statusCode = 200;
                    res.end();
                }
            } else {
                console.log(path, filepath);
                if (!existsSync(filepath)) return tooBad(404, req, res, 'No file: ' + filepath);
                const extension = extname(filepath);
                setContentType(res, extension);
                const file = readFileSync(filepath);
                res.write(file);
                res.end();
            }
        } else if (req.method === 'POST') {
            console.log('POST', path);
            if (path === '/cams') {
                const text = await willReadBody(req);
                const configs: CamConfig[] = JSON.parse(text);
                console.log('saving cam configs', configs);
                const ids = {} as any;
                for (const config of configs) {
                    if ('_id' in config) {
                        // after deserializing from JSON we have _id as string
                        // but in order for update it has to be of type ObjectId
                        const _id = new ObjectId(config._id as any);
                        config._id = _id;
                        const replaced = await db.collection('cams').replaceOne({ '_id': _id }, config);
                        console.log('replaced', replaced);
                    } else {
                        const inserted = await db.collection('cams').insertOne(config);
                        console.log('inserted', inserted);
                        ids[config.name] = inserted.insertedId;
                    }
                }
                const json = JSON.stringify(ids);
                res.write(json, 'utf-8');
                res.statusCode = 200;
                res.end();
            }
        }
    });

    server.listen(port);
}

// function:
function willReadBody(req: IncomingMessage) {
    return new Promise<string>(resolve => {
        const chunks: string[] = [];
        req.on('data', (chunk) => {
            chunks.push(chunk);
        }).on('end', () => {
            const text = chunks.join('');
            resolve(text);
        });
    });
}

run();


function tooBad(code: number, req: IncomingMessage, res: ServerResponse, message: string): void {
    console.log('unhandled:');
    console.log(req.url);
    console.log(message);
    res.statusCode = code;
    res.setHeader('content-type', 'text/plain');
    res.write(message);
    res.end();
}

function setContentType(res: ServerResponse, extension: string) {
    const mime = toMimeType(extension);
    if (isNull(mime)) return;
    res.setHeader('content-type', mime);
}

function toMimeType(extension: string): string | null {
    switch (extension) {
        case '.ico': return 'image/x-icon';
        case '.js': return 'application/javascript';
        case '.json': return 'application/json';
        case '.jpg': return 'image/jpeg';
        case '.svg': return 'image/svg+xml';
        case '.css': return 'text/css';
        case '.html': return 'text/html';
        default: return null;
    }
}
