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

type FileSystemPermissionMode = 'read' | 'readwrite';
interface QueryPemissionsOptions {
    mode: FileSystemPermissionMode;
}
type RequestPermissionsOptions = QueryPemissionsOptions;
type QueryPermissionsResult = 'granted' | 'prompt';
type RequestPermissionsResult = QueryPermissionsResult;
interface GetFileHandleOptions { create: boolean; }
interface RemoveEntryOptions { recursive: boolean; }
interface FileSystemDirectoryHandle {
    [Symbol.asyncIterator](): AsyncIterableIterator<[string, FileSystemHandle]>;
    readonly kind: 'directory';
    name: string;
    getDirectoryHandle(name: string, options?: GetFileHandleOptions): Promise<FileSystemDirectoryHandle | null>;
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
interface FileSystemHandle {
    queryPermission(options: QueryPemissionsOptions): Promise<QueryPermissionsResult>;
    requestPermission(options: RequestPermissionsOptions): Promise<RequestPermissionsResult>;
}
interface FileSystemFileHandle {
    readonly kind: 'file';
    name: string;
    getFile(): Promise<File>;
    createWritable(): Promise<FileSystemWritableFileStream>;
}
interface FileSystemGetFileOptions {
    create?: boolean;
}
type USVString = string;

interface Window {
    sandbox: string;
}
interface ForEachable<T> {
    forEach(xx: (value: T) => void): void;
}

type Act = () => void;
type Use<T> = (value: T) => void;
type WillAct = () => Promise<void>;
type WillUse<T> = (value: T) => Promise<void>;
type Sorting<T> = (values: T[]) => T[];
type Germinate<T> = (value: T, imda: ImageData) => void;
