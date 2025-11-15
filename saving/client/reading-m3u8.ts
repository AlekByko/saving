import { alwaysNull, broke, cast, isUndefined, otherwise } from '../shared/core';
import { ExtXMedia, ExtXSteamInf, M3U8 } from '../shared/m3u8';
import { atFirst, atFull, capturedFrom, chokedFrom, diagnose, ParsedOrNot, Read, readLitOver, readReg } from '../shared/reading-basics';
import { readList } from '../shared/reading-list';
import { readQuotedString } from '../shared/reading-quoted-string';


function readLine(text: string, index: number) {
    return readReg(text, index, /.+/y, ([full]) => full);
}
function readBrs(text: string, index: number) {
    return readReg(text, index, /(\r?\n)+/y, alwaysNull);
}
function readBr(text: string, index: number) {
    return readReg(text, index, /(\r?\n)/y, alwaysNull);
}
export function readM3U8(text: string, index: number) {

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
            case 'independent-segments': draft.isIndependentSegments = true; break;
            case 'unknown': draft.unknown.push(tag.unknown); break;
            case 'mouflon': draft.mouflon = tag.mouflon; break;
            default: return broke(tag);
        }
    }
    const { media, streams, ...rest } = draft;
    const result: M3U8 = { ...rest, streams, media };
    return capturedFrom(index, result);
}

type ExtTagName =
    | '#EXT-X-STREAM-INF'
    | '#EXT-X-MEDIA'
    | '#EXT-X-VERSION'
    | '#EXT-X-MOUFLON'
    | '#EXT-X-INDEPENDENT-SEGMENTS';

