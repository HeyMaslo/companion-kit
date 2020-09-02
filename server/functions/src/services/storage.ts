import * as admin from 'firebase-admin';

const storage = admin.storage();

export const bucket = storage.bucket();

export default storage;

export function createDownloadStream(fileStorageId: string) {
    const fileRef = storage.bucket().file(fileStorageId);
    const downloadStream = fileRef.createReadStream();
    return downloadStream;
}

export function createUploadStream(fileStorageId: string, contentType: string) {
    const fileRef = storage.bucket().file(fileStorageId);

    const uploadStream = fileRef.createWriteStream({
        contentType: contentType,
        resumable: false,
        predefinedAcl: 'bucketOwnerFullControl',
    });
    return uploadStream;
}

export async function checkExists(fileStorageId: string) {
    const fileRef = storage.bucket().file(fileStorageId);
    const [res] = await fileRef.exists();

    return res;
}