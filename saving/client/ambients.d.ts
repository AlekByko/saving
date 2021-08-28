declare const FaceDetector: {
    new(options: {
        maxDetectedFaces?: number;
        fastMode?: boolean;
    }): FaceDetector;
};
interface DetectedFace {
    boundingBox: DOMRectReadOnly;
    landmarks: unknown[];
}
interface FaceDetector {
    detect(sourface: any): Promise<DetectedFace[]>;
}
interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
    showOpenFilePicker(): Promise<FileSystemFileHandle>;
}

type FileSystemHandle = FileSystemDirectoryHandle | FileSystemFileHandle;
type FileSystemPermissionMode = 'read' | 'readwrite';
interface QueryPemissionsOptions {
    mode: FileSystemPermissionMode;
}
type RequestPermissionsOptions = QueryPemissionsOptions;
type QueryPermissionsResult = 'granted' | 'prompt';
type RequestPermissionsResult = QueryPermissionsResult;
interface FileSystemHandleBase {
    isSameEntry(): any;
    queryPermission(options: QueryPemissionsOptions): Promise<QueryPermissionsResult>;
    requestPermission(options: RequestPermissionsOptions): Promise<RequestPermissionsResult>;
}
interface GetFileHandleOptions { create: boolean; }
interface RemoveEntryOptions { recursive: boolean; }
interface FileSystemDirectoryHandle extends FileSystemHandleBase {
    kind: 'directory';
    name: string;
    getDirectoryHandle(options: GetFileHandleOptions): Promise<FileSystemDirectoryHandle>;
    getFileHandle(name: string, options?: GetFileHandleOptions): Promise<FileSystemFileHandle | null>;
    keys(): any;
    values(): AsyncIterableIterator<FileSystemHandle>;
    removeEntry(name: string, options?: RemoveEntryOptions): any;
    resolve(): any;
}
interface FileSystemWritableFileStream {
    write(content: any): Promise<void>;
    close(): Promise<void>;
}
interface FileSystemFileHandle extends FileSystemHandleBase {
    kind: 'file';
    name: string;
    getFile(): any;
    createWritable(): FileSystemWritableFileStream;
}
interface FileSystemGetFileOptions {
    create?: boolean;
}
type USVString = string;

