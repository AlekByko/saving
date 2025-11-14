import { isNull, isUndefined } from '../shared/core';
import { parseJsonOr } from './reading-from-file-handles';
import { willGetFileHandlePermittedOr, willGetSubdirAndFilename, willSaveFile } from './reading-writing-files';

/** Abstraction for something stored in the file system. */
export function thusJsonDrop<Json extends object>(defaults: {
    makeDefault?: () => Json;
}) {

    async function willLoad(handle: FileSystemFileHandle) {
        const file = await handle.getFile();
        const text = await file.text();
        const json = parseJsonOr<Json, undefined>(text, undefined);
        return json;
    }

    return class JsonDrop {

        constructor(
            public data: Json,
            public dir: FileSystemDirectoryHandle,
            public file: FileSystemFileHandle,
        ) { }

        async willSave(json: Json) {
            this.data = json;
            const text = JSON.stringify(json, null, 4);
            const wasSaved = await willSaveFile(
                this.file, text
            );
            return wasSaved;
        }

        static async willTryMake(
            dir: FileSystemDirectoryHandle,
            subpath: string,
        ) {
            const sub = await willGetSubdirAndFilename(dir, subpath);
            if (isNull(sub)) return null;
            const { fileDir, fileName } = sub;
            const file = await willGetFileHandlePermittedOr(fileDir, fileName, true, null);
            if (isNull(file)) return null;
            const data = await willLoad(file);

            if (isUndefined(data)) {
                if (isUndefined(defaults.makeDefault)) return null;
                const made = defaults.makeDefault();
                const json = JSON.stringify(made, null, 4);
                await willSaveFile(file, json);
                return new JsonDrop(made, fileDir, file)
            } else {
                return new JsonDrop(data, fileDir, file);
            }
        }

    };

}
