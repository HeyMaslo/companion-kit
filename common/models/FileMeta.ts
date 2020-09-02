
export type AudioFormat = 'PCM' | 'MP3';

export type AudioMetadata = {
    format: AudioFormat;
    sampleRate: number;
    duration: number;
    bytesSize: number;
    speakers?: 'one' | 'two',
    lang?: 'en-US';
    cacheControl?: string,
};

export type ImageMetadata = {
    width: number,
    height: number,
    bytesSize: number,
    cacheControl?: string,
};

export type DocumentMeta = {
    format: string,
    mimeType: string,
    bytesSize: number,
};

export enum DocumentPresentationType {
    'document',
    'media',
    'image',
    'other',
    'link',
}

export type FileReference<TMeta> = {
    storageRef: string,
    meta: TMeta,
};

export type ImageReference = FileReference<ImageMetadata>;
