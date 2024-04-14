"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = exports.readStdin = exports.willExecute = exports.willDareExecute = exports.enableSpawTracing = void 0;
const fs = require("fs");
const cp = require("child_process");
function enableSpawTracing() {
    const oldSpawn = cp.spawn;
    function tracedSpawn() {
        console.log('spawn called');
        console.log(arguments);
        var result = oldSpawn.apply(this, arguments);
        return result;
    }
    cp.spawn = tracedSpawn;
}
exports.enableSpawTracing = enableSpawTracing;
;
async function willDareExecute(text, parse) {
    // console.log('running:', text);
    const { code, result } = await willExecute(text, parse);
    if (code !== 0)
        throw new Error('Unable to execute: ' + text);
    return result;
}
exports.willDareExecute = willDareExecute;
async function willExecute(text, parse) {
    const parts = text.split(' ');
    const command = parts[0];
    const args = parts.slice(1);
    const { code, result: unparsed } = await willExecuteExt(command, args);
    const parsed = parse(unparsed);
    // console.log(data);
    return { code, result: parsed };
}
exports.willExecute = willExecute;
function willExecuteExt(command, args) {
    return new Promise((resolve, reject) => {
        const proc = cp.spawn(command, args);
        const chunks = [];
        proc.stdout.on('data', data => {
            chunks.push(data);
        });
        proc.stderr.on('data', data => {
            if (Buffer.isBuffer(data)) {
                console.error(data.toString('utf-8'));
            }
            else {
                console.error(data);
            }
        });
        proc.on('close', (code) => {
            resolve({ code, result: chunks.join('') });
        });
    });
}
/**
 * Returns the piped-in content of stdin.
 * @returns {string}
 */
function readStdin() {
    // https://stackoverflow.com/a/45486670/139667
    const buffer = fs.readFileSync(0); // STDIN_FILENO = 0
    return buffer.toString();
}
exports.readStdin = readStdin;
/** @param {string} command
 * @param {string[]} args
 */
function start(command, args) {
    const proc = cp.spawn(command, args);
    return proc;
}
exports.start = start;
