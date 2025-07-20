import { alwaysNull, broke, cast, isUndefined, otherwise } from '../shared/core';
import { atFull, capturedFrom, chokedFrom, diagnose, ParsedOrNot, Read, readLitOver, readReg } from '../shared/reading-basics';
import { readQuotedString } from '../shared/reading-quoted-string';
import { scanList } from '../shared/scanning-list';
import { ExtXMedia, ExtXSteamInf, M3U8 } from './m3u8';


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
    index = title.nextIndex;

    let br = readBrs(text, index);
    if (br.isBad) return chokedFrom(startIndex, 'br', br);
    index = br.nextIndex;

    const streams = readStreamList(text, startIndex, index);
    if (streams.isBad) return chokedFrom(startIndex, 'streams', streams);
    index = streams.nextIndex;

    const media = readExtXMedia(text, index);
    if (media.isBad) return chokedFrom(startIndex, 'media', media);
    index = media.nextIndex;

    const result: M3U8 = {
        streams: streams.value,
        media: media.value,
    };
    return capturedFrom(index, result);
}

function readStreamList(text: string, startIndex: number, index: number) {
    const scanned = scanList(text, index, readExtXSteamInfAndUrl, readBrs);
    switch (scanned.kind) {
        case 'captured':
            return scanned;
        case 'choked':
            return chokedFrom(startIndex, 'stream list', scanned);
        case 'scanned': switch (scanned.subkind) {
            case 'no-items-scanned': {
                const { attemptedIndex } = scanned;
                return capturedFrom(attemptedIndex, []);
            }
            case 'few-but-bad-delim':
            case 'few-but-bad-item': {
                const { attemptedIndex, fewItemsSofar } = scanned;
                return capturedFrom(attemptedIndex, fewItemsSofar);
            }
            default: return broke(scanned);
        }
        default: return broke(scanned);
    }
}

function readExtXSteamInfAndUrl(text: string, index: number) {

    const startIndex = index;

    const tokens = readExtXSteamInf(text, index);
    if (tokens.isBad) return chokedFrom(startIndex, 'STREAM-INF', tokens);
    index = tokens.nextIndex;

    let br = readBr(text, index);
    if (br.isBad) return chokedFrom(startIndex, 'br', br);
    index = br.nextIndex;

    const url = readLine(text, index);
    if (url.isBad) return chokedFrom(startIndex, 'URL', url);
    index = url.nextIndex;

    return capturedFrom(index, { ...tokens.value, url: url.value });
}

