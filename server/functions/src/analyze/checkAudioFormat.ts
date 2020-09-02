import { getMetadataAsync, convertToMp3, AudioFormatData } from 'server/utils/audio.ffmpeg';
import { createLogger } from 'common/logger';
import { AudioFormat } from 'common/models';
import { setTimeoutAsync } from 'common/utils/async';
import { TemporaryFile } from 'server/utils/tempFile';

const logger = createLogger('[prepareAudioAsync]');

export type AudioResultFormat = { names: string[], gapiType: AudioFormat };
export type CheckFormatResult = null | {
    resultFile: TemporaryFile,
    resultFormat: AudioResultFormat,
    isConverted?: boolean,
};

export class AudioFile extends TemporaryFile<AudioFormatData> { }

const SupportedFormats: AudioResultFormat[] = [
    { names: [ 'mp3' ], gapiType: 'MP3' },
    // { names: [ 'm4a' ], gapiType: 'MP3' },
];

const ConvertedFormat: AudioResultFormat = { names: ['mp3'], gapiType: 'MP3' };

export async function prepareAudioAsync(fileStorageId: string): Promise<CheckFormatResult> {
    try {
        const originalFile = new AudioFile(fileStorageId, false, true);
        const convertedFile = new AudioFile(fileStorageId + '_converted.mp3', false, false);

        // converted file may exist already (such as repeated processing)
        await convertedFile.checkIsRemote(true);

        if (convertedFile.isRemote) {
            await convertedFile.download();

            return {
                resultFile: convertedFile,
                resultFormat: ConvertedFormat,
                isConverted: true,
            };
        }

        // check original for necessity of conversion

        await originalFile.download();

        const metadata = await getMetadataAsync(originalFile.localPath);
        originalFile.metadata = metadata;
        convertedFile.metadata = metadata; // TODO this is not accurate because file has changed in terms of size and possibly sampleRate

        const supportedFormat = SupportedFormats.find(sf => sf.names.some(sfn => metadata.formatName.includes(sfn)));
        if (supportedFormat) {
            // original is OK – use it in further processing

            logger.log(originalFile.name, 'has already supported format:', metadata.formatName, ' => ', supportedFormat.gapiType);
            return {
                resultFile: originalFile,
                resultFormat: supportedFormat,
            };
        }

        // prepare upload and save to local
        const convertDestinationStream = convertedFile.createUploadAndWriteStream('audio/mpeg');

        await convertToMp3(originalFile.localPath, convertDestinationStream);

        logger.log(originalFile.name, 'converted to mp3:', convertedFile.remotePath);

        // ensure file exists in remote storage. IT SHOULD BE!
        let triesCount = 10;
        let exists = false;
        do {
            await setTimeoutAsync(1000);
            exists = await convertedFile.checkIsRemote(true);
            triesCount--;
        } while (!exists && triesCount > 0);

        logger.log(`Ensure exists: has tried ${5 - triesCount}, exists = ${exists}`);

        if (!exists) {
            throw new Error('Converted file still doesn\'t exist!!!');
        }

        return {
            resultFormat: ConvertedFormat,
            resultFile: convertedFile,
            isConverted: true,
        };

    } catch (err) {
        logger.error('prepareAudioAsync ERROR:', err);
        return null;
    }
}
