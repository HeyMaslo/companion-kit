import ffmpeg, { ffprobe } from 'fluent-ffmpeg';
import * as Stream from 'stream';
import * as FS from 'fs';
import { AudioRMSAnalyzer } from './audio.rms';

import { waitForStreamEndAsync } from './streamHelper';

// tslint:disable-next-line: no-var-requires
const ffmpeg_static = require('ffmpeg-static');
// tslint:disable-next-line: no-var-requires
const ffprobe_static = require('ffprobe-static');

// import { createLogger } from 'common/logger';
// const logger = createLogger('[AudioUtils]');

// logger.warn('FFMPEG STATIC', ffmpeg_static);
// logger.warn('FFPROBE STATIC', ffprobe_static.path);

ffmpeg.setFfmpegPath(ffmpeg_static);
ffmpeg.setFfprobePath(ffprobe_static.path);

export type AudioFormatData = {
    size: number,
    duration: number,
    channels: number,
    sampleRate: number,
    formatName: string,

    raw?: any;
};

export function getMetadataAsync(srcPath: string): Promise<AudioFormatData> {
    return new Promise((resolve, reject) => {
        ffprobe(srcPath, (err, data) => {
            if (!data) {
                reject(err || new Error('getMetadataAsync: Unknown error (got empt data)'));
                return;
            }

            const audioStream = data.streams[0];

            const res: AudioFormatData =  {
                size: data.format.size,
                duration: data.format.duration,
                sampleRate: audioStream.sample_rate,
                channels: audioStream.channels,
                formatName: data.format.format_name,

                raw: data,
            };

            resolve(res);
        });
    });
}

export function createConvertStreamAsync(source: string | Stream.Readable, format: 'mp3' | 's16le', quality = 5, codec: 'pcm_s16le' = null) {
    const cmd = ffmpeg(source)
        .audioQuality(quality == null ? 5 : quality)
        .outputFormat(format);

    if (codec) {
        cmd.audioCodec(codec);
    }

    return cmd.pipe() as Stream.PassThrough;
}

export async function getPeaksAsync(source: string | Stream.Readable, channelsNumber: 1 | 2 = 2): Promise<number[][]> {

    const samples: number[][] = [ [] ];
    if (channelsNumber === 2) {
        samples[1] = [];
    }

    await processAudioAsync(source, channelsNumber, (v, c) => {
        samples[c].push(v);
    });

    return samples;

}

function processAudioAsync(source: string | Stream.Readable, channelsNumber: 1 | 2 = 2, processSample: (v: number, c: number) => void): Promise<void> {
    if (channelsNumber !== 1 && channelsNumber !== 2) {
        throw new Error('Channels number must be 1 or 2');
    }

    return new Promise((resolve, reject) => {
        const sourceStream = createConvertStreamAsync(source, 's16le', 5, 'pcm_s16le');

        let channel = 0;

        const AMPL = (2 ** 16) / 2;

        const addSample = (s: number) => {
            const normalized = s / AMPL;
            // samples[channel].push(normalized);
            processSample(normalized, channel);
            // swap channel
            channel = ++channel % channelsNumber;
        };

        let oddByte: number = null;

        sourceStream.on('data', (data: Buffer) => {
            let i = 0;
            const dataLen = data.length;

            // If there is a leftover byte from the previous block, combine it with the
            // first byte from this block
            if (oddByte !== null) {
                const value = ((data.readInt8(i++) << 8) | oddByte);
                addSample(value);
            }

            for (; i < dataLen; i += 2) {
                const value = data.readInt16LE(i);
                addSample(value);
            }

            oddByte = (i < dataLen) ? data.readUInt8(i) : null;
        });

        sourceStream.on('end', () => {
            resolve();
        });
        sourceStream.on('error', reject);
    });
}

export async function getRMSAsync(source: string | Stream.Readable, channelsNumber: 1 | 2 = 2): Promise<number> {
    const analyzer = new AudioRMSAnalyzer();
    analyzer.setChannelsNumber(channelsNumber);

    await processAudioAsync(source, channelsNumber, (v, c) => {
        analyzer.addValue(v, c);
    });

    const rms = analyzer.finalize().result;
    return rms;
}

export function convertToMp3(source: string | Stream.Readable, destination: Stream.Writable, quality = 5): Promise<void> {
    const converted = createConvertStreamAsync(source, 'mp3', quality);
    converted.pipe(destination, { end: true });

    return waitForStreamEndAsync(converted);
}

function testAudioConvertAsync(inputPath: string, outputPath: string) {
    return new Promise(resolve => {
        const destination = FS.createWriteStream(outputPath);
        const source = createConvertStreamAsync(inputPath, 'mp3');

        source.pipe(destination, { end: true });

        source.on('end', () => {

            const stats = FS.statSync(outputPath);

            resolve(stats);
        });
    });
}