function readTagBlock(text: string, index: number) {
    const startIndex = index;
    const name = readTagName(text, index);
    if (name.isBad) return chokedFrom(startIndex, 'name', name);
    index = name.nextIndex;
    const tag = name.value;
    cast<ExtTagName>(tag);
    switch (tag) {
        case '#EXT-X-VERSION': {
            const version = readExtXVersion(text, startIndex);
            if (version.isBad) return chokedFrom(startIndex, 'version', version);
            return capturedFrom(version.nextIndex, { kind: 'version' as const, version: version.value });
        }
        case '#EXT-X-MOUFLON': {
            const mouflon = readExtXMouflon(text, startIndex);
            if (mouflon.isBad) return chokedFrom(startIndex, 'mouflon', mouflon);
            return capturedFrom(mouflon.nextIndex, { kind: 'mouflon' as const, mouflon: mouflon.value });
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
        case '#EXT-X-INDEPENDENT-SEGMENTS': {
            // flag tag, if present then true, no value
            return capturedFrom(name.nextIndex, { kind: 'independent-segments' as const });
        }
        default: {
            const nomore: never = tag; void nomore;

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
    return readReg(text, index, /(#EXT-X[\w+-]+):?/y, atFirst);
}

function readExtXSteamInfAndUrl(text: string, index: number) {

    const startIndex = index;

    const attrs = readExtXSteamInf(text, index);
    if (attrs.isBad) return chokedFrom(startIndex, 'STREAM-INF', attrs);
    index = attrs.nextIndex;

    let br = readBr(text, index);
    if (br.isBad) return chokedFrom(startIndex, 'br', br);
    index = br.nextIndex;

    const url = readLine(text, index);
    if (url.isBad) return chokedFrom(startIndex, 'URL', url);
    index = url.nextIndex;

    return capturedFrom(index, { ...attrs.value, url: url.value });
}

function readExtXSteamInf(text: string, index: number) {
    const startIndex = index;

    const prefix = readReg(text, index, /#EXT-X-STREAM-INF:/y, x => x);
    if (prefix.isBad) return chokedFrom(startIndex, 'prefix', prefix);
    index = prefix.nextIndex;

    const attrs = readExtXStreamInfAttrList(text, index);
    if (attrs.isBad) return chokedFrom(startIndex, 'stream attrs', attrs);
    index = attrs.nextIndex;

    const draft: Partial<ExtXSteamInf> = {};
    for (const attr of attrs.value) {
        switch (attr.kind) {
            case 'bandwidth': draft.bandwidth = attr.bandwidth; break;
            case 'average-bandwidth': draft.averageBandwidth = attr.averageBandwidth; break;
            case 'codecs': draft.codecs = attr.codecs; break;
            case 'resolution': draft.resolution = attr.resolution; break;
            case 'frame-rate': draft.frameRate = attr.frameRate; break;
            case 'closed-captions': draft.closedCaptions = attr.closedCaptions; break;
            case 'name': draft.name = attr.name; break;
            case 'language': draft.language = attr.language; break;
            default: return broke(attr);
        }
    }

    const { bandwidth, resolution, ...rest } = draft;
    if (isUndefined(bandwidth)) return chokedFrom(startIndex, 'no bandwidth');
    if (isUndefined(resolution)) return chokedFrom(startIndex, 'no resolution');
    const result: ExtXSteamInf = { bandwidth, resolution, ...rest, url: '' };
    return capturedFrom(index, result);
}


function readExtXMedia(text: string, index: number) {
    const startIndex = index;
    // #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",NAME="English",URI="audio_eng.m3u8"
    const title = readReg(text, index, /#EXT-X-MEDIA:/y, alwaysNull);
    if (title.isBad) return chokedFrom(startIndex, 'title', title);
    index = title.nextIndex;

    const attrs = readExtXMediaAttrList(text, index);
    if (attrs.isBad) return chokedFrom(startIndex, 'media attrs', attrs);
    index = attrs.nextIndex;

    const draft: Partial<ExtXMedia> = {};
    for (const attr of attrs.value) {
        switch (attr.kind) {
            case 'type': draft.type = attr.type; break;
            case 'group-id': draft.groupId = attr.groupId; break;
            case 'name': draft.name = attr.name; break;
            case 'uri': draft.uri = attr.uri; break;
            default: return broke(attr);
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

function readExtXMediaAttrList(text: string, index: number) {

    type NoDistributivity = ReturnType<typeof readExtXMediaAttr> extends ParsedOrNot<infer M> ? Read<M> : never;
    const attrs = readList(text, index, readExtXMediaAttr as NoDistributivity, readLitOver(','), readBr);
    return attrs;
}


function readExtXVersion(text: string, index: number) {
    const startIndex = index;
    const name = readReg(text, index, /#EXT-X-VERSION:/y, alwaysNull);
    if (name.isBad) return chokedFrom(startIndex, 'name', name);
    index = name.nextIndex;
    const value = readReg(text, index, /\d+/y, ([full]) => {
        const version = parseInt(full, 10);
        return version;
    });
    if (value.isBad) return chokedFrom(startIndex, 'value', value);
    return value;
}


function readExtXMouflon(text: string, startIndex: number) {
    let index = startIndex;
    // #EXT-X-MOUFLON:PSCH:v1:Zokee2OhPh9kugh4
    const name = readReg(text, index, /#EXT-X-MOUFLON:/y, alwaysNull);
    if (name.isBad) return chokedFrom(startIndex, 'name', name);
    index = name.nextIndex;

    const psch = readReg(text, index, /PSCH:([0-9a-z]+)/y, atFirst);
    if (psch.isBad) return chokedFrom(startIndex, 'psch', psch);
    index = psch.nextIndex;

    const pkey = readReg(text, index, /:([0-9a-zA-Z]+)/y, atFirst);
    if (pkey.isBad) return chokedFrom(startIndex, 'key', pkey);
    index = pkey.nextIndex;

    return capturedFrom(index, { psch: psch.value, pkey: pkey.value });
}

type ExtXMediaAttrName = 'TYPE' | 'GROUP-ID' | 'NAME' | 'URI';
function readExtXMediaAttr(text: string, index: number) {
    const startIndex = index;
    const head = readReg(text, index, /([\w-]+)=/y, ([_, textToken]) => textToken);
    if (head.isBad) return head;
    index = head.nextIndex;
    const attr = head.value;
    cast<ExtXMediaAttrName>(attr);
    switch (attr) {
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
        default: return otherwise(attr, chokedFrom(startIndex, `bad media attr: ${attr}`));
    }
}

function readExtXStreamInfAttrList(text: string, index: number) {
    type NoDistributivity = ReturnType<typeof readExtXStreamInfAttr> extends ParsedOrNot<infer M> ? Read<M> : never;
    const attrs = readList(text, index, readExtXStreamInfAttr as NoDistributivity, readLitOver(','), readBr);
    return attrs;
}

type ExtXStreamInfAttrName =
    | 'RESOLUTION' | 'BANDWIDTH' | 'CODECS'
    | 'FRAME-RATE' | 'CLOSED-CAPTIONS' | 'NAME'
    | 'LANGUAGE' | 'AVERAGE-BANDWIDTH';
function readExtXStreamInfAttr(text: string, index: number) {
    const startIndex = index;

    const head = readReg(text, index, /([-\w]+)=/y, atFirst);
    if (head.isBad) return head;
    index = head.nextIndex;

    const name = head.value;
    cast<ExtXStreamInfAttrName>(name);
    switch (name) {
        case 'BANDWIDTH': {
            const bandwidth = readReg(
                text, index, /(\d+)/y,
                ([_, textBandwidth]) => parseInt(textBandwidth, 10),
            );
            if (bandwidth.isBad) return chokedFrom(startIndex, 'bandwidth', bandwidth);
            return capturedFrom(bandwidth.nextIndex, { kind: 'bandwidth' as const, bandwidth: bandwidth.value });
        }
        case 'AVERAGE-BANDWIDTH': {
            const averageBandwidth = readReg(
                text, index, /(\d+)/y,
                ([_, textBandwidth]) => parseInt(textBandwidth, 10),
            );
            if (averageBandwidth.isBad) return chokedFrom(startIndex, 'average-bandwidth', averageBandwidth);
            return capturedFrom(averageBandwidth.nextIndex, { kind: 'average-bandwidth' as const, averageBandwidth: averageBandwidth.value });
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
        case 'LANGUAGE': {
            const language = readQuotedString(text, index);
            if (language.isBad) return chokedFrom(startIndex, 'language', language);
            return capturedFrom(language.nextIndex, { kind: 'language' as const, language: language.value });
        }
        default: return otherwise(name, chokedFrom(startIndex, `Unexpected token: ${name}`));
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
        const text = `
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-MOUFLON:PSCH:v1:Zokee2OhPh9kugh4
#EXT-X-STREAM-INF:BANDWIDTH=2318131,CODECS="avc1.4d601f,mp4a.40.2",RESOLUTION=720x960,FRAME-RATE=25.000,CLOSED-CAPTIONS=NONE,NAME="960p"
https://media-hls.doppiocdn.net/b-hls-22/90030055/90030055_960p.m3u8?playlistType=lowLatency
#EXT-X-STREAM-INF:BANDWIDTH=1284096,CODECS="avc1.4d6016,mp4a.40.2",RESOLUTION=360x480,FRAME-RATE=25.000,CLOSED-CAPTIONS=NONE,NAME="480p"
https://media-hls.doppiocdn.net/b-hls-22/90030055/90030055_480p.m3u8?playlistType=lowLatency
#EXT-X-STREAM-INF:BANDWIDTH=643174,CODECS="avc1.4d600d,mp4a.40.2",RESOLUTION=180x240,FRAME-RATE=25.000,CLOSED-CAPTIONS=NONE,NAME="240p"
https://media-hls.doppiocdn.net/b-hls-22/90030055/90030055_240p.m3u8?playlistType=lowLatency
#EXT-X-STREAM-INF:BANDWIDTH=315392,CODECS="avc1.4d600c,mp4a.40.2",RESOLUTION=120x160,FRAME-RATE=25.000,CLOSED-CAPTIONS=NONE,NAME="160p"
https://media-hls.doppiocdn.net/b-hls-22/90030055/90030055_160p.m3u8?playlistType=lowLatency
`.trim();
        diagnose(readM3U8, text, 0, true);
    }

    {
        const text = `
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
`.trim();
        diagnose(readM3U8, text, 0, false);
    }

    {
        let text = `#EXTM3U
#EXT-X-VERSION:6
#EXT-X-MOUFLON:PSCH:v1:Zokee2OhPh9kugh4
#EXT-X-STREAM-INF:BANDWIDTH=1766195,CODECS="avc1.64001f,mp4a.40.2",RESOLUTION=720x960,FRAME-RATE=30.000,CLOSED-CAPTIONS=NONE,NAME="source"
https://media-hls.doppiocdn.com/b-hls-14/84207531/84207531.m3u8
`;
        diagnose(readM3U8, text, 0, false);
    }
    {
        const text = `#EXTM3U
#EXT-X-VERSION:5
#EXT-X-STREAM-INF:BANDWIDTH=1500000,NAME="720p 1.5mbps",LANGUAGE="en-us",CODECS="avc1.4d401f,mp4a.40.02",RESOLUTION=1280x720
chunklist_rOPd19i1560_session91717477_b1500000.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1000000,NAME="360p 1.0mbps",LANGUAGE="en-us",CODECS="avc1.4d401f,mp4a.40.02",RESOLUTION=640x360
chunklist_ra23a4E56jh_session91717477_b1000000.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=500000,NAME="180p 500kbps",LANGUAGE="en-us",CODECS="avc1.4d400a,mp4a.40.02",RESOLUTION=320x180
chunklist_rAg0a80ac4F_session91717477_b500000.m3u8
`;
        diagnose(readM3U8, text, 0, false);
    }
    {
        const text = `#EXTM3U
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=1810000,BANDWIDTH=2260000,RESOLUTION=1280x720,FRAME-RATE=30.000,CODECS="avc1.42c01f,mp4a.40.2",CLOSED-CAPTIONS=NONE
https://streaming-edge-front.livemediahost.com/edge2-cad/cam_obs/rocket-flu_v1/tracks-v2a2/index.ll.m3u8?filter.tracks=v4v3v2v1a1a2&multitrack=true&token=eyJpdiI6IkpJZGJGcHZwSlJZaHltenhhTXpJZ2c9PSIsInZhbHVlIjoiaFRPMzBuYkpuXC9uWmt1Mm90RGFPM1E9PSIsIm1hYyI6IjI3ZjgzYmU3ZWE0ZjRkMmY2Nzk3ZjNhNDgwZGYwMWE2OGZiY2U3ZWE0NzhhNjU2ZDFjZWUxNjdiMWUxNjI2NTEifQ%3D%3D
#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=340000,BANDWIDTH=420000,RESOLUTION=426x240,FRAME-RATE=30.000,CODECS="avc1.42c01f,mp4a.40.2",CLOSED-CAPTIONS=NONE
https://streaming-edge-front.livemediahost.com/edge2-cad/cam_obs/rocket-flu_v1/tracks-v1a2/index.ll.m3u8?filter.tracks=v4v3v2v1a1a2&multitrack=true&token=eyJpdiI6IkpJZGJGcHZwSlJZaHltenhhTXpJZ2c9PSIsInZhbHVlIjoiaFRPMzBuYkpuXC9uWmt1Mm90RGFPM1E9PSIsIm1hYyI6IjI3ZjgzYmU3ZWE0ZjRkMmY2Nzk3ZjNhNDgwZGYwMWE2OGZiY2U3ZWE0NzhhNjU2ZDFjZWUxNjdiMWUxNjI2NTEifQ%3D%3D
`;
        diagnose(readM3U8, text, 0, false);
    }
}
