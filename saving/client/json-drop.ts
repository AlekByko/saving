import { isNull } from '../shared/core';
import { parseJsonOr } from './reading-from-file-handles';
import { willGetFileHandlePermittedOr, willSaveFile } from './reading-writing-files';

/** Abstraction for something stored in the file system. */
export class JsonDrop<Json extends object> {

    constructor(
        private handle: FileSystemFileHandle,
    ) { }

    async willSave(json: Json) {
        const text = JSON.stringify(json, null, 4);
        const wasSaved = await willSaveFile(
            this.handle, text
        );
        return wasSaved;
    }

    async willLoad() {
        const file = await this.handle.getFile();
        const text = await file.text();
        const json = parseJsonOr<Json, undefined>(text, undefined);
        return json;
    }

    static async willTryMake(
        dir: FileSystemDirectoryHandle,
        filename: string,
    ) {
        const file = await willGetFileHandlePermittedOr(dir, filename, true, null);
        if (isNull(file)) return null;
        return new JsonDrop(file);
    }
}
