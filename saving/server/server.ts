import { existsSync, readFileSync } from 'fs';
import { createServer, IncomingMessage, ServerOptions, ServerResponse } from 'http';
import { extname, join } from 'path';
import { parse } from 'url';
import { asNonNullOr, isNull } from './shared/core';

const port = 8081;
const options: ServerOptions = {
};

const server = createServer(options, async (req, res) => {
    const url = parse(req.url!, true);
    let path = asNonNullOr(url.pathname, '/index.html');
    path = path === '/' ? '/index.html' : path;

    const filepath = join(process.cwd(), path);
    console.log(path, filepath);
    if (!existsSync(filepath)) return tooBad(404, req, res, 'No file: ' + filepath);
    const extension = extname(filepath);
    setContentType(res, extension);
    const file = readFileSync(filepath);
    res.write(file);
    res.end();
});

console.log(`listening at ${port}`);
console.log(`http://localhost:${port}`);
server.listen(port);

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
    switch(extension) {
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
