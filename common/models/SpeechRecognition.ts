import Long from 'long';

export namespace GoogleProtobuf {

    export type Duration = {
        seconds?: number | Long | string,
        nanos?: number,
    };

    export namespace Duration {
        function toNumber(n: number | Long | string) {
            if (typeof n === 'string') {
                // TODO Parse?
                return 0;
            }

            return typeof n === 'number'
                ? n
                : n.toNumber();
        }

        export function toSeconds(d: Duration): number {
            if (!d) {
                return 0;
            }

            let res = (d.nanos || 0) / (1000 * 1000 * 1000);

            if (d.seconds) {
                res += toNumber(d.seconds);
            }

            return res;
        }
    }
}

export namespace SpeechRecognition {
    export type Alternative = {
        transcript: string,
        confidence: number,
        words: Word[],
    };

    export type Word = {
        word: string,
        startTime: number,
        endTime: number,
    };

    export type Result = {
        alternatives: Alternative[];
    };

    export function getSpeakTime(result: Result) {
        const alt = result.alternatives[0];

        const totalDuration = (alt.words || []).reduce((sum, w) => {
            return sum + w.endTime - w.startTime;
        }, 0);

        return totalDuration;
    }

    export function getTotalSpeakTime(results: Result[], duration: number) {
        const precision = 0.1;

        let speakTime = 0;
        for (let i = 0; i <= duration; i += precision) {
            const hasAWord = results.some(r => {
                const alt = r.alternatives.find(a => a.confidence > 0);
                return alt && alt.words && alt.words.some(w => i >= w.startTime && i <= w.endTime);
            });
            if (hasAWord) {
                speakTime += precision;
            }
        }
        return {
            absolute: speakTime,
            relative: duration > 0 ? speakTime / duration : 0,
        };
    }

    export function visualizeSpeech(result: Result, duration: number) {
        const alt = result.alternatives[0];
        const arr: (string | boolean)[] = [];
        arr.length = Math.ceil(duration * 10);
        for (let i = 0; i < arr.length; ++i) {
            arr[i] = false;
        }

        alt.words.forEach(w => {
            const s = Math.floor(w.startTime * 10);
            const e = Math.ceil(w.endTime * 10);

            arr[s] = w.word;
            for (let i = s + 1; i < e; ++i) {
                arr[i] = '1';
            }
        });

        return arr.map(a => a || '0')
            .join(' ') + '\r\n' + alt.transcript;
    }

    export function merge(results: Result[]) {
        return results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
    }

    export function getEffectiveChannelsCount(results: Result[]): number {
        return results.reduce((count, res) => {
            if (res.alternatives.some(a => a.confidence > 0)) {
                return count + 1;
            }
            return count;
        }, 0);
    }
}

export namespace SpeechRecognitionGoogle {
    export type Alternative = {
        transcript?: string,
        confidence?: number,
        words?: Word[],
    };

    export type Word = {
        word?: string,
        startTime?: GoogleProtobuf.Duration,
        endTime?: GoogleProtobuf.Duration,
    };

    export namespace Word {
        export function toLight(w: Word): SpeechRecognition.Word {
            return {
                word: w.word,
                startTime: GoogleProtobuf.Duration.toSeconds(w.startTime),
                endTime: GoogleProtobuf.Duration.toSeconds(w.endTime),
            };
        }
    }

    export type Result = {
        alternatives?: Alternative[];
    };

    export namespace Result {
        export function toLight(r: Result): SpeechRecognition.Result {
            return {
                alternatives: (r.alternatives || []).map((a: Alternative) => (<SpeechRecognition.Alternative>{
                    transcript: a.transcript,
                    confidence: a.confidence,
                    words: (a.words || []).map(w => Word.toLight(w)),
                })),
            };
        }
    }
}
