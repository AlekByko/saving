// @ts-nocheck

// <script src="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.15.1/dist/ort.min.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/opencv.js-webassembly@4.2.0/opencv.min.js"></script>

// https://github.com/Cvartel/Open-Source-Face-SDK/tree/main/sdk
import { isNull } from './shared/core';

declare var ort: any;
declare var cv: any;

const detectionModelURL = 'face_detector/face.onnx';
const nmsModelURL = 'face_detector/nms.onnx';

const modelInputShape = [1, 3, 384, 640];
const topk = 100;
const iouThreshold = 0.5;
const nmsThreshold = 0.0;
const confThreshold = 0.3;

var detectorInferenceSession: {
    run(images: any): Promise<{
        output: any;
    }>;
};
var nmsInferenceSession: {
    run(args: {
        detection: unknown,
        config: unknown,
    }): Promise<{
        selected_idx: {
            data: {
                forEach: (callback: (idx: number) => void) => void;
            };
        };
    }>;
};

async function initialise_models() {
    detectorInferenceSession = await ort.InferenceSession.create(detectionModelURL);
    nmsInferenceSession = await ort.InferenceSession.create(nmsModelURL);
};

interface Box {
    label: string;
    probability: number;
    bounding: [x1: number, y1: number, width: number, height: number];
};

function renderBoxes(canvas: HTMLCanvasElement, boxes: Box[]) {
    const ctx = canvas.getContext("2d");
    if (isNull(ctx)) return;

    boxes.forEach(box => {
        const color = "#FF3838";
        const [x1, y1, width, height] = box.bounding;
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(Math.min(ctx.canvas.width, ctx.canvas.height) / 200, 2.5);
        ctx.strokeRect(x1, y1, width, height);
    });
};

async function detectImage(
    canvas: HTMLCanvasElement,
    topk: number,
    iouThreshold: number,
    nmsThreshold: number,
    confThreshold: number,
    inputShape: number[],
) {
    const modelWidth = inputShape[3];
    const modelHeight = inputShape[2];
    // read, pad and resize image for inference
    const mat = cv.imread(canvas);
    var matC3 = new cv.Mat(mat.rows, mat.cols, cv.CV_8UC3);
    cv.cvtColor(mat, matC3, cv.COLOR_RGBA2BGR);

    var scale = 1;
    var dh = 0;
    var dw = 0;
    if (modelHeight / modelWidth > mat.rows / mat.cols) {
        scale = mat.cols / modelWidth;
        dh = (mat.cols * modelHeight) / modelWidth - mat.rows;
    } else {
        scale = mat.rows / modelHeight;
        dw = (mat.rows * modelWidth) / modelHeight - mat.cols;
    }
    const top = Math.floor(dh / 2);
    const bottom = Math.floor(dh - top);
    const left = Math.floor(dw / 2);
    const right = Math.floor(dw - left);
    const matPad = new cv.Mat();
    cv.copyMakeBorder(matC3, matPad, top, bottom, left, right, cv.BORDER_CONSTANT, [0, 0, 0, 127]);
    const input = cv.blobFromImage(
        matPad,
        1 / 255.0,
        new cv.Size(modelWidth, modelHeight),
        new cv.Scalar(0, 0, 0),
        true,
        false
    );

    // inference and NMS
    const tensor = new ort.Tensor("float32", input.data32F, inputShape);
    const config = new ort.Tensor("float32", new Float32Array([topk, iouThreshold, nmsThreshold]));
    const { output } = await detectorInferenceSession.run({ images: tensor });
    const { selected_idx } = await nmsInferenceSession.run({ detection: output, config: config });

    // postprocess results
    const boxes: Box[] = [];
    selected_idx.data.forEach(idx => {
        const data = output.data.slice(idx * output.dims[2], (idx + 1) * output.dims[2]);
        const [x, y, w, h] = data.slice(0, 4);
        const confidence = data[4];

        if (confidence >= confThreshold)
            boxes.push({
                label: 'person',
                probability: confidence,
                bounding: [
                    Math.floor((x - 0.5 * w) * scale) - left,
                    Math.floor((y - 0.5 * h) * scale) - top,
                    Math.floor(w * scale),
                    Math.floor(h * scale),
                ],
            });
    });

    renderBoxes(canvas, boxes);

    mat.delete();
    matC3.delete();
    matPad.delete();
    input.delete();
};

initialise_models();

function run() {
    let imgInput = document.getElementById('image_form');
    if (isNull(imgInput)) return;
    imgInput.addEventListener('change', async function (e) {
        if (e.target.files.length < 0) return;
        let imageFile = e.target.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onloadend = function (e) {
            var uploadImage = new Image();
            uploadImage.src = e.target.result;
            uploadImage.onload = function (ev) {
                const canvasElement = document.getElementById("canvas") as HTMLCanvasElement | null;
                if (isNull(canvasElement)) return;
                const context = canvasElement.getContext("2d");
                if (isNull(context)) return;
                canvasElement.width = uploadImage.width;
                canvasElement.height = uploadImage.height;
                context.drawImage(uploadImage, 0, 0);
                // let imgData = canvasElement.toDataURL("image/jpeg", 0.75);
                detectImage(canvasElement, topk, iouThreshold, nmsThreshold, confThreshold, modelInputShape);
            }
        }
    });
}
run();

let closeInput = document.getElementById('close_btn');
closeInput.addEventListener("click", function (e) {
    canvasTag = document.getElementById('canvas');
    context = canvasTag.getContext("2d")
    context.clearRect(0, 0, canvasTag.offsetWidth, canvasTag.offsetHeight)
});
