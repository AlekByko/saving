import { alwaysNull, broke, cast, isUndefined, otherwise } from '../shared/core';
import { capturedFrom, chokedFrom, diagnose, ParsedOrNot, Read, readLitOver, readReg } from '../shared/reading-basics';
import { readQuotedString } from '../shared/reading-quoted-string';
import { scanList } from '../shared/scanning-list';
import { ExtXSteamInf } from './ext-x';


function readLine(text: string, index: number) {
    return readReg(text, index, /.+/y, ([full]) => full);
}
function readBrs(text: string, index: number) {
    return readReg(text, index, /(\r?\n)+/y, alwaysNull);
}
function readBr(text: string, index: number) {
    return readReg(text, index, /(\r?\n)/y, alwaysNull);
}
function read_m3u8(text: string, index: number) {

    const startIndex = index;

    const title = readReg(text, index, /#EXTM3U/y, alwaysNull);
    if (title.isBad) return chokedFrom(startIndex, 'title', title);
    index = title.index;

    let br = readBrs(text, index);
    if (br.isBad) return chokedFrom(startIndex, 'br', br);
    index = br.index;

    const allStreams = scanList(text, index, readExtXSteamInfAndUrl, readBrs);
    if (allStreams.isBad) return chokedFrom(startIndex, 'stream list', allStreams);
    return allStreams;
}

function readExtXSteamInfAndUrl(text: string, index: number) {

    const startIndex = index;

    const tokens = readExtXSteamInf(text, index);
    if (tokens.isBad) return chokedFrom(startIndex, 'STREAM-INF', tokens);
    index = tokens.index;

    let br = readBr(text, index);
    if (br.isBad) return chokedFrom(startIndex, 'br', br);
    index = br.index;

    const url = readLine(text, index);
    if (url.isBad) return chokedFrom(startIndex, 'URL', url);
    index = url.index;

    return capturedFrom(index, { ...tokens.value, url: url.value });
}

function readExtXSteamInf(text: string, index: number) {
    const startIndex = index;

    const prefix = readReg(text, index, /#EXT-X-STREAM-INF:/y, x => x);
    if (prefix.isBad) return chokedFrom(startIndex, 'prefix', prefix);
    index = prefix.index;

    type X = ReturnType<typeof readExtXStreamInfToken> extends ParsedOrNot<infer M> ? Read<M> : never;
    const tokens = scanList(text, index, readExtXStreamInfToken as X, readLitOver(','));
    if (tokens.isBad) return chokedFrom(startIndex, 'tokens', tokens);
    index = tokens.index;

    const draft: Partial<ExtXSteamInf> = {};
    for (const token of tokens.value) {
        switch (token.kind) {
            case 'bandwidth': draft.bandwidth = token.bandwidth; break;
            case 'codecs': draft.codecs = token.codecs; break;
            case 'resolution': draft.resolution = token.resolution; break;
            default: return broke(token);
        }
    }

    const { bandwidth, resolution, codecs } = draft;
    if (isUndefined(bandwidth)) return chokedFrom(startIndex, 'No bandwidth.');
    if (isUndefined(resolution)) return chokedFrom(startIndex, 'No resolution.');
    const result: ExtXSteamInf = { bandwidth, resolution, codecs };
    return capturedFrom(index, result);
}

function readBandwidth(text: string, index: number) {
    return readReg(
        text, index, /(\d+)/y,
        ([_, textBandwidth]) => parseInt(textBandwidth, 10),
    );
}

function readResolution(text: string, index: number) {
    return readReg(text, index, /(\d+)x(\d+)/y, ([_, textWidth, textHeight]) => {
        const width = parseInt(textWidth, 10);
        const height = parseInt(textHeight, 10);
        return { width, height };
    });
}

type ExtXStreamInfTokenName = 'RESOLUTION' | 'BANDWIDTH' | 'CODECS';
function readExtXStreamInfToken(text: string, index: number) {
    const startIndex = index;

    const regx = /(\w+)=/y;
    const head = readReg(text, index, regx, ([_, textToken]) => textToken);
    if (head.isBad) return head;
    index = head.index;

    const token = head.value;
    cast<ExtXStreamInfTokenName>(token);
    switch (token) {
        case 'BANDWIDTH': {
            const bandwidth = readBandwidth(text, index);
            if (bandwidth.isBad) return chokedFrom(startIndex, 'bandwidth', bandwidth);
            return capturedFrom(bandwidth.index, { kind: 'bandwidth' as const, bandwidth: bandwidth.value });
        }
        case 'RESOLUTION': {
            const resolution = readResolution(text, index);
            if (resolution.isBad) return chokedFrom(startIndex, 'resolution', resolution);
            return capturedFrom(resolution.index, { kind: 'resolution' as const, resolution: resolution.value });
        }
        case 'CODECS': {
            const codecs = readQuotedString(text, index);
            if (codecs.isBad) return chokedFrom(startIndex, 'codecs', codecs);
            return capturedFrom(codecs.index, { kind: 'codecs' as const, codecs: codecs.value });
        }
        default: return otherwise(token, chokedFrom(startIndex, `Unexpected token: ${token}`));
    }
}



if (window.sandbox === 'reading-m3u8') {
    {
        let text = `
#EXTM3U

#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720
720p.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=640x360,CODECS="avc1.4d401f,mp4a.40.2"
360p.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=854x480
https://cdn.example.com/480p/index.m3u8

#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",NAME="English",URI="audio_eng.m3u8"
`;
        text = text.trim();
        diagnose(read_m3u8, text, 0, true);
    }

    {
        // const text = `#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=640x360,CODECS="avc1.4d401f,mp4a.40.2"`;
        // diagnose(readExtXSteamInf, text, 0, true);
    }

    {
        // diagnose(readLine, `abc\n`, 0, true);
    }
}
