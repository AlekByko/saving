import { existsSync, promises as fs, readdirSync, readFileSync } from 'fs';
import { createServer, IncomingMessage, ServerOptions, ServerResponse } from 'http';
import { MongoClient, ObjectId } from 'mongodb';
import * as pth from 'path';
import { extname, join } from 'path';
import { parse } from 'url';
import { CamConfig } from '../shared/cam-config';
import { makeCapPath } from '../shared/caps-folders';
import { BeDeletedInMates, BeGottenFamMemsPairs, BeGottenSnaps, BeGottenUrl, BeMovedInCaps, BeMovedMates, BeRegisteredFamMems, FailedBackendOperation, GotSnaps, SuccesfulBackendOperation, SuccesfulBackendResult } from '../shared/contract';
import { asNonNullOr, isNull } from '../shared/core';
import { dotJpg, dotJson } from '../shared/extentions';
import { willLoadConfigsFromDb } from './databasing';
import { willGetFamMemPairs, willRegisterFamMems } from './databasing-fam-mems-and-colabs';
import { parseJsonOr } from './disking';
import { handleMovedDirs, willMoveDir } from './moving-folders';
import { henceReadingArgsOf, readCliArgs } from './parsing-command-line';
import { willBeServing } from './serving';
import { setConsoleTitle } from './utils';

type ArgKeys = 'port' | 'caps-dir' | 'mates-dir' | 'paired-dir' | 'other-dir';


