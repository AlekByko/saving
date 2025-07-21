import { alwaysNull, broke, cast, isUndefined, otherwise } from '../shared/core';
import { at1st, atFull, capturedFrom, chokedFrom, diagnose, ParsedOrNot, Read, readLitOver, readReg } from '../shared/reading-basics';
import { readList } from '../shared/reading-list';
import { readQuotedString } from '../shared/reading-quoted-string';
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

    const draft: Partial<M3U8> = {};
    draft.streams = [];
    draft.unknown = [];
    while (true) {
        const br = readBrs(text, index);
        if (br.isBad) break;
        index = br.nextIndex;

        if (index >= text.length) break;

        const block = readTagBlock(text, index);
        if (block.isBad) return chokedFrom(startIndex, 'block', block);
        index = block.nextIndex;

        const tag = block.value;
        switch (tag.kind) {
            case 'media': draft.media = tag.media; break;
            case 'stream': draft.streams.push(tag.stream); break;
            case 'version': draft.version = tag.version; break;
            case 'unknown': draft.unknown.push(tag.unknown); break;
            default: return broke(tag);
        }
    }
    const { media, streams } = draft;
    const result: M3U8 = { streams, media };
    return capturedFrom(index, result);
}

type ExtTag = '#EXT-X-STREAM-INF' | '#EXT-X-MEDIA' | '#EXT-X-VERSION';
function readTagBlock(text: string, index: number) {
    const startIndex = index;
    const name = readTagName(text, index);
    if (name.isBad) return chokedFrom(startIndex, 'name', name);
    index = name.nextIndex;
    const tag = name.value;
    cast<ExtTag>(tag);
    switch (tag) {
        case '#EXT-X-VERSION': {
            const version = readExtXVersion(text, startIndex);
            if (version.isBad) return chokedFrom(startIndex, 'version', version);
            return capturedFrom(version.nextIndex, { kind: 'version' as const, version: version.value });
        }
        case '#EXT-X-MEDIA': {
            const media = readExtXMedia(text, startIndex);
            if (media.isBad) return chokedFrom(startIndex, 'media', media);
            return capturedFrom(media.nextIndex, { kind: 'media' as const, media: media.value });
        }
        case '#EXT-X-STREAM-INF': {
            const stream = readExtXSteamInfAndUrl(text, startIndex);
            if (stream.isBad) return chokedFrom(startIndex, 'stream', stream);
            return capturedFrom(stream.nextIndex, { kind: 'stream' as const, stream: stream.value });
        }
        default: {
            const unknown = readExtXUnknown(text, startIndex);
            if (unknown.isBad) return chokedFrom(startIndex, 'unknown', unknown);
            return capturedFrom(unknown.nextIndex, { kind: 'unknown' as const, unknown: unknown.value });
        }
    }
}

function readExtXUnknown(text: string, index: number) {
    const startIndex = index;
    const name = readTagName(text, index);
    if (name.isBad) return chokedFrom(startIndex, 'name', name);
    index = name.nextIndex;
    const rest = readLine(text, index);
    if (rest.isBad) return chokedFrom(startIndex, 'text', rest);
    index = rest.nextIndex;
    return capturedFrom(index, { name: name.value, text: rest.value });
}

