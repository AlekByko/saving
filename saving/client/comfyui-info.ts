import { keysOf } from '../shared/core';

interface CuiBase {
    _meta: {
        title: string;
    };
}

export interface CuiEmptyHunyuanLatentVideo extends CuiBase {
    class_type: 'EmptyHunyuanLatentVideo';
    inputs: {
        width: number;
        height: number;
        length: number;
        batch_size: number;
    }
}

export interface CuiCLIPTextEncode extends CuiBase {
    class_type: 'CLIPTextEncode';
    inputs: {
        clip: any;
        text: string;
    };
}

export type CuiNode = CuiCLIPTextEncode | CuiEmptyHunyuanLatentVideo | CuiKSamplerAdvanced;

export type CuiWorkflow = { [id: number]: CuiNode; }

export interface CuiKSamplerAdvanced extends CuiBase {
    class_type: 'KSamplerAdvanced';
    inputs: {
        noise_seed: number;
        cfg: number;
        // add_noise: "enable";
        // steps: 4;
        // sampler_name: "euler";
        // scheduler: "simple";
        // start_at_step: 0;
        // end_at_step: 2;
        // return_with_leftover_noise: "enable";
    },

}

export function findNodesAllThat<T extends CuiNode>(
    workflow: CuiWorkflow,
    seeIfItIs: (value: CuiNode) => value is T,
): T[] {
    const keys = keysOf(workflow);
    const result: T[] = [];
    for (const key of keys) {
        const node = workflow[key];
        const isIt = seeIfItIs(node);
        if (isIt) {
            result.push(node);
        } else {
            continue;
        }
    }
    return result;
}

export function findFirstNodeThatOr<T extends CuiNode, Or>(
    workflow: CuiWorkflow,
    seeIfItIs: (value: CuiNode) => value is T,
    or: Or,
) {
    const keys = keysOf(workflow);
    for (const key of keys) {
        const node = workflow[key];
        const isIt = seeIfItIs(node);
        if (isIt) {
            return node;
        }
    }
    return or;
}
