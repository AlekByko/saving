import { existsSync, readFileSync } from 'fs';
import { createServer, IncomingMessage, ServerOptions, ServerResponse } from 'http';
import { MongoClient } from 'mongodb';
import { extname, join } from 'path';
import { parse } from 'url';
import { asNonNullOr, isNull } from '../shared/core';
import { dotJpg, dotJson } from '../shared/extentions';
import { henceReadingArgsOf, readCliArgs } from './parsing-command-line';
import { setConsoleTitle } from './utils';

type ArgKeys = 'port' | 'caps-dir' | 'mates-dir' | 'paired-dir' | 'other-dir';


const options: ServerOptions = {};
async function run() {

    const mongoUrl = 'mongodb://0.0.0.0:27017/';
    const client = new MongoClient(mongoUrl);
    console.log('connecting to backend at', mongoUrl, '...');
    await client.connect();
    console.log('connected');
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

                console.log(path, filepath);
                if (!existsSync(filepath)) return tooBad(404, req, res, 'No file: ' + filepath);
                const extension = extname(filepath);
                setContentType(res, extension);
                const file = readFileSync(filepath);
                res.write(file);
                res.end();

        }
    });

    server.listen(port);
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
