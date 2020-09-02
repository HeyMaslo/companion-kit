import { DocumentPresentationType } from 'common/models';

const SupportedAudio = ['.mp3', '.m4a', '.wav'];
const SupportedImages = ['.png', '.jpeg', '.jpg', '.gif', '.svg'];
const SupportedVideo = ['.webm', '.mpeg', '.mp4', '.avi', '.mov', '.flv', '.swf', '.ogg'];
const SupportedDocuments = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.key', '.keynote', '.pages', '.txt', '.odt', '.rtf', '.tex', '.wks', '.wps', '.wpd', '.xls', '.xlsx', '.numbers', '.csv'];

export function getFileExtension(file: File): string {
    const filename = file.name;
    const lastDot = filename.lastIndexOf('.');

    return filename.substring(lastDot);
}

export function fileTypeByExtension(ext: string): DocumentPresentationType {
    if (SupportedAudio.indexOf(ext) !== -1 || SupportedVideo.indexOf(ext) !== -1) {
        return DocumentPresentationType.media;
    } else if (SupportedImages.indexOf(ext) !== -1) {
        return DocumentPresentationType.image;
    } else if (SupportedDocuments.indexOf(ext) !== -1) {
        return DocumentPresentationType.document;
    }

    return DocumentPresentationType.other;
}

export function getFilename(file: File) {
    const lastDot = file.name.lastIndexOf('.');
    return lastDot > -1 ? file.name.substring(0, lastDot) : file.name;
}

function validateFileExtension(file: File, whitelist: string[]): boolean {
    const ext = getFileExtension(file);
    return whitelist.indexOf(ext) !== -1;
}

export function validateAudioExtension(file: File): boolean {
    return validateFileExtension(file, SupportedAudio);
}

export function validateImageExtension(file: File): boolean {
    return validateFileExtension(file, SupportedImages);
}
