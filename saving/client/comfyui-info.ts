interface ACuiBase {
    _meta: {
        title: string;
    };
}

export interface ACuiEmptyHunyuanLatentVideo extends ACuiBase {
    class_type: 'EmptyHunyuanLatentVideo';
    inputs: {
        width: number;
        height: number;
        length: number;
        batch_size: number;
    }
}

export interface ACuiCLIPTextEncode extends ACuiBase {
    class_type: 'CLIPTextEncode';
    inputs: {
        clip: any;
        text: string;
    };
}

export type ACuiNode = ACuiCLIPTextEncode | ACuiEmptyHunyuanLatentVideo;

export type ACuiWorkflow = { [id: number]: ACuiNode; }
