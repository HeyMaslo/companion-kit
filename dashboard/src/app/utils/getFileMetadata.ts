import { AudioMetadata, DocumentMeta } from 'common/models';
import logger from 'common/logger';
import { getFileExtension } from 'app/helpers/files';

export async function getAudioMetadata(file: File): Promise<AudioMetadata> {
    const result: AudioMetadata = {
        format: 'MP3',
        bytesSize: file.size,
        duration: 0,
        lang: 'en-US',
        sampleRate: 44100,
    };

    const url = window.URL.createObjectURL(file);
    const audio = new Audio(url);
    const untilLoads = new Promise(resolve => {
        audio.oncanplay = e => {
            result.duration = audio.duration;

            audio.oncanplay = null;
            audio.onerror = null;

            audio.src = '#';
            audio.load();

            resolve();
        };

        audio.onerror = e => {
            logger.warn('Failed to properly get audio metadata, error:', e);
            resolve();
        };
    });

    await untilLoads;

    window.URL.revokeObjectURL(url);

    return result;
}

export async function getDocumentMetadata(file: File): Promise<DocumentMeta> {
    return {
        format: getFileExtension(file).replace('.', ''),
        bytesSize: file.size,
        mimeType: file.type,
    };
}