const options: ServerOptions = {};
async function run() {

    const mongoUrl = 'mongodb://0.0.0.0:27017/';
    const client = new MongoClient(mongoUrl);
    console.log('connecting to backend at', mongoUrl, '...');
    await client.connect();
    console.log('connected');
    const db = client.db('saving');
    const text = process.argv.slice(2).join(' ');
    const parsedOrNot = readCliArgs(text, 0);
    if (parsedOrNot.isBad) {
        console.log('Unable to parse: ' + text);
        console.log(parsedOrNot);
        return;
    }
    const cliArgs = parsedOrNot.value;
    console.log(cliArgs);
    const readingArgs = henceReadingArgsOf<ArgKeys>();
    const port = readingArgs.readIntegerFore('port', cliArgs, undefined);
    const capsDir = readingArgs.readDirFore('caps-dir', cliArgs, undefined);
    const matesDir = readingArgs.readDirFore('mates-dir', cliArgs, undefined);
    const pairedDir = readingArgs.readDirFore('paired-dir', cliArgs, undefined);
    const otherDir = readingArgs.readDirFore('other-dir', cliArgs, undefined);
    console.log({ port, capsDir, matesDir, pairedDir, otherDir });

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
            switch (path) {
                case '/get-url': {
                    const text = await willReadBody(req);
                    const { url }: BeGottenUrl = JSON.parse(text);
                    await willBeServing(res, `doing GET ${url}`, async () => {
                        const inner = await fetch(url);
                        console.log(`Got url ${url}`);
                        const text = await inner.text();
                        console.log(text);
                        const json = parseJsonOr(text, {});
                        console.log(json);
                        return json;
                    })
                    break;
                }
                case '/get/fam-mems-pairs': {
                    const text = await willReadBody(req);
                    const { names }: BeGottenFamMemsPairs = JSON.parse(text);
                    const gotten = await willGetFamMemPairs(client, names);
                    console.log(`Fam-mems gotten`);
                    const result: SuccesfulBackendResult<typeof gotten> = { isOk: true, isBad: false, result: gotten };
                    res.write(JSON.stringify(result, null, 4));
                    res.statusCode = 200;
                    res.end();
                    break;
                }
                case '/register/fam-mems': {
                    const text = await willReadBody(req);
                    const { names, flingName }: BeRegisteredFamMems = JSON.parse(text);
                    const regged = await willRegisterFamMems(client, names, flingName);
                    if (regged.isBad) {
                        console.error('Error registing fam-mems:', regged);
                        const result: FailedBackendOperation = { isOk: false, isBad: true, error: regged.why.err.message };
                        res.write(JSON.stringify(result, null, 4));
                        res.statusCode = 500;
                        res.end();
                        break;
                    } else {
                        console.log(`Fam-mems registered`);
                        const result: SuccesfulBackendOperation = { isOk: true, isBad: false };
                        res.write(JSON.stringify(result, null, 4));
                        res.statusCode = 200;
                        res.end();
                        break;
                    }
                }
                case '/delete/mates': {
                    const text = await willReadBody(req);
                    const { matesDirName }: BeDeletedInMates = JSON.parse(text);
                    const target = pth.join(matesDir, matesDirName);
                    try {
                        await fs.rm(target, { recursive: true, force: true });
                        console.log(`Mates directory deleted at ${target}`);
                        const result: SuccesfulBackendOperation = { isOk: true, isBad: false };
                        res.write(JSON.stringify(result, null, 4));
                        res.statusCode = 200;
                        res.end();

                    } catch (e: any) {
                        console.error('Error deleting mates directory:', e);
                        const result: FailedBackendOperation = { error: e.message, isOk: false, isBad: true };
                        res.write(JSON.stringify(result, null, 4));
                        res.statusCode = 500;
                        res.end();
                    }
                    break;
                }
                case '/put-off/mates': {
                    const text = await willReadBody(req);
                    const { matesDirName }: BeMovedMates = JSON.parse(text);
                    const source = pth.join(matesDir, matesDirName);
                    const destination = pth.join(otherDir, matesDirName);
                    const moved = await willMoveDir(source, destination);
                    return handleMovedDirs(
                        moved, res,
                        `Mates directory moved from ${source} to ${destination}.`,
                        `Unable to move mates directory from ${source} to ${destination}.`
                    );
                }
                case '/move/mates': {
                    const text = await willReadBody(req);
                    const { matesDirName }: BeMovedMates = JSON.parse(text);
                    const source = pth.join(matesDir, matesDirName);
                    const destination = pth.join(pairedDir, matesDirName);
                    const moved = await willMoveDir(source, destination);
                    return handleMovedDirs(
                        moved, res,
                        `Mates directory moved from ${source} to ${destination}.`,
                        `Unable to move mates directory from ${source} to ${destination}.`
                    );
                }
                case '/move/caps': {
                    const text = await willReadBody(req);
                    const { name, where }: BeMovedInCaps = JSON.parse(text);

                    const parts = makeCapPath(name);
                    const source = pth.join(capsDir, ...parts);
                    const destination = pth.join(capsDir, where, ...parts);

                    try {
                        // Ensure destination directory exists
                        await fs.mkdir(pth.dirname(destination), { recursive: true });

                        // Move directory using rename
                        await fs.rename(source, destination);
                        console.log(`Caps directory moved from ${source} to ${destination}`);
                        const result: SuccesfulBackendOperation = { isOk: true, isBad: false };
                        res.write(JSON.stringify(result, null, 4));
                        res.statusCode = 200;
                        res.end();
                    } catch (e: any) {
                        console.error('Error moving caps directory:', e);
                        const result: FailedBackendOperation = { error: e.message, isOk: false, isBad: true };
                        res.write(JSON.stringify(result, null, 4));
                        res.statusCode = 500;
                        res.end();
                    }
                    break;
                }
                case '/cams/pull': {
                    const text = await willReadBody(req);
                    const names: GlobalCamName[] = JSON.parse(text);
                    console.log('pulling cam configs:', names.join(', '));
                    const configs = await willLoadConfigsFromDb(client, names);
                    const json = JSON.stringify(configs, null, 4);
                    console.log('Cam configs for', names.join(', '), json);
                    res.write(json);
                    res.statusCode = 200;
                    res.end();
                    break;
                }
                case '/cams/save': {
                    const text = await willReadBody(req);
                    const configs: CamConfig[] = JSON.parse(text);
                    console.log('saving cam configs', configs);
                    const ids = {} as any;
                    for (const config of configs) {
                        if ('_id' in config) {
                            // after deserializing from JSON we have _id as string
                            // but in order for update it has to be of type ObjectId
                            const _id = new ObjectId(config._id as any);
                            config._id = _id as any;
                            const replaced = await db.collection('cams').replaceOne({ '_id': _id }, config);
                            console.log('replaced', replaced);
                        } else {
                            const inserted = await db.collection('cams').insertOne(config as any);
                            console.log('inserted', inserted);
                            ids[config.name] = inserted.insertedId;
                        }
                    }
                    const json = JSON.stringify(ids);
                    res.write(json, 'utf-8');
                    res.statusCode = 200;
                    res.end();
                    break;
                }
                case '/snaps/get': {
                    const text = await willReadBody(req);
                    const { dir }: BeGottenSnaps = JSON.parse(text);
                    try {
                        // Ensure destination directory exists
                        let all = readdirSync(dir);
                        all = all.filter(x => x.endsWith(dotJson));
                        console.log(`Got ${all.length} snaps.`);

                        const result: SuccesfulBackendResult<GotSnaps> = { isOk: true, isBad: false, result: { configNames: all } };
                        res.write(JSON.stringify(result, null, 4));
                        res.statusCode = 200;
                        res.end();
                        break;
                    } catch (e: any) {
                        console.error('Getting snaps:', e);
                        const result: FailedBackendOperation = { error: e.message, isOk: false, isBad: true };
                        res.write(JSON.stringify(result, null, 4));
                        res.statusCode = 500;
                        res.end();
                        break;
                    }

                }
                default: {
                    console.log('Unknown path: ' + path);
                    throw new Error(`Bad path: ${path}`);
                }
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
        case dotJson: return 'application/json';
        case dotJpg: return 'image/jpeg';
        case '.ico': return 'image/x-icon';
        case '.js': return 'application/javascript';
        case '.svg': return 'image/svg+xml';
        case '.css': return 'text/css';
        case '.html': return 'text/html';
        default: return null;
    }
}
