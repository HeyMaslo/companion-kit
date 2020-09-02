import * as Stream from 'stream';

export function waitForStreamEndAsync(stream: Stream.Readable | Stream.Writable) {
    return new Promise<void>((resolve, reject) => {
        stream.on('error', reject);
        stream.on('end', resolve);
    });
}
