import { willPost } from './ajaxing';

interface FaceDetectionRequest {
    base64: string;
}
type Boundary = [x1: number, y1: number, x2: number, y2: number];
type Embedding = number[];
interface DetectedFace {
    box: Boundary;
    embedding: Embedding;
}
interface FaceDetectionResponse {
    faces: DetectedFace[];
}
const hostAndPort = '192.168.0.52:8000';
export async function willDetectFace(image: HTMLImageElement) {
    const url = `http://${hostAndPort}/detect-face`;

    const base64 = getBase64(image);
    const request: FaceDetectionRequest = { base64 };
    const response: FaceDetectionResponse = await willPost(url, request);
    return response;
}

function getBase64(imgage: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    canvas.width = imgage.naturalWidth;
    canvas.height = imgage.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(imgage, 0, 0);
    const url = canvas.toDataURL('image/png');
    const base64 = url.split(',')[1];
    return base64;
}