function readTagName(text: string, index: number) {
    return readReg(text, index, /(#EXT-X[\w+-]+):/y, at1st);
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

    const tokens = readExtXStreamInfTokenList(text, index);
    if (tokens.isBad) return chokedFrom(startIndex, 'stream tokens', tokens);
    index = tokens.nextIndex;

    const draft: Partial<ExtXSteamInf> = {};
    for (const token of tokens.value) {
        switch (token.kind) {
            case 'bandwidth': draft.bandwidth = token.bandwidth; break;
            case 'codecs': draft.codecs = token.codecs; break;
            case 'resolution': draft.resolution = token.resolution; break;
            case 'frame-rate': draft.frameRate = token.frameRate; break;
            case 'closed-captions': draft.closedCaptions = token.closedCaptions; break;
            case 'name': draft.name = token.name; break;
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

    const tokens = readExtXMediaTokenList(text, index);
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

function readExtXMediaTokenList(text: string, index: number) {

    type NoDistributivity = ReturnType<typeof readExtXMediaToken> extends ParsedOrNot<infer M> ? Read<M> : never;
    const tokens = readList(text, index, readExtXMediaToken as NoDistributivity, readLitOver(','), readBr);
    return tokens;
}


function readExtXVersion(text: string, index: number) {
    const startIndex = index;
    const name = readReg(text, index, /#EXT-X-VERSION:/y, alwaysNull);
    if (name.isBad) return chokedFrom(startIndex, 'name', name);
    index = name.nextIndex;
    const value = readReg(text, index, /\d+/y, matched => {
        const text = at1st(matched);
        const version = parseInt(text, 10);
        return version;
    });
    if (value.isBad) return chokedFrom(startIndex, 'value', value);
    return value;
}

type ExtXMediaTokenName = 'TYPE' | 'GROUP-ID' | 'NAME' | 'URI';
function readExtXMediaToken(text: string, index: number) {
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

function readExtXStreamInfTokenList(text: string, index: number) {
    type NoDistributivity = ReturnType<typeof readExtXStreamInfToken> extends ParsedOrNot<infer M> ? Read<M> : never;
    const tokens = readList(text, index, readExtXStreamInfToken as NoDistributivity, readLitOver(','), readBr);
    return tokens;
}

type ExtXStreamInfTokenName = 'RESOLUTION' | 'BANDWIDTH' | 'CODECS' | 'FRAME-RATE' | 'CLOSED-CAPTIONS' | 'NAME';
function readExtXStreamInfToken(text: string, index: number) {
    const startIndex = index;

    const head = readReg(text, index, /([-\w]+)=/y, ([_, textToken]) => textToken);
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
        case 'FRAME-RATE': {
            const frameRate = readReg(text, index, /\d+(\.\d+)/y, atFull);
            if (frameRate.isBad) return chokedFrom(startIndex, 'frame-rate', frameRate);
            return capturedFrom(frameRate.nextIndex, { kind: 'frame-rate' as const, frameRate: frameRate.value });
        }
        case 'CLOSED-CAPTIONS': {
            const closedCaptions = readReg(text, index, /\w+/y, atFull);
            if (closedCaptions.isBad) return chokedFrom(startIndex, 'closed-captions', closedCaptions);
            return capturedFrom(closedCaptions.nextIndex, { kind: 'closed-captions' as const, closedCaptions: closedCaptions.value });
        }
        case 'NAME': {
            const name = readQuotedString(text, index);
            if (name.isBad) return chokedFrom(startIndex, 'name', name);
            return capturedFrom(name.nextIndex, { kind: 'name' as const, name: name.value });
        }
        default: return otherwise(token, chokedFrom(startIndex, `Unexpected token: ${token}`));
    }
}



if (window.sandbox === 'reading-m3u8') {

    const channel = new BroadcastChannel('debug');
    console.log('listening for hls-url\'s...');
    channel.addEventListener('message', x => {
        if (x.data.topic === 'hls-url') {
            console.warn(x.data.hlsUrl);
        }
    });


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
        let text = `#EXTM3U
#EXT-X-VERSION:6
#EXT-X-MOUFLON:PSCH:v1:Zokee2OhPh9kugh4
#EXT-X-STREAM-INF:BANDWIDTH=1766195,CODECS="avc1.64001f,mp4a.40.2",RESOLUTION=720x960,FRAME-RATE=30.000,CLOSED-CAPTIONS=NONE,NAME="source"
https://media-hls.doppiocdn.com/b-hls-14/84207531/84207531.m3u8
`;
        diagnose(read_m3u8, text, 0, false);
    }
    {
        let text = `#EXTM3U
#EXT-X-VERSION:5
#EXT-X-STREAM-INF:BANDWIDTH=1500000,NAME="720p 1.5mbps",LANGUAGE="en-us",CODECS="avc1.4d401f,mp4a.40.02",RESOLUTION=1280x720
chunklist_rOPd19i1560_session91717477_b1500000.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1000000,NAME="360p 1.0mbps",LANGUAGE="en-us",CODECS="avc1.4d401f,mp4a.40.02",RESOLUTION=640x360
chunklist_ra23a4E56jh_session91717477_b1000000.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=500000,NAME="180p 500kbps",LANGUAGE="en-us",CODECS="avc1.4d400a,mp4a.40.02",RESOLUTION=320x180
chunklist_rAg0a80ac4F_session91717477_b500000.m3u8
`;
        diagnose(read_m3u8, text, 0, true);
    }
/*
    {
        let text = `#EXTM3U
#EXT-X-VERSION:5
#EXT-X-STREAM-INF:BANDWIDTH=1500000,NAME="720p 1.5mbps",LANGUAGE="en-us",CODECS="avc1.4d401f,mp4a.40.02",RESOLUTION=1280x720
chunklist_rOPd19i1560_session91717477_b1500000.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1000000,NAME="360p 1.0mbps",LANGUAGE="en-us",CODECS="avc1.4d401f,mp4a.40.02",RESOLUTION=640x360
chunklist_ra23a4E56jh_session91717477_b1000000.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=500000,NAME="180p 500kbps",LANGUAGE="en-us",CODECS="avc1.4d400a,mp4a.40.02",RESOLUTION=320x180
chunklist_rAg0a80ac4F_session91717477_b500000.m3u8
`;
        diagnose(read_m3u8, text, 0, true);
    }
*/
}