function readExtXSteamInf(text: string, index: number) {
    const startIndex = index;

    const prefix = readReg(text, index, /#EXT-X-STREAM-INF:/y, x => x);
    if (prefix.isBad) return chokedFrom(startIndex, 'prefix', prefix);
    index = prefix.nextIndex;

    const tokens = readStreamTokens(text, index);
    if (tokens.isBad) return chokedFrom(startIndex, 'stream tokens', tokens);
    index = tokens.nextIndex;

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


function readExtXMedia(text: string, index: number) {
    const startIndex = index;
    // #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",NAME="English",URI="audio_eng.m3u8"
    const title = readReg(text, index, /#EXT-X-MEDIA:/y, alwaysNull);
    if (title.isBad) return chokedFrom(startIndex, 'title', title);
    index = title.nextIndex;

    const tokens = readMediaTokens(text, index);
    if (tokens.isBad) return chokedFrom(startIndex, 'media tokens', tokens);
    index = tokens.nextIndex;

    const draft: Partial<ExtXMedia> = {};
    for (const token of tokens.value) {
        switch (token.kind) {
            case 'type': draft.type = token.type; break;
            case 'group-id': draft.groupId = token.groupId; break;
            case 'name': draft.name = token.name; break;
            case 'uri': draft.uri = token.uri; break;
            default: return broke(token);
        }
    }
    const { type, groupId, name, uri } = draft;
    if (isUndefined(type)) return chokedFrom(startIndex, 'No type.');
    if (isUndefined(groupId)) return chokedFrom(startIndex, 'No group-id.');
    if (isUndefined(name)) return chokedFrom(startIndex, 'No name.');
    if (isUndefined(uri)) return chokedFrom(startIndex, 'No uri.');
    const result: ExtXMedia = { type, groupId, name, uri };
    return capturedFrom(index, result);
}

function readMediaTokens(text: string, index: number) {

    type NoDistributivity = ReturnType<typeof readMediaToken> extends ParsedOrNot<infer M> ? Read<M> : never;
    const tokens = scanList(text, index, readMediaToken as NoDistributivity, readLitOver(','));
    switch (tokens.kind) {
        case 'choked':
        case 'captured':
            return tokens;
        case 'scanned': switch (tokens.subkind) {
            case 'few-but-bad-item':
            case 'few-but-bad-delim': return capturedFrom(tokens.attemptedIndex, tokens.fewItemsSofar);
            case 'no-items-scanned': return chokedFrom(tokens.attemptedIndex, 'no stream tokens');
            default: return broke(tokens);
        }
        default: return broke(tokens);
    }
}

type ExtXMediaTokenName = 'TYPE' | 'GROUP-ID' | 'NAME' | 'URI';
function readMediaToken(text: string, index: number) {
    const startIndex = index;
    const head = readReg(text, index, /([\w-]+)=/y, ([_, textToken]) => textToken);
    if (head.isBad) return head;
    index = head.nextIndex;
    const token = head.value;
    cast<ExtXMediaTokenName>(token);
    switch (token) {
        case 'TYPE': {
            const type = readReg(text, index, /\w+/y, atFull);
            if (type.isBad) return chokedFrom(startIndex, 'type', type);
            return capturedFrom(type.nextIndex, { kind: 'type' as const, type: type.value });
        }
        case 'GROUP-ID': {
            const groupId = readQuotedString(text, index);
            if (groupId.isBad) return chokedFrom(startIndex, 'group-id', groupId);
            return capturedFrom(groupId.nextIndex, { kind: 'group-id' as const, groupId: groupId.value });
        }
        case 'NAME': {
            const name = readQuotedString(text, index);
            if (name.isBad) return chokedFrom(startIndex, 'name', name);
            return capturedFrom(name.nextIndex, { kind: 'name' as const, name: name.value });
        }
        case 'URI': {
            const uri = readQuotedString(text, index);
            if (uri.isBad) return chokedFrom(startIndex, 'uri', uri);
            return capturedFrom(uri.nextIndex, { kind: 'uri' as const, uri: uri.value });
        }
        default: return otherwise(token, chokedFrom(startIndex, `Bad media token: ${token}`));
    }
}

function readStreamTokens(text: string, index: number) {
    type NoDistributivity = ReturnType<typeof readStreamToken> extends ParsedOrNot<infer M> ? Read<M> : never;
    const tokens = scanList(text, index, readStreamToken as NoDistributivity, readLitOver(','));
    switch (tokens.kind) {
        case 'choked':
        case 'captured':
            return tokens;
        case 'scanned': switch (tokens.subkind) {
            case 'few-but-bad-item':
            case 'few-but-bad-delim': return capturedFrom(tokens.attemptedIndex, tokens.fewItemsSofar);
            case 'no-items-scanned': return chokedFrom(tokens.attemptedIndex, 'no stream tokens');
            default: return broke(tokens);
        }
        default: return broke(tokens);
    }
}

type ExtXStreamInfTokenName = 'RESOLUTION' | 'BANDWIDTH' | 'CODECS';
function readStreamToken(text: string, index: number) {
    const startIndex = index;

    const head = readReg(text, index, /(\w+)=/y, ([_, textToken]) => textToken);
    if (head.isBad) return head;
    index = head.nextIndex;

    const token = head.value;
    cast<ExtXStreamInfTokenName>(token);
    switch (token) {
        case 'BANDWIDTH': {
            const bandwidth = readReg(
                text, index, /(\d+)/y,
                ([_, textBandwidth]) => parseInt(textBandwidth, 10),
            );
            if (bandwidth.isBad) return chokedFrom(startIndex, 'bandwidth', bandwidth);
            return capturedFrom(bandwidth.nextIndex, { kind: 'bandwidth' as const, bandwidth: bandwidth.value });
        }
        case 'RESOLUTION': {
            const resolution = readReg(text, index, /(\d+)x(\d+)/y, ([_, textWidth, textHeight]) => {
                const width = parseInt(textWidth, 10);
                const height = parseInt(textHeight, 10);
                return { width, height };
            });
            if (resolution.isBad) return chokedFrom(startIndex, 'resolution', resolution);
            return capturedFrom(resolution.nextIndex, { kind: 'resolution' as const, resolution: resolution.value });
        }
        case 'CODECS': {
            const codecs = readQuotedString(text, index);
            if (codecs.isBad) return chokedFrom(startIndex, 'codecs', codecs);
            return capturedFrom(codecs.nextIndex, { kind: 'codecs' as const, codecs: codecs.value });
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
